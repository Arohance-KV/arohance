// px -> Tailwind spacing scale (4px == 1 unit). Values outside the scale
// fall through to an arbitrary value, which is exact either way.
const SPACING = {
  0: '0', 1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3',
  14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10',
  44: '11', 48: '12', 56: '14', 64: '16', 80: '20', 96: '24', 128: '32',
};

// Not a typo, do not "correct" this to a literal space or to `\_`. Tailwind
// decodes a `_` back into a literal space when it appears inside an
// arbitrary value's brackets — that is the documented, intentional escape
// mechanism (Tailwind's own class-name tokenizer splits on whitespace, so a
// literal space inside `[...]` would break the class apart; `\_` would just
// render as a literal underscore instead of a space). This is why, e.g.,
// `[font-family:'JetBrains_Mono',monospace]` compiles to
// `font-family:'JetBrains Mono',monospace` and correctly matches the
// self-hosted font's real name.
export const escapeValue = (v) => v.trim().replace(/\s+/g, '_');

const scale = (v) => {
  const t = v.trim();
  if (t === '0') return '0';
  const m = /^(\d+(?:\.\d+)?)px$/.exec(t);   // no leading sign: negatives fall through
  if (m) {
    const hit = SPACING[Number(m[1])];
    if (hit !== undefined) return hit;
  }
  return null;
};

// A length-valued property: try the spacing scale, else arbitrary.
const len = (prefix) => (v) => {
  const s = scale(v);
  return s !== null ? `${prefix}-${s}` : `${prefix}-[${escapeValue(v)}]`;
};

const keyword = (table) => (v) => table[v.trim()] ?? null;

const SIZE = { '100%': 'full', auto: 'auto', 'fit-content': 'fit', 'min-content': 'min', 'max-content': 'max' };
const size = (prefix) => (v) => {
  const k = SIZE[v.trim()];
  if (k) return `${prefix}-${k}`;
  return len(prefix)(v);
};

// Split a 1-4 value CSS shorthand, respecting parentheses.
const parts = (v) => {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of v.trim()) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) { if (cur) { out.push(cur); cur = ''; } continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
};

const box = (all, x, y, t, r, b, l) => (v) => {
  const p = parts(v);
  if (p.length === 1) return len(all)(p[0]);
  if (p.length === 2) return [len(y)(p[0]), len(x)(p[1])];
  if (p.length === 3) return [len(t)(p[0]), len(x)(p[1]), len(b)(p[2])];
  return [len(t)(p[0]), len(r)(p[1]), len(b)(p[2]), len(l)(p[3])];
};

