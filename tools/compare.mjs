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

const OUT_BASE =
  process.env.SHOOT_OUT_DIR ||
  'C:\\Users\\reeja\\AppData\\Local\\Temp\\claude\\c--arohance-projects-Arohance-new-website\\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\\scratchpad\\shots';

const SLUGS = ['home', 'about', 'services', 'studio', 'careers', 'contact', 'case-study'];

// A "small tolerance" per the brief: rendering paths differ (the originals
// render through an extra wrapper the port does not have — see brief — and
// subpixel font metrics can vary a point or two), so a handful of pixels is
// noise, not a finding. Anything past this is reported.
const GEOMETRY_TOLERANCE_PX = 4;

// Task 9 fix-round regression guard: `archivoWdthAxis.ratio` (see
// tools/shoot.mjs's measureFontAxis) is ~1.9 when the Archivo variable
// font's `wdth` axis is actually in effect (measured against the original:
// narrow ~1314px, wide ~2507px at 'wdth' 62 vs 125), and ~1.0 when a static
// font instance silently ignores the axis -- the exact, previously-silent
// failure mode this project already shipped once (next/font/google given
// an explicit `weight` array serves static instances with no `wdth` axis
// at all). 1.3 sits with wide margin on both sides of that gap.
const FONT_AXIS_RATIO_MIN = 1.3;

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

  if (o.__missing || p.__missing) {
    if (o.__missing) lines.push(`MISSING: original JSON not found at ${o.__file}`);
    if (p.__missing) lines.push(`MISSING: port JSON not found at ${p.__file}`);
    return { slug, lines, diffCount: lines.length };
  }
  if (o.ok === false || p.ok === false) {
    if (o.ok === false) lines.push(`ORIGINAL FAILED TO LOAD/CAPTURE: ${o.error}`);
    if (p.ok === false) lines.push(`PORT FAILED TO LOAD/CAPTURE: ${p.error}`);
    return { slug, lines, diffCount: lines.length };
  }

  let diffCount = 0;
  const add = (line) => {
    lines.push(line);
    diffCount++;
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
    add(`body background-color differs: original=${o.bodyBackgroundColor} port=${p.bodyBackgroundColor}`);
  }

  if (o.text !== p.text) {
    const d = textDiff(o.text || '', p.text || '');
    add(
      `text differs (original ${d.aLen} chars, port ${d.bLen} chars, common prefix ${d.prefixLen} chars)\n` +
        `      original ...${JSON.stringify(d.aMiddle)}...\n` +
        `      port     ...${JSON.stringify(d.bMiddle)}...`,
    );
  }

  return { slug, lines, diffCount };
}

/** Regression guard, independent of the per-page diff loop above: does the
 * Archivo variable font's `wdth` axis actually render, on EACH target,
 * measured directly rather than inferred from a config file. A target
 * that silently reverts to static font instances must fail this loudly,
 * not show up as 22 unexplained geometry deltas again. */
function checkFontAxis(slug) {
  const o = load('original', slug);
  const p = load('port', slug);
  if (o.__missing || p.__missing || o.ok === false || p.ok === false) {
    return { slug, ok: false, reason: 'page data unavailable (see per-page section above)' };
  }
  const oAxis = o.archivoWdthAxis;
  const pAxis = p.archivoWdthAxis;
  if (!oAxis || !pAxis) {
    return { slug, ok: false, reason: 'archivoWdthAxis missing from captured JSON — re-shoot with the current tools/shoot.mjs' };
  }
  const problems = [];
  if (!(oAxis.ratio >= FONT_AXIS_RATIO_MIN)) {
    problems.push(`original ratio ${oAxis.ratio?.toFixed(3)} < ${FONT_AXIS_RATIO_MIN} (narrow=${oAxis.narrowPx?.toFixed(1)}px wide=${oAxis.widePx?.toFixed(1)}px) — reference itself looks static; check the capture`);
  }
  if (!(pAxis.ratio >= FONT_AXIS_RATIO_MIN)) {
    problems.push(`port ratio ${pAxis.ratio?.toFixed(3)} < ${FONT_AXIS_RATIO_MIN} (narrow=${pAxis.narrowPx?.toFixed(1)}px wide=${pAxis.widePx?.toFixed(1)}px) — the 'wdth' axis is NOT taking effect; likely reverted to a static font instance (e.g. next/font given an explicit weight array instead of axes:['wdth'])`);
  }
  return { slug, ok: problems.length === 0, reason: problems.join('; '), oAxis, pAxis };
}

const pageSummaries = SLUGS.map(comparePage);
const fontAxisResults = SLUGS.map(checkFontAxis);
let totalDiffs = 0;

console.log(`Fidelity comparison at width ${width} (geometry tolerance +/-${GEOMETRY_TOLERANCE_PX}px)`);
console.log(`reading from: ${outBase}\n`);

for (const { slug, lines, diffCount } of pageSummaries) {
  console.log(`## ${slug} — ${diffCount} difference(s)`);
  if (lines.length === 0) {
    console.log('  (no differences found)');
  } else {
    for (const l of lines) console.log(`  - ${l}`);
  }
  console.log('');
  totalDiffs += diffCount;
}

console.log(`TOTAL: ${totalDiffs} difference(s) across ${pageSummaries.length} pages`);

console.log(`\n## Font variable-width axis regression guard (Archivo 'wdth', threshold ratio >= ${FONT_AXIS_RATIO_MIN})`);
const fontAxisFailures = fontAxisResults.filter((r) => !r.ok);
for (const r of fontAxisResults) {
  if (r.ok) {
    console.log(`  PASS ${r.slug} (original ratio ${r.oAxis.ratio.toFixed(3)}, port ratio ${r.pAxis.ratio.toFixed(3)})`);
  } else {
    console.log(`  FAIL ${r.slug}: ${r.reason}`);
  }
}
if (fontAxisFailures.length > 0) {
  console.log(`\n*** FONT AXIS REGRESSION: ${fontAxisFailures.length}/${fontAxisResults.length} page(s) failed. ***`);
  process.exitCode = 1;
}

if (totalDiffs > 0) process.exitCode = 1;
