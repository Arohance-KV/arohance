import { parse } from 'node-html-parser';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { styleToClasses } from './tw.mjs';

const PAGE_ROUTES = {
  'Arohance Homepage': '/',
  'Arohance About': '/about',
  'Arohance Services': '/services',
  'Arohance Studio': '/studio',
  'Arohance Careers': '/careers',
  'Arohance Contact': '/contact',
  'Arohance Case Study': '/case-study',
};

/** Rewrite an internal artifact link to its route, preserving any #fragment.
 *  Accepts both the `.dc.html` (home) and bare `.html` (all other pages)
 *  spellings. Returns null if this is not an internal page link. */
const toRoute = (href) => {
  const m = /^(Arohance(?:%20|\s).*?)(?:\.dc)?\.html(#.*)?$/i.exec(href);
  if (!m) return null;
  const route = PAGE_ROUTES[decodeURIComponent(m[1])];
  return route ? route + (m[2] || '') : null;
};

const ATTRS = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex',
  colspan: 'colSpan', rowspan: 'rowSpan', maxlength: 'maxLength',
  autocomplete: 'autoComplete', readonly: 'readOnly', contenteditable: 'contentEditable',
  srcset: 'srcSet', crossorigin: 'crossOrigin', 'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity', 'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule', 'clip-path': 'clipPath', 'clip-rule': 'clipRule',
  'text-anchor': 'textAnchor', 'font-family': 'fontFamily', 'font-size': 'fontSize',
  'font-weight': 'fontWeight', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
  'sc-camel-view-box': 'viewBox', viewbox: 'viewBox',
  'gradientunits': 'gradientUnits', 'patternunits': 'patternUnits',
};

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);

// Completeness guard: the full census of hyphenated custom tags found in
// the real templates is image-slot, sc-raw-select, and x-dc -- nothing
// else. image-slot and sc-raw-select are actively renamed away below, so
// they never reach the guard after a successful conversion; x-dc is the
// bundler's whole-document wrapper that the CLI's </helmet> slice always
// discards (and which node-html-parser drops outright as an unmatched
// closing tag when it does appear), so it is the only tag name allowed to
// survive untouched. Anything else with a hyphen is unknown and must be
// reported, not shipped -- see the guard after the main loop below.
const KNOWN_TAGS = new Set(['x-dc']);

