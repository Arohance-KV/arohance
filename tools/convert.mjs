import { parse } from 'node-html-parser';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { styleToClasses } from './tw.mjs';

const ROUTES = {
  'Arohance%20Homepage.dc.html': '/',
  'Arohance%20About.dc.html': '/about',
  'Arohance%20Services.dc.html': '/services',
  'Arohance%20Studio.dc.html': '/studio',
  'Arohance%20Careers.dc.html': '/careers',
  'Arohance%20Contact.dc.html': '/contact',
  'Arohance%20Case%20Study.dc.html': '/case-study',
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

export function convert(html, assets) {
  const root = parse(html, { lowerCaseTagName: false, comment: false });

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

    // 2. style + style-hover -> className
    const classes = [];
    const existing = el.getAttribute('class');
    if (existing) classes.push(existing);
    const style = el.getAttribute('style');
    if (style) { classes.push(...styleToClasses(style)); el.removeAttribute('style'); }
    const hover = el.getAttribute('style-hover');
    if (hover) { classes.push(...styleToClasses(hover, 'hover:')); el.removeAttribute('style-hover'); }
    if (classes.length) el.setAttribute('class', classes.join(' '));

    // 3. attribute renames + asset/route rewriting
    for (const [name, value] of Object.entries({ ...el.attributes })) {
      let v = value;
      if (assets[v]) v = assets[v];
      if (ROUTES[v]) v = ROUTES[v];
      const renamed = ATTRS[name.toLowerCase()];
      if (renamed) { el.removeAttribute(name); el.setAttribute(renamed, v); }
      else if (v !== value) el.setAttribute(name, v);
    }
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
  writeFileSync(`.source/jsx/${slug}.jsx`, convert(body, assets));
  console.log(`wrote .source/jsx/${slug}.jsx`);
}
