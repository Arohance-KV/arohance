// tools/mobile-audit.mjs — Task 10 (mobile responsive) breakage report.
//
// Reads the `breakage` field tools/shoot.mjs's collectBreakage() writes into
// every captured JSON record (any target, any width) and prints a grouped,
// human-readable report for one target at one width: page-level overflow,
// elements extending past the viewport edge, clipped/overlapping text,
// sub-40x40 tap targets, and sub-12px text.
//
// This is deliberately separate from tools/compare.mjs, which stays
// untouched: compare.mjs is the desktop byte-identical gate (original vs
// port at 1440), or a straightforward correctness oracle at any single
// width. This script's job is different in kind -- there is no "original"
// reference worth diffing against at a mobile width (it has zero responsive
// breakpoints and was never made to work on a phone), so it reports
// absolute-threshold breakage on ONE target, not a diff between two.
//
// Usage:
//   node tools/mobile-audit.mjs <width> [target] [outBase]
//
// target defaults to "port" (the thing this task fixes); outBase defaults
// to the same scratch directory shoot.mjs writes to (override with the
// SHOOT_OUT_DIR environment variable, same as shoot.mjs/compare.mjs).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const OUT_BASE = process.env.SHOOT_OUT_DIR || join(tmpdir(), 'arohance-fidelity-shots');

const SLUGS = ['home', 'about', 'services', 'studio', 'careers', 'contact', 'case-study'];

const [, , width, targetArg, outBaseArg] = process.argv;
if (!width) {
  console.error('usage: node tools/mobile-audit.mjs <width> [original|port] [outBase]');
  process.exit(1);
}
const target = targetArg || 'port';
const outBase = outBaseArg || OUT_BASE;

function load(slug) {
  const file = join(outBase, target, String(width), `${slug}.json`);
  if (!existsSync(file)) return { __missing: true, __file: file };
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Collapses repeated instances of the same shape (e.g. 13 client-logo
 * cells, or 6 accordion rows) into one line with a count, so the report
 * stays readable -- while keeping genuinely distinct issues on their own
 * line. Groups by selector with any `:nth-of-type(n)`/array index stripped,
 * plus the rounded magnitude, since that is exactly what makes N copies of
 * the same component read as "the same finding" rather than N findings. */
function group(items, magnitudeKey) {
  const buckets = new Map();
  for (const item of items) {
    const genericSelector = item.selector.replace(/\[data-[a-z-]+="[^"]*"\]/gi, (m) =>
      // keep the attribute NAME (structurally meaningful) but drop the
      // per-instance VALUE (e.g. distinct testimonial names/quotes)
      m.replace(/="[^"]*"/, ''),
    );
    const mag = magnitudeKey ? Math.round(item[magnitudeKey]) : 0;
    const key = `${genericSelector}::${mag}`;
    if (!buckets.has(key)) buckets.set(key, { ...item, count: 0 });
    buckets.get(key).count++;
  }
  return Array.from(buckets.values()).sort((a, b) => b.count - a.count);
}

function reportPage(slug) {
  const r = load(slug);
  if (r.__missing) {
    console.log(`## ${slug} — MISSING: ${r.__file}`);
    return { slug, counts: null };
  }
  if (r.ok === false) {
    console.log(`## ${slug} — FAILED TO CAPTURE: ${r.error}`);
    return { slug, counts: null };
  }
  const b = r.breakage;
  if (!b) {
    console.log(`## ${slug} — no breakage field in captured JSON (re-shoot with the current tools/shoot.mjs)`);
    return { slug, counts: null };
  }

  const pageOverflow = b.pageOverflowPx > 0;
  const overflowing = group(b.overflowingElements, 'overflowPx');
  const clipped = group(b.clippedText, 'overflowPx');
  const smallTargets = group(b.smallTapTargets);
  const smallFont = group(b.smallFontText, 'fontSizePx');

  const total = (pageOverflow ? 1 : 0) + overflowing.length + clipped.length + smallTargets.length + smallFont.length;
  console.log(`## ${slug} @ ${b.viewportWidth}px — ${total} distinct finding(s)`);

  if (pageOverflow) {
    console.log(`  [page overflow] documentElement.scrollWidth exceeds clientWidth by ${b.pageOverflowPx}px`);
  } else {
    console.log('  [page overflow] none (scrollWidth === clientWidth)');
  }

  if (overflowing.length === 0) {
    console.log('  [beyond viewport] none');
  } else {
    for (const o of overflowing) {
      console.log(
        `  [beyond viewport] ${o.selector}  overflow=${o.overflowPx}px  rect(left=${o.rect.left},right=${o.rect.right},w=${o.rect.width})` +
          (o.count > 1 ? `  x${o.count}` : '') + (o.text ? `  "${o.text}"` : ''),
      );
    }
  }

  if (clipped.length === 0) {
    console.log('  [clipped/overlapping text] none');
  } else {
    for (const c of clipped) {
      console.log(
        `  [clipped/overlapping text] ${c.selector}  scrollWidth=${c.scrollWidth} clientWidth=${c.clientWidth} (+${c.overflowPx}px)` +
          (c.count > 1 ? `  x${c.count}` : '') + (c.text ? `  "${c.text}"` : ''),
      );
    }
  }

  if (smallTargets.length === 0) {
    console.log('  [tap target < 40x40] none');
  } else {
    for (const t of smallTargets) {
      console.log(
        `  [tap target < 40x40] ${t.selector}  ${t.width}x${t.height}px` +
          (t.count > 1 ? `  x${t.count}` : '') + (t.text ? `  "${t.text}"` : ''),
      );
    }
  }

  if (smallFont.length === 0) {
    console.log('  [font-size < 12px] none');
  } else {
    for (const f of smallFont) {
      console.log(
        `  [font-size < 12px] ${f.selector}  ${f.fontSizePx}px` +
          (f.count > 1 ? `  x${f.count}` : '') + (f.text ? `  "${f.text}"` : ''),
      );
    }
  }

  console.log('');
  return {
    slug,
    counts: {
      pageOverflow: pageOverflow ? 1 : 0,
      overflowing: overflowing.length,
      clipped: clipped.length,
      smallTargets: smallTargets.length,
      smallFont: smallFont.length,
    },
  };
}

console.log(`Mobile breakage audit — target=${target} width=${width}`);
console.log(`reading from: ${outBase}\n`);

const results = SLUGS.map(reportPage);

let grand = 0;
console.log('## Summary');
for (const { slug, counts } of results) {
  if (!counts) {
    console.log(`  ${slug}: (unavailable)`);
    continue;
  }
  const sum = counts.pageOverflow + counts.overflowing + counts.clipped + counts.smallTargets + counts.smallFont;
  grand += sum;
  console.log(
    `  ${slug}: ${sum} (page-overflow=${counts.pageOverflow} beyond-viewport=${counts.overflowing} ` +
      `clipped-text=${counts.clipped} small-tap-targets=${counts.smallTargets} small-font=${counts.smallFont})`,
  );
}
console.log(`\nTOTAL distinct findings across ${SLUGS.length} pages: ${grand}`);

if (grand > 0) process.exitCode = 1;