export function convert(html, assets) {
  const root = parse(html, { lowerCaseTagName: false, comment: false });
  // Diagnostics collected across the whole document and reported together
  // in one throw, rather than on the first hit: an internal link this
  // converter cannot map, or a construct the rename tables do not know
  // about, is a bug in the converter's coverage, not something to ship
  // silently. One failure path for both categories.
  const problems = new Set();

  for (const el of root.querySelectorAll('*')) {
    // 1. image-slot -> img
    if (el.rawTagName && el.rawTagName.toLowerCase() === 'image-slot') {
      const src = el.getAttribute('src') || '';
      const mapped = assets[src] || src;
      const alt = el.getAttribute('placeholder') || '';
      const cls = el.getAttribute('className') || el.getAttribute('class') || '';
      el.rawTagName = 'img';
      for (const name of Object.keys(el.attributes)) el.removeAttribute(name);
      el.setAttribute('src', mapped);
      el.setAttribute('alt', alt);
      el.setAttribute('class', `${cls} h-full w-full object-cover`.trim());
      el.set_content('');
    }

    // 1b. sc-raw-select -> select. Unlike image-slot, this is a direct
    // rename only: attributes (name, style, style-focus) and the bare
    // <option> children are left alone for the normal rules below and for
    // node-html-parser's own serialization to handle.
    if (el.rawTagName && el.rawTagName.toLowerCase() === 'sc-raw-select') {
      el.rawTagName = 'select';
    }

    // 2. style + style-hover + style-focus -> className
    const classes = [];
    const existing = el.getAttribute('class');
    if (existing) classes.push(existing);
    const style = el.getAttribute('style');
    if (style) { classes.push(...styleToClasses(style)); el.removeAttribute('style'); }
    const hover = el.getAttribute('style-hover');
    if (hover) { classes.push(...styleToClasses(hover, 'hover:')); el.removeAttribute('style-hover'); }
    const focus = el.getAttribute('style-focus');
    if (focus) { classes.push(...styleToClasses(focus, 'focus:')); el.removeAttribute('style-focus'); }
    if (classes.length) el.setAttribute('class', classes.join(' '));

    // 3. attribute renames + asset/route rewriting
    for (const [name, value] of Object.entries({ ...el.attributes })) {
      let v = value;
      if (assets[v]) v = assets[v];
      if (name.toLowerCase() === 'href' && v.startsWith('Arohance')) {
        const route = toRoute(v);
        if (route === null) problems.add(`unmapped internal link: ${v}`);
        else v = route;
      }
      const renamed = ATTRS[name.toLowerCase()];
      if (renamed) { el.removeAttribute(name); el.setAttribute(renamed, v); }
      else if (v !== value) el.setAttribute(name, v);
    }

    // 3b. completeness guard. By this point every known style-/sc- prefixed
    // attribute (style-hover, style-focus, sc-camel-view-box) and every
    // known hyphenated custom tag (image-slot, sc-raw-select) has already
    // been consumed or renamed above, and x-dc is explicitly allowed. If
    // any of the three still hits here, or the real templates grow a new
    // one the rules above do not name, report it instead of shipping it.
    // data-* and aria-* are untouched by construction: neither starts with
    // "style-" or "sc-".
    const tag = el.rawTagName;
    if (tag && tag.includes('-') && !KNOWN_TAGS.has(tag.toLowerCase())) {
      problems.add(`unhandled custom element: <${tag}>`);
    }
    for (const name of Object.keys(el.attributes)) {
      if (/^(style|sc)-/i.test(name)) {
        problems.add(`unhandled attribute: ${name}`);
      }
    }
  }

  if (problems.size) {
    throw new Error(`convert: ${[...problems].join('; ')}`);
  }

  let out = root.toString();

  // 4. self-close void elements
  for (const tag of VOID) {
    out = out.replace(new RegExp(`<${tag}(\\s[^>]*?)?>(?!\\s*</${tag}>)`, 'gi'),
      (_m, attrs = '') => `<${tag}${attrs || ''} />`);
    out = out.replace(new RegExp(`</${tag}>`, 'gi'), '');
  }

  // 5. escape braces in text so JSX does not read them as expressions.
  // This must be a single regex pass with a replacer function, not a
  // `.replace(/\{/g, "{'{'}").replace(/\}/g, "{'}'}")` chain: each
  // replacement string contains one literal '{' and one literal '}', so a
  // second, separate .replace() call would re-scan and mangle the braces
  // the first call just inserted (e.g. "a { b } c" would become the
  // corrupted "a {'{'{'}'} b {'}'} c" instead of "a {'{'} b {'}'} c").
  // Doing both characters in one pass avoids reprocessing inserted output.
  out = out.replace(/>([^<]*)</g, (m, text) => {
    if (!text.includes('{') && !text.includes('}')) return m;
    const escaped = text.replace(/[{}]/g, (c) => (c === '{' ? "{'{'}" : "{'}'}"));
    return '>' + escaped + '<';
  });

  return out;
}

// CLI: node tools/convert.mjs <slug>
if (process.argv[1]?.endsWith('convert.mjs')) {
  const slug = process.argv[2];
  if (!slug) { console.error('usage: node tools/convert.mjs <slug>'); process.exit(1); }
  const assets = JSON.parse(readFileSync('.source/assets.json', 'utf8'));
  const html = readFileSync(`.source/templates/${slug}.html`, 'utf8');
  // Strip everything up to and including </helmet>, and the trailing logic script.
  const body = html.slice(html.indexOf('</helmet>') + 9).split('<script type="text/x-dc"')[0];
  mkdirSync('.source/jsx', { recursive: true });
  let jsx;
  try {
    jsx = convert(body, assets);
  } catch (err) {
    console.error(`convert failed for ${slug}: ${err.message}`);
    process.exit(1);
  }
  writeFileSync(`.source/jsx/${slug}.jsx`, jsx);
  console.log(`wrote .source/jsx/${slug}.jsx`);
}