const WEIGHT = { 100: 'thin', 200: 'extralight', 300: 'light', 400: 'normal', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black' };

const MAP = {
  display: keyword({ flex: 'flex', 'inline-flex': 'inline-flex', grid: 'grid', 'inline-grid': 'inline-grid', block: 'block', 'inline-block': 'inline-block', inline: 'inline', none: 'hidden', contents: 'contents' }),
  position: keyword({ fixed: 'fixed', absolute: 'absolute', relative: 'relative', sticky: 'sticky', static: 'static' }),
  'flex-direction': keyword({ row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' }),
  'flex-wrap': keyword({ wrap: 'flex-wrap', nowrap: 'flex-nowrap', 'wrap-reverse': 'flex-wrap-reverse' }),
  'align-items': keyword({ center: 'items-center', 'flex-start': 'items-start', 'flex-end': 'items-end', start: 'items-start', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' }),
  'justify-content': keyword({ center: 'justify-center', 'flex-start': 'justify-start', 'flex-end': 'justify-end', start: 'justify-start', end: 'justify-end', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' }),
  'text-align': keyword({ left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' }),
  'text-transform': keyword({ uppercase: 'uppercase', lowercase: 'lowercase', capitalize: 'capitalize', none: 'normal-case' }),
  'text-decoration': keyword({ none: 'no-underline', underline: 'underline' }),
  'white-space': keyword({ nowrap: 'whitespace-nowrap', pre: 'whitespace-pre', normal: 'whitespace-normal' }),
  visibility: keyword({ hidden: 'invisible', visible: 'visible' }),
  'pointer-events': keyword({ none: 'pointer-events-none', auto: 'pointer-events-auto' }),
  cursor: keyword({ pointer: 'cursor-pointer', default: 'cursor-default', none: 'cursor-none' }),
  'object-fit': keyword({ cover: 'object-cover', contain: 'object-contain', fill: 'object-fill', none: 'object-none' }),
  overflow: keyword({ hidden: 'overflow-hidden', clip: 'overflow-clip', auto: 'overflow-auto', scroll: 'overflow-scroll', visible: 'overflow-visible' }),
  'overflow-x': keyword({ hidden: 'overflow-x-hidden', clip: 'overflow-x-clip', auto: 'overflow-x-auto', scroll: 'overflow-x-scroll', visible: 'overflow-x-visible' }),
  'overflow-y': keyword({ hidden: 'overflow-y-hidden', clip: 'overflow-y-clip', auto: 'overflow-y-auto', scroll: 'overflow-y-scroll', visible: 'overflow-y-visible' }),

  padding: box('p', 'px', 'py', 'pt', 'pr', 'pb', 'pl'),
  margin: box('m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'),
  'padding-top': len('pt'), 'padding-right': len('pr'), 'padding-bottom': len('pb'), 'padding-left': len('pl'),
  'margin-top': len('mt'), 'margin-right': len('mr'), 'margin-bottom': len('mb'), 'margin-left': len('ml'),
  gap: len('gap'), 'row-gap': len('gap-y'), 'column-gap': len('gap-x'),
  top: len('top'), right: len('right'), bottom: len('bottom'), left: len('left'), inset: len('inset'),

  width: size('w'), height: size('h'),
  'min-width': size('min-w'), 'min-height': size('min-h'),
  'max-width': size('max-w'), 'max-height': size('max-h'),

  color: (v) => `text-[${escapeValue(v)}]`,
  background: (v) => `bg-[${escapeValue(v)}]`,
  'background-color': (v) => `bg-[${escapeValue(v)}]`,
  'border-radius': (v) => `rounded-[${escapeValue(v)}]`,
  'box-shadow': (v) => `shadow-[${escapeValue(v)}]`,
  'font-size': (v) => `text-[${escapeValue(v)}]`,
  'line-height': (v) => `leading-[${escapeValue(v)}]`,
  'letter-spacing': (v) => `tracking-[${escapeValue(v)}]`,
  'z-index': (v) => `z-[${escapeValue(v)}]`,
  opacity: (v) => `opacity-[${escapeValue(v)}]`,
  'grid-template-columns': (v) => `grid-cols-[${escapeValue(v)}]`,
  'font-weight': (v) => (WEIGHT[v.trim()] ? `font-${WEIGHT[v.trim()]}` : `font-[${escapeValue(v)}]`),
  border: (v) => (v.trim() === '0' || v.trim() === 'none' ? 'border-0' : `border-[${escapeValue(v)}]`),
};

/**
 * Convert an inline CSS declaration list into Tailwind classes.
 * Unknown properties become arbitrary properties, which Tailwind supports
 * and which render identically to the original declaration.
 */
export function styleToClasses(cssText, prefix = '') {
  const out = [];
  for (const decl of String(cssText).split(';')) {
    const text = decl.trim();
    if (!text) continue;
    const i = text.indexOf(':');
    if (i === -1) continue;
    const prop = text.slice(0, i).trim().toLowerCase();
    const value = text.slice(i + 1).trim();
    if (!value) continue;

    const fn = MAP[prop];
    let emitted = fn ? fn(value) : null;
    if (emitted === null || emitted === undefined) {
      emitted = `[${prop}:${escapeValue(value)}]`;
    }
    for (const c of [emitted].flat()) out.push(prefix + c);
  }
  return out;
}
