// tools/compare.mjs — reads the two JSON sets `tools/shoot.mjs` produces for
// a given width (one per target: "original" and "port") and reports, page
// by page: text content that differs, landmarks present in one and missing
// in the other, and geometry that differs by more than a small tolerance.
//
// Usage:
//   node tools/compare.mjs <width> [outBase]
//
// outBase defaults to the same scratch directory shoot.mjs writes to
// (override with the SHOOT_OUT_DIR environment variable, same as shoot.mjs).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Portable default (Task 9 fix-round 7): matches tools/shoot.mjs's own
// default exactly, so a bare `node tools/compare.mjs <width>` (no env var,
// no outBase arg) reads back what a bare `node tools/shoot.mjs` just wrote,
// on any machine or in CI -- not just the one developer's session-scratch
// path this used to hardcode.
const OUT_BASE = process.env.SHOOT_OUT_DIR || join(tmpdir(), 'arohance-fidelity-shots');

const SLUGS = ['home', 'about', 'services', 'studio', 'careers', 'contact', 'case-study'];

// A "small tolerance" per the brief: rendering paths differ (the originals
// render through an extra wrapper the port does not have — see brief — and
// subpixel font metrics can vary a point or two), so a handful of pixels is
// noise, not a finding. Anything past this is reported.
const GEOMETRY_TOLERANCE_PX = 4;

// Task 9 fix-round 4 regression guard, replacing the two synthetic-element
// checks this file used to run (checkFontAxis, checkBodyFont — both
// measured an off-DOM test span, not the page's own markup, which is
// exactly the blind spot that let the hashed-name mismatch ship: the
// synthetic span could set `fontFamily` to the literal string 'Archivo'
// and get a real result even while every actual h1 on the page never
// resolved that name at all). See `fontProofs` in tools/shoot.mjs's
// measureRealFontProofs: three elements that already exist in the
// converted markup, one per self-hosted family. A real element's
// rendered box (width AND height, since a wrong font can wrap text onto a
// different number of lines rather than just render narrower) must match
// the original's within a small tolerance — the same reasoning as
// GEOMETRY_TOLERANCE_PX, just scoped to these three specific elements.
// Tightened from 2px to 1px in fix round 7: a real secondary mechanism
// (Preflight's html line-height, fixed in round 5) produced a 1.8px
// residual on the JetBrains Mono proof mid-investigation that would have
// passed silently under a 2px tolerance. All three families now measure
// 0.0px with every root cause fixed, so a margin wide enough to have
// masked a defect actually found during this task serves no purpose.
const FONT_PROOF_TOLERANCE_PX = 1;

// Final fix wave, item 2: the known-acceptable set. The harness's own
// documented good state (README.md, "Verifying fidelity") is exactly 5
// differences at 1440, every one structurally unavoidable rather than a
// defect:
//
//   - 4 live clock/timer readings: a `[data-ag-clock]` wall clock (studio,
//     contact, case-study — `lib/behaviors/clock.ts`) and the homepage
//     showreel's `[data-vt-time]` counter (`lib/behaviors/reel.ts`) all
//     read the live system clock or a running timer. Two captures taken a
//     few seconds apart will never show the same value.
//   - 1 occluded `background-color`, on Contact: sits behind an
//     always-opaque foreground layer on both targets, so the value was
//     never visible to a user in either version.
//
// Before this fix, `compare.mjs` only ever compared the raw count (5) to a
// human's memory of the README — exiting 1 unconditionally whenever
// totalDiffs > 0, which is ALWAYS true on a perfect run, so the tool could
// never gate CI or a commit hook. Masking these two known shapes out of the
// comparison (rather than just special-casing "this page always has N
// diffs") means a genuine regression that happens to land in the same
// second as one of the four clock captures is still caught: everything
// outside the masked span still has to match exactly, and Contact getting
// a SECOND, different kind of diff (not just its background-color) still
// counts as residual.
const CLOCK_TEXT = /\d{2}:\d{2}:\d{2} IST/g; // lib/behaviors/clock.ts's `t + ' IST'`
const TIMER_TEXT = /\d{2}:\d{2} \/ \d{2}:\d{2}/g; // lib/behaviors/reel.ts's `fmt(...) + ' / ' + fmt(...)`

function maskVolatileText(s) {
  return s.replace(CLOCK_TEXT, '⁃clock⁃').replace(TIMER_TEXT, '⁃timer⁃');
}

const [, , width, outBaseArg] = process.argv;
if (!width) {
  console.error('usage: node tools/compare.mjs <width> [outBase]');
  process.exit(1);
}
const outBase = outBaseArg || OUT_BASE;

function load(target, slug) {
  const file = join(outBase, target, String(width), `${slug}.json`);
  if (!existsSync(file)) return { __missing: true, __file: file };
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Lightweight diff: strip the common prefix/suffix and show what's left in
 * the middle, with a little context either side. No new dependency, and
 * good enough to point a human at the right spot in a possibly-huge page
 * text dump rather than printing both dumps in full. */
function textDiff(a, b, ctx = 60) {
  let start = 0;
  const minLen = Math.min(a.length, b.length);
  while (start < minLen && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  return {
    prefixLen: start,
    aMiddle: a.slice(Math.max(start - ctx, 0), Math.min(endA + ctx, a.length)),
    bMiddle: b.slice(Math.max(start - ctx, 0), Math.min(endB + ctx, b.length)),
    aLen: a.length,
    bLen: b.length,
  };
}

function rectDiffers(r1, r2, tol) {
  if (!r1 || !r2) return true;
  return (
    Math.abs(r1.x - r2.x) > tol ||
    Math.abs(r1.y - r2.y) > tol ||
    Math.abs(r1.width - r2.width) > tol ||
    Math.abs(r1.height - r2.height) > tol
  );
}

function fmtRect(r) {
  return r ? `x=${r.x} y=${r.y} w=${r.width} h=${r.height}` : '(absent)';
}

function comparePage(slug) {
  const o = load('original', slug);
  const p = load('port', slug);
  const lines = [];
  // Lines NOT accounted for by the known-acceptable set (see above) — what
  // determines the exit code. A load/capture failure is never acceptable,
  // regardless of slug.
  const residualLines = [];

  if (o.__missing || p.__missing) {
    if (o.__missing) lines.push(`MISSING: original JSON not found at ${o.__file}`);
    if (p.__missing) lines.push(`MISSING: port JSON not found at ${p.__file}`);
    residualLines.push(...lines);
    return { slug, lines, diffCount: lines.length, residualLines, residualCount: residualLines.length };
  }
  if (o.ok === false || p.ok === false) {
    if (o.ok === false) lines.push(`ORIGINAL FAILED TO LOAD/CAPTURE: ${o.error}`);
    if (p.ok === false) lines.push(`PORT FAILED TO LOAD/CAPTURE: ${p.error}`);
    residualLines.push(...lines);
    return { slug, lines, diffCount: lines.length, residualLines, residualCount: residualLines.length };
  }

  let diffCount = 0;
  // `acceptable: true` marks a line as one of the two known-acceptable
  // shapes (see CLOCK_TEXT/TIMER_TEXT/maskVolatileText above) — it is still
  // pushed to `lines` and still counted in `diffCount` (the full list keeps
  // printing exactly as before), it just doesn't land in `residualLines`.
  const add = (line, { acceptable = false } = {}) => {
    lines.push(line);
    diffCount++;
    if (!acceptable) residualLines.push(line);
  };

  if (o.scrollWidth !== p.scrollWidth) add(`scrollWidth differs: original=${o.scrollWidth} port=${p.scrollWidth}`);
  if (o.clientWidth !== p.clientWidth) add(`clientWidth differs: original=${o.clientWidth} port=${p.clientWidth}`);

  for (const key of ['nav', 'header', 'footer']) {
    const lo = o.landmarks?.[key];
    const lp = p.landmarks?.[key];
    const presentO = !!lo?.present;
    const presentP = !!lp?.present;
    if (!presentO && !presentP) continue;
    if (presentO !== presentP) {
      add(`landmark "${key}" present in only one: original=${presentO} port=${presentP}`);
      continue;
    }
    if (rectDiffers(lo.rect, lp.rect, GEOMETRY_TOLERANCE_PX)) {
      add(`landmark "${key}" geometry differs: original[${fmtRect(lo.rect)}] port[${fmtRect(lp.rect)}]`);
    }
  }

  const oSections = new Map((o.landmarks?.sections || []).map((s) => [s.id, s.rect]));
  const pSections = new Map((p.landmarks?.sections || []).map((s) => [s.id, s.rect]));
  const allIds = new Set([...oSections.keys(), ...pSections.keys()]);
  for (const id of allIds) {
    const ro = oSections.get(id);
    const rp = pSections.get(id);
    if (ro && !rp) { add(`section#${id} present in original, missing in port`); continue; }
    if (!ro && rp) { add(`section#${id} present in port, missing in original`); continue; }
    if (rectDiffers(ro, rp, GEOMETRY_TOLERANCE_PX)) {
      add(`section#${id} geometry differs: original[${fmtRect(ro)}] port[${fmtRect(rp)}]`);
    }
  }

  if (!!o.h1 !== !!p.h1) {
    add(`h1 present in only one: original=${!!o.h1} port=${!!p.h1}`);
  } else if (o.h1 && p.h1) {
    if (o.h1.fontFamily !== p.h1.fontFamily) add(`h1 font-family differs: original="${o.h1.fontFamily}" port="${p.h1.fontFamily}"`);
    if (o.h1.fontSize !== p.h1.fontSize) add(`h1 font-size differs: original=${o.h1.fontSize} port=${p.h1.fontSize}`);
    if (o.h1.color !== p.h1.color) add(`h1 color differs: original=${o.h1.color} port=${p.h1.color}`);
    if (o.h1.text !== p.h1.text) add(`h1 text differs: original="${o.h1.text}" port="${p.h1.text}"`);
  }

  if (o.bodyBackgroundColor !== p.bodyBackgroundColor) {
    // Known-acceptable on Contact only, and ONLY for this exact, fixed pair
    // of CSS literals — re-review finding: `slug === 'contact'` alone was a
    // bare page-identity exemption, asymmetric with the rigour just below
    // (the text path requires the masked values to match exactly, not just
    // "this page is allowed to differ"). original=rgb(19, 17, 16) is
    // `Arohance Contact.html`'s own occluded `<body>` background;
    // port=rgb(12, 11, 10) is `app/globals.css`'s `body { background:
    // #0C0B0A }` — both fixed design constants, not measurements that can
    // legitimately vary run to run (unlike the clock/timer text), so they
    // are exactly as hardcodable as CLOCK_TEXT/TIMER_TEXT above. Gating on
    // the value pair (not just the slug) means ANY other original/port
    // pair on Contact — a real regression, whatever its value — is NOT
    // marked acceptable and surfaces as residual. Re-derive both literals
    // from a fresh capture (`node tools/shoot.mjs original/port 1440 900`)
    // if this page's design ever legitimately changes; do not loosen this
    // back to a bare slug check.
    //
    // Known harness limitation (not fixed here — out of scope for this
    // guard): `bodyBackgroundColor` only ever measures `<body>` itself,
    // never the opaque `[data-ag-root]` layer actually visible on top of
    // it. That visible layer is where a real, user-facing regression on
    // Contact would have to show up, and nothing in this harness measures
    // it — this line only ever catches a change to the hidden `<body>`
    // colour underneath. See README, "Verifying fidelity", for the
    // README-level note.
    const acceptable =
      slug === 'contact' &&
      o.bodyBackgroundColor === 'rgb(19, 17, 16)' &&
      p.bodyBackgroundColor === 'rgb(12, 11, 10)';
    add(`body background-color differs: original=${o.bodyBackgroundColor} port=${p.bodyBackgroundColor}`, {
      acceptable,
    });
  }

  if (o.text !== p.text) {
    const d = textDiff(o.text || '', p.text || '');
    // Known-acceptable only if masking out clock/timer text from BOTH full
    // texts makes them equal — i.e. the clock/timer is provably the ONLY
    // thing that differs. A real regression elsewhere in the page's text,
    // even one that happens to land on the same page/second as a clock
    // tick, leaves the masked texts unequal and is NOT marked acceptable.
    const acceptable = maskVolatileText(o.text || '') === maskVolatileText(p.text || '');
    add(
      `text differs (original ${d.aLen} chars, port ${d.bLen} chars, common prefix ${d.prefixLen} chars)\n` +
        `      original ...${JSON.stringify(d.aMiddle)}...\n` +
        `      port     ...${JSON.stringify(d.bMiddle)}...`,
      { acceptable },
    );
  }

  return { slug, lines, diffCount, residualLines, residualCount: residualLines.length };
}

const FONT_PROOF_FAMILIES = ['archivo', 'jetbrainsMono', 'instrumentSans'];

/** Regression guard: for each of the three self-hosted families, does the
 * REAL page element that uses it (not a synthetic test node) render at
 * the same size, on both targets? A family whose real name stops
 * resolving (wrong CSS, a reverted globals.css, a font file that failed
 * to ship) shows up here as that specific element's box no longer
 * matching the original's — the same signal a human would eventually
 * notice by eye, just automated. */
function checkFontProofs(slug) {
  const o = load('original', slug);
  const p = load('port', slug);
  if (o.__missing || p.__missing || o.ok === false || p.ok === false) {
    return { slug, ok: false, reason: 'page data unavailable (see per-page section above)' };
  }
  const oProofs = o.fontProofs;
  const pProofs = p.fontProofs;
  if (!oProofs || !pProofs) {
    return { slug, ok: false, reason: 'fontProofs missing from captured JSON — re-shoot with the current tools/shoot.mjs' };
  }
  const problems = [];
  const details = {};
  for (const family of FONT_PROOF_FAMILIES) {
    const of = oProofs[family];
    const pf = pProofs[family];
    if (!of || !pf) {
      problems.push(`${family}: real element not found on ${!of ? 'original' : 'port'}`);
      continue;
    }
    const widthDelta = Math.abs(of.width - pf.width);
    const heightDelta = Math.abs(of.height - pf.height);
    details[family] = { originalWidth: of.width, portWidth: pf.width, widthDelta, heightDelta };
    if (widthDelta > FONT_PROOF_TOLERANCE_PX || heightDelta > FONT_PROOF_TOLERANCE_PX) {
      problems.push(
        `${family} ("${of.text}"): rendered box differs beyond tolerance ` +
          `(width ${of.width.toFixed(1)}->${pf.width.toFixed(1)}px, height ${of.height.toFixed(1)}->${pf.height.toFixed(1)}px) ` +
          `— port computed font-family: "${pf.fontFamily}"`,
      );
    }
  }
  return { slug, ok: problems.length === 0, reason: problems.join('; '), details };
}

// Task 9 fix-round 5 regression guard: the root cause underneath all 24
// fix-round-4 survivors turned out to have nothing to do with fonts at
// all -- Tailwind Preflight sets `line-height:1.5` on <html>, which the
// original never had, so any element without its own explicit `leading-*`
// utility silently inherited 1.5 instead of the browser's native
// `normal`. The fix (globals.css's `html` rule now sets `line-height:
// normal` explicitly) is checked directly here, not just inferred from
// its symptoms: `htmlLineHeight` (tools/shoot.mjs) must read the literal
// string 'normal' on both targets. A reintroduced numeric value here
// (Preflight un-overridden, or the override accidentally removed) fails
// loudly by name, instead of reappearing as a wall of unrelated-looking
// geometry deltas for someone to re-diagnose from scratch a fourth time.
const HTML_LINE_HEIGHT_EXPECTED = 'normal';

function checkHtmlLineHeight(slug) {
  const o = load('original', slug);
  const p = load('port', slug);
  if (o.__missing || p.__missing || o.ok === false || p.ok === false) {
    return { slug, ok: false, reason: 'page data unavailable (see per-page section above)' };
  }
  const oValue = o.htmlLineHeight;
  const pValue = p.htmlLineHeight;
  if (oValue == null || pValue == null) {
    return { slug, ok: false, reason: 'htmlLineHeight missing from captured JSON — re-shoot with the current tools/shoot.mjs' };
  }
  const problems = [];
  if (oValue !== HTML_LINE_HEIGHT_EXPECTED) {
    problems.push(`original html line-height is "${oValue}", expected "${HTML_LINE_HEIGHT_EXPECTED}" — reference capture looks wrong, check it`);
  }
  if (pValue !== HTML_LINE_HEIGHT_EXPECTED) {
    problems.push(`port html line-height is "${pValue}", expected "${HTML_LINE_HEIGHT_EXPECTED}" — an inherited numeric line-height on <html> is back (Tailwind Preflight sets 1.5; globals.css must override it)`);
  }
  return { slug, ok: problems.length === 0, reason: problems.join('; '), oValue, pValue };
}

// Task 9 fix-round 6 regression guard, tightened in fix-round 7: a
// representative real form control (a <textarea>, present on 5 of the 7
// pages) must render at the same computed font-size AND font-family AND
// height as the original's. globals.css's own `input, textarea, button {
// font: inherit }` sat outside any @layer and unconditionally beat every
// Tailwind utility class regardless of specificity, silently resetting
// every form control's font-size (and the submit button's font-family)
// to the browser default -- deleted in favour of Preflight's own
// equivalent, correctly-layered reset. The round-6 version of this guard
// asserted only font-size: `tools/shoot.mjs` was already capturing
// `fontFamily` and `height` on this same element, interpolating
// fontFamily into the failure message without ever asserting it, and
// never reading height at all -- so a regression that changed the
// control's font *family* without changing its *size* (exactly the shape
// of the round-2 defect elsewhere in this project, where an ambiguous
// Tailwind arbitrary value resolved to the wrong CSS property) would have
// reported PASS. All three properties are asserted now.
const FORM_CONTROL_TOLERANCE_PX = 1;

function checkFormControlProof(slug) {
  const o = load('original', slug);
  const p = load('port', slug);
  if (o.__missing || p.__missing || o.ok === false || p.ok === false) {
    return { slug, ok: false, reason: 'page data unavailable (see per-page section above)' };
  }
  const of = o.formControlProof;
  const pf = p.formControlProof;
  if (!of && !pf) {
    return { slug, ok: true, reason: '', skipped: true };
  }
  if (!of || !pf) {
    return { slug, ok: false, reason: `real <textarea> present on only one target: original=${!!of} port=${!!pf}` };
  }
  const problems = [];
  const oSize = parseFloat(of.fontSize);
  const pSize = parseFloat(pf.fontSize);
  const sizeDelta = Math.abs(oSize - pSize);
  if (sizeDelta > FORM_CONTROL_TOLERANCE_PX) {
    problems.push(`font-size differs: original=${of.fontSize} port=${pf.fontSize} (Δ${sizeDelta.toFixed(1)}px)`);
  }
  if (of.fontFamily !== pf.fontFamily) {
    problems.push(`font-family differs: original="${of.fontFamily}" port="${pf.fontFamily}"`);
  }
  const heightDelta = Math.abs(of.height - pf.height);
  if (heightDelta > FORM_CONTROL_TOLERANCE_PX) {
    problems.push(`height differs: original=${of.height.toFixed(1)}px port=${pf.height.toFixed(1)}px (Δ${heightDelta.toFixed(1)}px)`);
  }
  if (problems.length > 0) {
    return { slug, ok: false, reason: problems.join('; ') };
  }
  return { slug, ok: true, reason: '', oSize, pSize, heightDelta };
}

const pageSummaries = SLUGS.map(comparePage);
const fontProofResults = SLUGS.map(checkFontProofs);
const htmlLineHeightResults = SLUGS.map(checkHtmlLineHeight);
const formControlResults = SLUGS.map(checkFormControlProof);
let totalDiffs = 0;
let totalResidual = 0;

console.log(`Fidelity comparison at width ${width} (geometry tolerance +/-${GEOMETRY_TOLERANCE_PX}px)`);
console.log(`reading from: ${outBase}\n`);

for (const { slug, lines, diffCount, residualCount } of pageSummaries) {
  console.log(`## ${slug} — ${diffCount} difference(s)`);
  if (lines.length === 0) {
    console.log('  (no differences found)');
  } else {
    for (const l of lines) console.log(`  - ${l}`);
  }
  console.log('');
  totalDiffs += diffCount;
  totalResidual += residualCount;
}

console.log(`TOTAL: ${totalDiffs} difference(s) across ${pageSummaries.length} pages`);

console.log(`\n## Real-element font rendering guard (Archivo h1, JetBrains Mono footer label, Instrument Sans paragraph; tolerance +/-${FONT_PROOF_TOLERANCE_PX}px)`);
const fontProofFailures = fontProofResults.filter((r) => !r.ok);
for (const r of fontProofResults) {
  if (r.ok) {
    const d = r.details;
    console.log(
      `  PASS ${r.slug} (archivo Δ${d.archivo.widthDelta.toFixed(1)}/${d.archivo.heightDelta.toFixed(1)}px, ` +
        `jetbrainsMono Δ${d.jetbrainsMono.widthDelta.toFixed(1)}/${d.jetbrainsMono.heightDelta.toFixed(1)}px, ` +
        `instrumentSans Δ${d.instrumentSans.widthDelta.toFixed(1)}/${d.instrumentSans.heightDelta.toFixed(1)}px)`,
    );
  } else {
    console.log(`  FAIL ${r.slug}: ${r.reason}`);
  }
}
if (fontProofFailures.length > 0) {
  console.log(`\n*** REAL FONT RENDERING REGRESSION: ${fontProofFailures.length}/${fontProofResults.length} page(s) failed. ***`);
  process.exitCode = 1;
}

console.log(`\n## html line-height guard (expected "${HTML_LINE_HEIGHT_EXPECTED}" on both targets)`);
const htmlLineHeightFailures = htmlLineHeightResults.filter((r) => !r.ok);
for (const r of htmlLineHeightResults) {
  if (r.ok) {
    console.log(`  PASS ${r.slug} (original "${r.oValue}", port "${r.pValue}")`);
  } else {
    console.log(`  FAIL ${r.slug}: ${r.reason}`);
  }
}
if (htmlLineHeightFailures.length > 0) {
  console.log(`\n*** HTML LINE-HEIGHT REGRESSION: ${htmlLineHeightFailures.length}/${htmlLineHeightResults.length} page(s) failed. ***`);
  process.exitCode = 1;
}

console.log(`\n## Form control guard (real <textarea>: font-size, font-family, height; tolerance +/-${FORM_CONTROL_TOLERANCE_PX}px)`);
const formControlFailures = formControlResults.filter((r) => !r.ok);
for (const r of formControlResults) {
  if (r.skipped) {
    console.log(`  SKIP ${r.slug} (no <textarea> on either target)`);
  } else if (r.ok) {
    console.log(`  PASS ${r.slug} (font-size ${r.oSize}px/${r.pSize}px, height Δ${r.heightDelta.toFixed(1)}px, font-family matches)`);
  } else {
    console.log(`  FAIL ${r.slug}: ${r.reason}`);
  }
}
if (formControlFailures.length > 0) {
  console.log(`\n*** FORM CONTROL REGRESSION: ${formControlFailures.length}/${formControlResults.length} page(s) failed. ***`);
  process.exitCode = 1;
}

// Final fix wave, item 2: the verdict. Before this, `if (totalDiffs > 0)
// process.exitCode = 1` exited 1 on the harness's own known-good state (5),
// so this tool could never gate CI or a commit hook — anyone wiring it up
// got a permanent red and reasonably concluded the harness itself was
// broken. The exit code now reflects `totalResidual`, not `totalDiffs`:
// classification happens per-line inside comparePage (above), so a
// residual count of 0 means every printed difference was independently
// verified to be one of the two known-acceptable shapes, not just that the
// total happens to still read 5. The full per-page list above is
// unchanged either way — only the verdict below is new. This line only
// ever SETS exitCode to 1, never resets it to 0, so a failure already
// flagged by one of the three regression guards above can't be silently
// cleared by a clean residual count here.
console.log(`\n## Verdict`);
console.log(`  ${totalDiffs} difference(s) total, ${totalDiffs - totalResidual} known-acceptable (live clock/timer text on [data-ag-clock]/[data-vt-time]; Contact's occluded body background-color), ${totalResidual} residual.`);
if (totalResidual > 0) {
  console.log(`\n*** ${totalResidual} RESIDUAL (unclassified) DIFFERENCE(S) — not part of the known-acceptable set: ***`);
  for (const { slug, residualLines } of pageSummaries) {
    for (const l of residualLines) console.log(`  - [${slug}] ${l}`);
  }
  process.exitCode = 1;
} else {
  console.log('  PASS — every difference is accounted for by the known-acceptable set.');
}
