# Arohance Next.js Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace seven bundled HTML artifact pages with a Next.js 15 application that renders the identical design using Tailwind classes, and works on phones.

**Architecture:** The bundled `.html` files are unpacked into raw templates and deduplicated assets by a committed tool. A second committed tool mechanically rewrites every inline `style` attribute into Tailwind classes and emits JSX. The existing framework-agnostic DOM behaviour code is ported near-verbatim into `lib/behaviors/*` modules with the shape `(root) => cleanup`, mounted by one client component per page. Responsive fixes are additive variants applied after conversion, so desktop output never changes.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript, `gsap` 3.12.5, `three` r160, `node-html-parser` (dev-only), `node:test` (stdlib) for tool tests.

**Spec:** `docs/superpowers/specs/2026-09-25-arohance-nextjs-port-design.md`

## Global Constraints

- The rendered design must match the original exactly at 1440px. Where this plan and the rendered HTML disagree, **the HTML wins**.
- Styling is expressed as Tailwind classes. No `style={{...}}` in shipped components except where a behaviour module writes styles imperatively at runtime.
- Accent colour is `#F2600C`, exposed as CSS custom property `--ag-accent`. Page background `#0C0B0A`, foreground `#F5F2ED`.
- Motion profile is `Expressive` everywhere: `{ y: 46, dur: 1100, amp: 96 }`.
- Frozen former artifact props: `accentColor "#F2600C"`, `motion "Expressive"`, `customCursor true`, `scrollTrail true`, `showPay true`. Do **not** build a configuration surface for these.
- All effects, including Three.js LiquidEther, ship on mobile. Do not gate them on viewport width. Effects that already guard on `matchMedia('(pointer:fine)')` keep that guard — that is a pointer capability check, not a width check.
- Mobile work is additive `max-md:` / `md:` variants only. Never edit a desktop class to fix mobile.
- The seven original `.html` bundles stay in the repo root, untouched.
- Fonts: `Archivo` and `Instrument Sans` via `next/font/google`.
- Do not use `npm run dev` for verification gates that claim correctness; use `npm run build` plus the Chrome comparison.

## Review Focus

These are the failure modes the spec implies that the obvious tests would miss. Each has a test assigned to the task that owns the code.

1. **Arbitrary values containing spaces** — `transition:opacity .5s cubic-bezier(.16, 1, .3, 1)` becomes an invalid Tailwind class if spaces are not converted to `_`. Tailwind emits nothing and the style silently vanishes. Covered in Task 3.
2. **SSR access to `window`/`document`** — behaviour modules touch both at module scope in the original. Any leak into a server component breaks `npm run build`. Covered in Task 5.
3. **WebGL context leak on client navigation** — `liquid-ether` mounts a Three.js renderer; navigating away without calling its disposer leaks the context, and browsers cap live contexts at ~16. Covered in Task 4.
4. **Body scroll lock surviving navigation** — `shell` sets `document.body.style.overflow = 'hidden'` when the menu opens. Navigating from an open menu leaves the next page unscrollable. Covered in Task 6.
5. **Horizontal page overflow from marquee ribbons** — the ribbons translate a double-width track; without containment they create page-level horizontal scroll at 390px. Covered in Task 10.

---

## Task 1: Unbundle the artifacts into templates and assets

**Files:**
- Create: `tools/unbundle.mjs`
- Create: `.gitignore` (add `.source/`)
- Output (generated, gitignored): `.source/templates/*.html`, `.source/vendor/*.js`
- Output (committed): `public/images/*`

**Interfaces:**
- Consumes: the seven `Arohance *.html` bundles in the repo root.
- Produces: `.source/templates/<slug>.html` for slugs `home`, `about`, `services`, `studio`, `careers`, `contact`, `case-study`; `public/images/<name>.<ext>`; `.source/assets.json` mapping original asset UUID to its public path or vendor filename.

- [ ] **Step 1: Write the failing test**

Create `tools/unbundle.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('unbundle produced all seven templates', () => {
  for (const slug of ['home','about','services','studio','careers','contact','case-study']) {
    assert.ok(existsSync(`.source/templates/${slug}.html`), `missing ${slug}`);
  }
});

test('templates are real markup, not bundler loaders', () => {
  const home = readFileSync('.source/templates/home.html', 'utf8');
  assert.ok(home.includes('data-ag-root'), 'template should contain the page root');
  assert.ok(!home.includes('__bundler'), 'template should not contain loader scaffolding');
});

test('asset map resolves every uuid referenced by a template', () => {
  const map = JSON.parse(readFileSync('.source/assets.json', 'utf8'));
  const home = readFileSync('.source/templates/home.html', 'utf8');
  const uuids = [...home.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)]
    .map(m => m[0]);
  assert.ok(uuids.length > 0, 'home template should reference assets');
  for (const u of new Set(uuids)) assert.ok(map[u], `unmapped asset ${u}`);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tools/unbundle.test.mjs`
Expected: FAIL — `.source/templates/home.html` does not exist.

- [ ] **Step 3: Write `tools/unbundle.mjs`**

Each bundle is 384 lines. The line **after** a line containing `script type="__bundler/<kind>"` holds that block's JSON.

```js
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const SLUGS = {
  'Arohance Homepage.html': 'home',
  'Arohance About.html': 'about',
  'Arohance Services.html': 'services',
  'Arohance Studio.html': 'studio',
  'Arohance Careers.html': 'careers',
  'Arohance Contact.html': 'contact',
  'Arohance Case Study.html': 'case-study',
};

const EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg',
  'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4',
  'font/woff2': 'woff2', 'text/javascript': 'js', 'application/javascript': 'js',
};

// Vendor libraries are identified by a fingerprint in their first 200 bytes.
// Everything else that is JS is page logic we do not need as a file.
const VENDOR = [
  [/Three\.js Authors/, 'three.js'],
  [/GSAP 3\.12\.5/, 'gsap.js'],
  [/React Bits <LiquidEther \/>/, 'liquid-ether.js'],
  [/React Bits <StrokeText \/>/, 'stroke-text.js'],
  [/Floating "Up \/ make contact" pill/, 'contact-pill.js'],
];

mkdirSync('.source/templates', { recursive: true });
mkdirSync('.source/vendor', { recursive: true });
mkdirSync('public/images', { recursive: true });

const blockAfter = (lines, kind) => {
  const i = lines.findIndex(l => l.includes(`script type="__bundler/${kind}"`));
  if (i === -1) throw new Error(`missing bundler block: ${kind}`);
  return JSON.parse(lines[i + 1]);
};

const byHash = new Map(); // content hash -> public path
const assetMap = {};      // uuid -> public path

// Pass 1: every asset from every bundle, deduplicated by content.
for (const file of readdirSync('.')) {
  if (!SLUGS[file]) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const [uuid, a] of Object.entries(blockAfter(lines, 'manifest'))) {
    let buf = Buffer.from(a.data, 'base64');
    if (a.compressed) buf = gunzipSync(buf);
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 10);
    if (byHash.has(hash)) { assetMap[uuid] = byHash.get(hash); continue; }

    const ext = EXT[a.mime] ?? 'bin';
    let out;
    if (ext === 'js') {
      const head = buf.subarray(0, 200).toString('utf8');
      const hit = VENDOR.find(([re]) => re.test(head));
      if (!hit) { byHash.set(hash, null); assetMap[uuid] = null; continue; }
      out = `.source/vendor/${hit[1]}`;
      writeFileSync(out, buf);
    } else if (ext === 'woff2') {
      // next/font/google self-hosts these; we do not ship them.
      byHash.set(hash, null); assetMap[uuid] = null; continue;
    } else {
      out = `/images/${hash}.${ext}`;
      writeFileSync(join('public/images', `${hash}.${ext}`), buf);
    }
    byHash.set(hash, out);
    assetMap[uuid] = out;
  }
}

// Pass 2: templates.
for (const [file, slug] of Object.entries(SLUGS)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  writeFileSync(`.source/templates/${slug}.html`, blockAfter(lines, 'template'));
}

writeFileSync('.source/assets.json', JSON.stringify(assetMap, null, 2));
console.log(`templates: 7  assets: ${[...byHash.values()].filter(Boolean).length}`);
```

- [ ] **Step 4: Run the unbundler and the test**

Run: `node tools/unbundle.mjs && node --test tools/unbundle.test.mjs`
Expected: unbundler prints `templates: 7  assets: 38` (33 images + 5 vendor JS); all three tests PASS.

If the third test fails on a UUID mapped to `null`, that UUID is a font or page-logic script referenced from the template's `<script src>` — confirm that is what it is, then change the assertion to `assert.ok(u in map)`.

- [ ] **Step 5: Commit**

```bash
git add tools/unbundle.mjs tools/unbundle.test.mjs public/images .gitignore
git commit -m "feat: unbundle artifact HTML into templates and deduplicated assets"
```

---

## Task 2: Scaffold Next.js 15 with Tailwind v4, fonts, and global CSS

**Files:**
- Create: the Next.js app in place (`package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`)
- Modify: `app/globals.css` — base resets and the design's keyframes

**Interfaces:**
- Consumes: nothing.
- Produces: `app/globals.css` exporting no symbols but defining keyframes `ag-marquee`, `ag-marquee-rev`, `ag-rail-l`, `ag-rail-r`, `ag-wave`, `ag-pulse`, `ag-drift`; `app/layout.tsx` exporting default `RootLayout({ children }: { children: React.ReactNode })`.

- [ ] **Step 1: Scaffold**

Run in the repo root:

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack
```

Answer `yes` to writing into a non-empty directory. This initialises git.

- [ ] **Step 2: Verify Tailwind v4 was scaffolded**

Run: `node -p "require('./package.json').devDependencies.tailwindcss"`
Expected: a `^4.x` version. If it prints a `3.x` version, upgrade:

```bash
npm install -D tailwindcss@latest @tailwindcss/postcss@latest && rm -f tailwind.config.ts tailwind.config.js
```

and ensure `postcss.config.mjs` contains `plugins: { "@tailwindcss/postcss": {} }`.

- [ ] **Step 3: Install runtime dependencies**

```bash
npm install gsap@3.12.5 three@0.160.1
npm install -D node-html-parser @types/three
```

- [ ] **Step 4: Write `app/globals.css`**

The base block is copied from the original `<helmet>` inline stylesheet. The keyframes `ag-rail-l` and `ag-rail-r` are ~25 stops each — copy them **verbatim** from `.source/templates/home.html` (inside the `<style>` element that starts after the `<script src>` line following the font faces; search for `@keyframes ag-rail-r`). Do not retype or round the percentages.

```css
@import "tailwindcss";

@theme {
  --color-ag-ink: #0C0B0A;
  --color-ag-paper: #F5F2ED;
  --color-ag-accent: #F2600C;
}

:root { --ag-accent: #F2600C; }

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  margin: 0;
  background: #0C0B0A;
  color: #F5F2ED;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::selection { background: var(--ag-accent, #F2600C); color: #0A0A0A; }
a { color: inherit; text-decoration: none; }
a:hover { color: var(--ag-accent, #F2600C); }
input, textarea, button { font: inherit; color: inherit; }

@keyframes ag-marquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
@keyframes ag-marquee-rev { from { transform: translate3d(-50%,0,0); } to { transform: translate3d(0,0,0); } }
@keyframes ag-pulse { 0%,100% { opacity: 1; } 50% { opacity: .2; } }
@keyframes ag-wave {
  0%   { transform: translate3d(0,0,0) skewY(0deg); }
  25%  { transform: translate3d(-1.6%,-4px,0) skewY(-1.1deg); }
  50%  { transform: translate3d(0,2px,0) skewY(.8deg); }
  75%  { transform: translate3d(-0.9%,-2px,0) skewY(-0.5deg); }
  100% { transform: translate3d(0,0,0) skewY(0deg); }
}
@keyframes ag-drift { 0%,100% { transform: rotate(-0.6deg); } 50% { transform: rotate(0.8deg); } }

/* PASTE @keyframes ag-rail-r AND @keyframes ag-rail-l VERBATIM FROM
   .source/templates/home.html HERE — 25 stops each, cqw units. */

@media (prefers-reduced-motion: reduce) {
  [data-ag-ribbon] { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
  [data-ag-card] { animation-play-state: paused; }
}
```

- [ ] **Step 5: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Archivo, Instrument_Sans } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arohance — Tech & Marketing',
  description:
    'An independent studio for brands, products and the technology underneath them.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable}`}>
      <body className="font-[var(--font-instrument),system-ui,sans-serif]">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify the build and the baseline paint**

Run: `npm run build`
Expected: build succeeds with no type errors.

Run: `npm run dev`, open `http://localhost:3000`, confirm the page background is `#0C0B0A` and body text renders in Instrument Sans. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 with Tailwind v4, fonts and design keyframes"
git add docs/superpowers
git commit -m "docs: add port design spec and implementation plan"
```

---

## Task 3: Build and test the CSS-to-Tailwind mapper

This is the only task with substantial logic of its own, and the only one whose correctness is not visual. It gets real tests.

**Files:**
- Create: `tools/tw.mjs`
- Create: `tools/tw.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `tools/tw.mjs` exporting `styleToClasses(cssText: string, prefix = ''): string[]` and `escapeValue(v: string): string`.

- [ ] **Step 1: Write the failing test**

Create `tools/tw.test.mjs`. The `cubic-bezier` case is Review Focus item 1.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { styleToClasses, escapeValue } from './tw.mjs';

const cls = (css, prefix) => styleToClasses(css, prefix).join(' ');

test('maps keyword declarations to real utilities', () => {
  assert.equal(cls('display:flex'), 'flex');
  assert.equal(cls('position:fixed'), 'fixed');
  assert.equal(cls('overflow:clip'), 'overflow-clip');
  assert.equal(cls('align-items:center'), 'items-center');
  assert.equal(cls('justify-content:space-between'), 'justify-between');
  assert.equal(cls('flex-direction:column'), 'flex-col');
});

test('maps px lengths onto the spacing scale', () => {
  assert.equal(cls('padding:16px'), 'p-4');
  assert.equal(cls('gap:10px'), 'gap-2.5');
  assert.equal(cls('top:0'), 'top-0');
});

test('splits shorthand padding into axis utilities', () => {
  assert.equal(cls('padding:16px clamp(20px,4.4vw,64px)'),
    'py-4 px-[clamp(20px,4.4vw,64px)]');
  assert.equal(cls('padding:4px 8px 12px 16px'), 'pt-1 pr-2 pb-3 pl-4');
});

test('colors become arbitrary text/bg values', () => {
  assert.equal(cls('color:#F5F2ED'), 'text-[#F5F2ED]');
  assert.equal(cls('background:#1F1E1C'), 'bg-[#1F1E1C]');
});

// Review Focus 1: a space inside an arbitrary value silently kills the class.
test('spaces inside arbitrary values become underscores', () => {
  assert.equal(
    cls('transition:opacity .5s cubic-bezier(.16, 1, .3, 1)'),
    '[transition:opacity_.5s_cubic-bezier(.16,_1,_.3,_1)]',
  );
  assert.ok(!cls('box-shadow:0 10px 26px rgba(0,0,0,.5)').includes(' ',
    cls('box-shadow:0 10px 26px rgba(0,0,0,.5)').indexOf('[')));
});

test('escapeValue never emits a bare space', () => {
  assert.equal(escapeValue('0 10px 26px rgba(0,0,0,.5)'), '0_10px_26px_rgba(0,0,0,.5)');
});

test('unknown properties fall back to arbitrary properties', () => {
  assert.equal(cls('mix-blend-mode:screen'), '[mix-blend-mode:screen]');
  assert.equal(cls('--ag-accent:#F2600C'), '[--ag-accent:#F2600C]');
});

test('prefix is applied to every emitted class', () => {
  assert.equal(cls('background:#F2600C;transform:translate3d(0,-2px,0)', 'hover:'),
    'hover:bg-[#F2600C] hover:[transform:translate3d(0,-2px,0)]');
});

test('declarations are order-preserving and semicolon-tolerant', () => {
  assert.equal(cls('display:flex;;align-items:center;'), 'flex items-center');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tools/tw.test.mjs`
Expected: FAIL — `Cannot find module './tw.mjs'`.

- [ ] **Step 3: Write `tools/tw.mjs`**

```js
// px -> Tailwind spacing scale (4px == 1 unit). Values outside the scale
// fall through to an arbitrary value, which is exact either way.
const SPACING = {
  0: '0', 1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3',
  14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10',
  44: '11', 48: '12', 56: '14', 64: '16', 80: '20', 96: '24', 128: '32',
};

export const escapeValue = (v) => v.trim().replace(/\s+/g, '_');

const scale = (v) => {
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v.trim());
  if (m) {
    const n = Number(m[1]);
    const hit = SPACING[Math.abs(n)];
    if (hit !== undefined) return (n < 0 ? '-' : '') + hit;
  }
  if (v.trim() === '0') return '0';
  return null;
};

// A length-valued property: try the spacing scale, else arbitrary.
const len = (prefix) => (v) => {
  const s = scale(v);
  return s !== null ? `${prefix}-${s}` : `${prefix}-[${escapeValue(v)}]`;
};

const keyword = (table) => (v) => table[v.trim()] ?? null;

const SIZE = { '100%': 'full', '100vw': 'screen', '100vh': 'screen', auto: 'auto', 'fit-content': 'fit', 'min-content': 'min', 'max-content': 'max' };
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tools/tw.test.mjs`
Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add tools/tw.mjs tools/tw.test.mjs
git commit -m "feat: add tested CSS-to-Tailwind declaration mapper"
```

---

## Task 4: Port the two vendor effect modules

**Files:**
- Create: `lib/liquid-ether.ts`
- Create: `lib/stroke-text.ts`
- Create: `lib/effects.test.mjs`

**Interfaces:**
- Consumes: `.source/vendor/liquid-ether.js`, `.source/vendor/stroke-text.js`.
- Produces: `lib/liquid-ether.ts` exporting `mount(el: HTMLElement, opts: EtherOpts): () => void`; `lib/stroke-text.ts` exporting `mount(el: HTMLElement, opts: StrokeOpts): () => void`. Both disposers are idempotent.

- [ ] **Step 1: Copy the sources**

```bash
cp .source/vendor/liquid-ether.js lib/liquid-ether.ts
cp .source/vendor/stroke-text.js lib/stroke-text.ts
```

- [ ] **Step 2: Replace the artifact-runtime imports**

The originals resolve their libraries through the bundler's `window.__resources` table. Replace those lines with real imports.

In `lib/liquid-ether.ts`, the first line is:

```js
const THREE = await import(window.__resources.three);
```

Replace with:

```ts
import * as THREE from 'three';
```

In `lib/stroke-text.ts`, the first line is:

```js
const gsap = window.gsap;
```

Replace with:

```ts
import { gsap } from 'gsap';
```

Change nothing else about the animation logic. These files carry the exact look; edits here are drift.

- [ ] **Step 3: Type the two option bags and the exports**

Add at the top of `lib/liquid-ether.ts`:

```ts
export type EtherOpts = {
  colors: string[]; mouseForce: number; cursorSize: number; resolution: number;
  autoDemo: boolean; autoSpeed: number; autoIntensity: number;
  takeoverDuration: number; autoResumeDelay: number; autoRampDuration: number;
};
```

Add at the top of `lib/stroke-text.ts`:

```ts
export type StrokeOpts = {
  text: string; strokeColor: string; fillColor: string; strokeWidth: number;
  drawDuration: number; fillDelay: number; stagger: number; ease: string;
  trigger: string; fillMode: string; fontSize: number; fontWeight: number;
  letterSpacing: number; fontFamily: string;
};
```

Change each file's `export function mount(el, opts)` signature to `export function mount(el: HTMLElement, opts: EtherOpts): () => void` / `(el: HTMLElement, opts: StrokeOpts): () => void`. If TypeScript reports implicit `any` on internal variables, annotate them as `any` rather than restructuring the code.

- [ ] **Step 4: Make the ether disposer idempotent (Review Focus 3)**

Find the returned disposer in `lib/liquid-ether.ts`. Wrap its body so a second call is a no-op and the WebGL context is explicitly released:

```ts
let disposed = false;
return () => {
  if (disposed) return;
  disposed = true;
  // ...existing teardown (cancelAnimationFrame, removeEventListener, etc.)...
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
};
```

`renderer` is the `THREE.WebGLRenderer` created near the top of `mount`. Use whatever local name the file already uses.

- [ ] **Step 5: Write the leak test**

Create `lib/effects.test.mjs`. This asserts the source-level guarantee without a browser:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ether = readFileSync('lib/liquid-ether.ts', 'utf8');

// Review Focus 3: a leaked WebGL context kills the page after ~16 navigations.
test('ether disposer releases the GL context and is idempotent', () => {
  assert.match(ether, /forceContextLoss\(\)/, 'must force context loss');
  assert.match(ether, /renderer\.dispose\(\)/, 'must dispose the renderer');
  assert.match(ether, /if \(disposed\) return;/, 'must guard double-dispose');
});

test('vendor modules import real packages, not the artifact runtime', () => {
  assert.ok(!ether.includes('__resources'), 'ether still uses window.__resources');
  assert.match(ether, /^import \* as THREE from 'three';/m);
  const stroke = readFileSync('lib/stroke-text.ts', 'utf8');
  assert.ok(!stroke.includes('window.gsap'), 'stroke still uses window.gsap');
  assert.match(stroke, /^import \{ gsap \} from 'gsap';/m);
});
```

- [ ] **Step 6: Run the tests and typecheck**

Run: `node --test lib/effects.test.mjs && npx tsc --noEmit`
Expected: both tests PASS; `tsc` reports no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/liquid-ether.ts lib/stroke-text.ts lib/effects.test.mjs
git commit -m "feat: port LiquidEther and StrokeText to typed modules with safe disposal"
```

---

## Task 5: Port the shared behaviour modules and the runtime mount

**Files:**
- Create: `lib/behaviors/types.ts`, `lib/behaviors/theme.ts`, `lib/behaviors/reveal.ts`, `lib/behaviors/parallax.ts`, `lib/behaviors/nav.ts`, `lib/behaviors/clock.ts`, `lib/behaviors/form.ts`, `lib/behaviors/index.ts`
- Create: `components/AgRuntime.tsx`
- Create: `lib/behaviors/ssr.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `lib/behaviors/types.ts` exporting `export type Behavior = (root: HTMLElement) => () => void;` and `export const MOTION = { y: 46, dur: 1100, amp: 96 } as const;`
  - each behaviour file exporting a default-free named const matching its filename (`reveal`, `parallax`, `nav`, `clock`, `form`, `applyTheme`), each of type `Behavior`
  - `lib/behaviors/index.ts` re-exporting all of them plus `export const SHARED: Behavior[]`
  - `components/AgRuntime.tsx` exporting default `AgRuntime({ modules }: { modules: Behavior[] })`

**Porting rules** — apply these mechanically to every method lifted from the page scripts, here and in Tasks 8, 11, 12 and 13:

| Original | Port |
|---|---|
| `initFoo() { ... }` | `export const foo: Behavior = (root) => { ... }` |
| `const root = this.root(); if (!root) return;` | delete — `root` is the parameter |
| `this.motion()` | `MOTION` |
| `this.props.accentColor` | `'#F2600C'` |
| `this.props.motion` | `'Expressive'` |
| `this.cleanups.push(fn)` | `cleanups.push(fn)` against a local `const cleanups: (() => void)[] = []` |
| implicit end of method | `return () => cleanups.forEach(fn => fn());` |
| `el.dataset.x` | unchanged |

- [ ] **Step 1: Write `lib/behaviors/types.ts`**

```ts
export type Behavior = (root: HTMLElement) => () => void;

/** The frozen "Expressive" motion profile from the original artifact props. */
export const MOTION = { y: 46, dur: 1100, amp: 96 } as const;
```

- [ ] **Step 2: Write `lib/behaviors/theme.ts`**

```ts
import type { Behavior } from './types';

export const applyTheme: Behavior = () => {
  document.documentElement.style.setProperty('--ag-accent', '#F2600C');
  return () => {};
};
```

- [ ] **Step 3: Write `lib/behaviors/reveal.ts`**

Ported verbatim from `initReveal` in the homepage script.

```ts
import { MOTION, type Behavior } from './types';

export const reveal: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const { y, dur } = MOTION;
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!('IntersectionObserver' in window) || document.visibilityState !== 'visible') {
    return () => {};
  }
  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0,' + y + 'px,0)';
    el.style.transition =
      'opacity ' + dur + 'ms cubic-bezier(.16,1,.3,1), transform ' + dur + 'ms cubic-bezier(.16,1,.3,1)';
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0,0,0)';
        }, delay);
        io.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  const guard = setTimeout(() => {
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }, 1600);
  cleanups.push(() => {
    io.disconnect();
    clearTimeout(guard);
  });
  return () => cleanups.forEach((fn) => fn());
};
```

- [ ] **Step 4: Write `lib/behaviors/parallax.ts`**

```ts
import { MOTION, type Behavior } from './types';

export const parallax: Behavior = (root) => {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!els.length) return () => {};
  const amp = MOTION.amp;
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      const f = parseFloat(el.dataset.parallax || '') || 0.3;
      el.style.transform = 'translate3d(0,' + (p * amp * f).toFixed(2) + 'px,0)';
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};
```

- [ ] **Step 5: Write `lib/behaviors/nav.ts`**

```ts
import type { Behavior } from './types';

export const nav: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-nav]');
  if (!el) return () => {};
  const darks = Array.from(root.querySelectorAll<HTMLElement>('[data-dark]'));
  const onScroll = () => {
    const y = window.scrollY || 0;
    const stuck = y > 40;
    const probe = el.getBoundingClientRect().height * 0.6;
    // Retained from the original: the dark-section probe is computed but the
    // palette is constant, so the nav always paints light-on-dark.
    darks.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    el.style.color = '#F5F2ED';
    const logo = el.querySelector<HTMLElement>('[data-ag-logo]');
    if (logo) logo.style.filter = 'none';
    el.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    Array.from(el.querySelectorAll('button')).forEach((b) => {
      b.style.background = '#1A1815';
      b.style.color = '#F5F2ED';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
};
```

- [ ] **Step 6: Port `clock` and `form`**

Lift `initClock` and `initForm` from `.source/templates/home.html` (inside the `<script type="text/x-dc">` block near the end of the file) into `lib/behaviors/clock.ts` and `lib/behaviors/form.ts`, applying the porting-rules table above. Do not alter their logic, selectors, or string formats.

- [ ] **Step 7: Write `lib/behaviors/index.ts`**

```ts
import { applyTheme } from './theme';
import { reveal } from './reveal';
import { parallax } from './parallax';
import { nav } from './nav';
import { clock } from './clock';
import { form } from './form';
import type { Behavior } from './types';

export * from './types';
export { applyTheme, reveal, parallax, nav, clock, form };

/** Behaviours every page mounts, in the original componentDidMount order. */
export const SHARED: Behavior[] = [applyTheme, reveal, parallax, nav, clock, form];
```

- [ ] **Step 8: Write `components/AgRuntime.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import type { Behavior } from '@/lib/behaviors';

/**
 * Mounts a page's behaviour modules against [data-ag-root] and disposes
 * them on unmount. One effect, one pass, matching the original
 * componentDidMount / componentWillUnmount pair.
 */
export default function AgRuntime({ modules }: { modules: Behavior[] }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-ag-root]');
    if (!root) return;
    const disposers = modules.map((m) => m(root));
    return () => disposers.forEach((d) => d());
  }, [modules]);

  return null;
}
```

- [ ] **Step 9: Write the SSR-safety test (Review Focus 2)**

Create `lib/behaviors/ssr.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const files = readdirSync('lib/behaviors').filter(f => f.endsWith('.ts'));

// Review Focus 2: a window/document reference at module scope, or a
// behaviour file imported by a server component, breaks `next build`.
test('no behaviour touches window or document at module scope', () => {
  for (const f of files) {
    const src = readFileSync(`lib/behaviors/${f}`, 'utf8');
    const topLevel = src
      .split('\n')
      .filter(l => !/^\s/.test(l))              // indented lines are inside a fn
      .filter(l => !l.trimStart().startsWith('//'))
      .join('\n');
    assert.ok(!/\b(window|document)\b/.test(topLevel),
      `${f} references window/document at module scope`);
  }
});

test('AgRuntime is a client component', () => {
  const src = readFileSync('components/AgRuntime.tsx', 'utf8');
  assert.match(src.trimStart(), /^'use client';/);
});
```

- [ ] **Step 10: Run the tests and typecheck**

Run: `node --test lib/behaviors/ssr.test.mjs && npx tsc --noEmit`
Expected: both tests PASS; no type errors.

- [ ] **Step 11: Commit**

```bash
git add lib/behaviors components/AgRuntime.tsx
git commit -m "feat: port shared behaviour modules and the runtime mount"
```

---

## Task 6: Build the template-to-JSX converter and the shared shell components

**Files:**
- Create: `tools/convert.mjs`
- Create: `tools/convert.test.mjs`
- Create: `components/Nav.tsx`, `components/MenuOverlay.tsx`, `components/Footer.tsx`, `components/ContactPill.tsx`
- Create: `lib/behaviors/shell.ts`
- Modify: `lib/behaviors/index.ts` — add `shell` to `SHARED`

**Interfaces:**
- Consumes: `tools/tw.mjs` (`styleToClasses`), `.source/assets.json`, `.source/templates/*.html`.
- Produces: `tools/convert.mjs` exporting `convert(html: string, assets: Record<string,string>): string` and writing `.source/jsx/<slug>.jsx`; `lib/behaviors/shell.ts` exporting `shell: Behavior`.

- [ ] **Step 1: Write the failing converter test**

Create `tools/convert.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert } from './convert.mjs';

const ASSETS = { 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee': '/images/abc123.png' };

test('style becomes className', () => {
  const out = convert('<div style="display:flex;gap:10px"></div>', ASSETS);
  assert.match(out, /className="flex gap-2\.5"/);
  assert.ok(!out.includes('style='), 'inline style must be gone');
});

test('style-hover becomes hover variants and is removed', () => {
  const out = convert('<a style="color:#fff" style-hover="color:#F2600C"></a>', ASSETS);
  assert.match(out, /className="text-\[#fff\] hover:text-\[#F2600C\]"/);
  assert.ok(!out.includes('style-hover'), 'style-hover must be gone');
});

test('html attributes are renamed for JSX', () => {
  const out = convert('<label for="a" tabindex="0" class="x"></label>', ASSETS);
  assert.match(out, /htmlFor="a"/);
  assert.match(out, /tabIndex="0"/);
  assert.ok(!/\sclass=/.test(out), 'bare class must be renamed');
});

test('the mangled viewBox attribute is restored', () => {
  const out = convert('<svg sc-camel-view-box="0 0 24 24"></svg>', ASSETS);
  assert.match(out, /viewBox="0 0 24 24"/);
  assert.ok(!out.includes('sc-camel-view-box'));
});

test('image-slot becomes img with the mapped asset path', () => {
  const out = convert(
    '<image-slot id="s" shape="rect" src="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" placeholder="Key visual"></image-slot>',
    ASSETS,
  );
  assert.match(out, /<img/);
  assert.match(out, /src="\/images\/abc123\.png"/);
  assert.match(out, /alt="Key visual"/);
  assert.ok(!out.includes('image-slot'));
});

test('void elements are self-closed', () => {
  const out = convert('<div><br><img src="x"></div>', ASSETS);
  assert.match(out, /<br\s*\/>/);
  assert.match(out, /<img[^>]*\/>/);
});

test('internal artifact links become routes', () => {
  const out = convert('<a href="Arohance%20About.dc.html">About</a>', ASSETS);
  assert.match(out, /href="\/about"/);
});

test('braces in text are escaped for JSX', () => {
  const out = convert('<p>a { b } c</p>', ASSETS);
  assert.match(out, /\{'\{'\}/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tools/convert.test.mjs`
Expected: FAIL — `Cannot find module './convert.mjs'`.

- [ ] **Step 3: Write `tools/convert.mjs`**

```js
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

  // 5. escape braces in text so JSX does not read them as expressions
  out = out.replace(/>([^<]*)</g, (m, text) => {
    if (!text.includes('{') && !text.includes('}')) return m;
    return '>' + text.replace(/\{/g, "{'{'}").replace(/\}/g, "{'}'}") + '<';
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tools/convert.test.mjs`
Expected: all 8 tests PASS.

- [ ] **Step 5: Port `shell` with a navigation-safe scroll lock (Review Focus 4)**

Create `lib/behaviors/shell.ts` from `initShell` in the homepage script, applying the porting rules. The original's cleanup already restores `document.body.style.overflow`; keep that and make sure it runs unconditionally:

```ts
import type { Behavior } from './types';

export const shell: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const ov = root.querySelector<HTMLElement>('[data-ag-overlay]');
  const news = root.querySelector<HTMLElement>('[data-ag-news-panel]');
  const menu = root.querySelector<HTMLElement>('[data-ag-menu-panel]');
  const nBtn = root.querySelector<HTMLElement>('[data-ag-news-btn]');
  const mBtn = root.querySelector<HTMLElement>('[data-ag-menu-btn]');
  const burger = root.querySelector<HTMLElement>('[data-ag-burger]');
  const close = root.querySelector<HTMLElement>('[data-ag-close]');
  if (!ov || !news || !menu) return () => { document.body.style.overflow = ''; };

  const bars = burger ? (Array.from(burger.children) as HTMLElement[]) : [];
  let state: 'news' | 'menu' | null = null;

  const paint = () => {
    const open = !!state;
    ov.style.opacity = open ? '1' : '0';
    ov.style.visibility = open ? 'visible' : 'hidden';
    ov.style.pointerEvents = open ? 'auto' : 'none';
    ([[news, state === 'news' || state === 'menu'], [menu, state === 'menu']] as const)
      .forEach(([el, on], i) => {
        el.style.opacity = on ? '1' : '0';
        el.style.transform = on ? 'none' : 'translate3d(28px,0,0)';
        el.style.transitionDelay = on ? i * 70 + 'ms' : '0ms';
        el.style.pointerEvents = on ? 'auto' : 'none';
      });
    if (bars.length === 2) {
      bars[0].style.transform = state === 'menu' ? 'translateY(3.5px) rotate(45deg)' : 'none';
      bars[1].style.transform = state === 'menu' ? 'translateY(-3.5px) rotate(-45deg)' : 'none';
    }
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const set = (next: 'news' | 'menu') => { state = state === next ? null : next; paint(); };
  const on = (el: HTMLElement | null, fn: () => void) => {
    if (!el) return;
    el.addEventListener('click', fn);
    cleanups.push(() => el.removeEventListener('click', fn));
  };
  on(nBtn, () => set('news'));
  on(mBtn, () => set('menu'));
  on(close, () => { state = null; paint(); });

  const bg = (e: Event) => { if (e.target === ov) { state = null; paint(); } };
  ov.addEventListener('click', bg);
  Array.from(ov.querySelectorAll('a')).forEach((a) => {
    const h = () => { state = null; paint(); };
    a.addEventListener('click', h);
    cleanups.push(() => a.removeEventListener('click', h));
  });
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && state) { state = null; paint(); } };
  window.addEventListener('keydown', esc);
  cleanups.push(() => {
    ov.removeEventListener('click', bg);
    window.removeEventListener('keydown', esc);
  });
  paint();

  // Review Focus 4: always release the lock, even if the menu was open
  // when the route changed.
  return () => {
    cleanups.forEach((fn) => fn());
    document.body.style.overflow = '';
  };
};
```

- [ ] **Step 6: Add the scroll-lock regression test**

Append to `lib/behaviors/ssr.test.mjs`:

```js
// Review Focus 4: navigating away with the menu open must not leave the
// next page unscrollable.
test('shell always clears the body scroll lock on dispose', () => {
  const src = readFileSync('lib/behaviors/shell.ts', 'utf8');
  const disposer = src.slice(src.lastIndexOf('return () => {'));
  assert.match(disposer, /document\.body\.style\.overflow = '';/,
    'shell disposer must reset body overflow');
});
```

- [ ] **Step 7: Add `shell` to `SHARED`**

In `lib/behaviors/index.ts`, import `shell` and place it after `nav`:

```ts
export const SHARED: Behavior[] = [applyTheme, reveal, parallax, nav, shell, clock, form];
```

- [ ] **Step 8: Extract the shared shell components**

Run `node tools/convert.mjs home` to produce `.source/jsx/home.jsx`. From it, lift these four regions into components, keeping the emitted classNames byte-for-byte:

- `components/Nav.tsx` — the `<nav data-ag-nav>` element and its children.
- `components/MenuOverlay.tsx` — the `<div data-ag-overlay>` element and its news/menu panels.
- `components/Footer.tsx` — the `<footer>` element.
- `components/ContactPill.tsx` — a `'use client'` component porting `.source/vendor/contact-pill.js` under the porting rules, mounted the same way `AgRuntime` mounts behaviours.

Each is a plain server component except `ContactPill`. Convert menu `href` values to `next/link`:

```tsx
import Link from 'next/link';
// <a href="/about"> becomes <Link href="/about">
```

- [ ] **Step 9: Verify**

Run: `node --test tools/convert.test.mjs && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 10: Commit**

```bash
git add tools/convert.mjs tools/convert.test.mjs components lib/behaviors
git commit -m "feat: add template-to-JSX converter and shared shell components"
```

---

## Task 7: Convert the homepage

**Files:**
- Create: `app/page.tsx`
- Modify: `.source/jsx/home.jsx` (generated intermediate, not committed)

**Interfaces:**
- Consumes: `tools/convert.mjs`, `components/{Nav,MenuOverlay,Footer,ContactPill}`, `components/AgRuntime`, `lib/behaviors` (`SHARED`).
- Produces: `app/page.tsx` exporting default `Home()`.

- [ ] **Step 1: Generate the JSX**

Run: `node tools/convert.mjs home`
Expected: `wrote .source/jsx/home.jsx`.

- [ ] **Step 2: Assemble `app/page.tsx`**

Take the generated JSX and replace the four shell regions with the components from Task 6. The skeleton:

```tsx
import Image from 'next/image';
import AgRuntime from '@/components/AgRuntime';
import Nav from '@/components/Nav';
import MenuOverlay from '@/components/MenuOverlay';
import Footer from '@/components/Footer';
import ContactPill from '@/components/ContactPill';
import { SHARED } from '@/lib/behaviors';
import { HOME_MODULES } from './modules';

export default function Home() {
  return (
    <div data-ag-root className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">
      {/* ...generated sections, verbatim classNames... */}
      <Nav />
      <MenuOverlay />
      {/* header#top, section#intro, ribbons, section#work, #clients,
          #testimonials, #services, #contact — pasted from .source/jsx/home.jsx */}
      <Footer />
      <ContactPill />
      <AgRuntime modules={HOME_MODULES} />
    </div>
  );
}
```

Create `app/modules.ts` in the same commit:

```ts
import { SHARED, type Behavior } from '@/lib/behaviors';

/** Homepage behaviour set; page-specific modules are appended in Task 8. */
export const HOME_MODULES: Behavior[] = [...SHARED];
```

- [ ] **Step 3: Replace `<img>` with `next/image` for the key visuals**

The converter emits `<img>`. For the four work-card key visuals and the logo, switch to `next/image` with explicit dimensions read from the files:

```bash
node -e "const s=require('sharp');" 2>/dev/null || npm i -D image-size
node -e "const i=require('image-size');for(const f of require('fs').readdirSync('public/images'))console.log(f, JSON.stringify(i('public/images/'+f)))"
```

Use the reported width/height. Keep `className` unchanged; add `priority` to the logo and the first work card only.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds. If it fails with `Unexpected token` inside JSX, the cause is unescaped `{`/`}` or an unclosed void element the converter's regex missed — fix the converter rule, re-run `node tools/convert.mjs home`, and re-paste rather than hand-patching the page.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/modules.ts
git commit -m "feat: convert homepage markup to Tailwind JSX"
```

---

## Task 8: Port the homepage's page-specific behaviours

**Files:**
- Create: `lib/behaviors/hovers.ts`, `cursor.ts`, `services.ts`, `flags.ts`, `video.ts`, `magnet.ts`, `trail.ts`, `reel.ts`, `fanPointer.ts`, `ether.ts`, `stroke.ts`
- Modify: `lib/behaviors/index.ts`, `app/modules.ts`

**Interfaces:**
- Consumes: `lib/liquid-ether.ts`, `lib/stroke-text.ts`, `lib/behaviors/types.ts`.
- Produces: eleven named `Behavior` exports matching their filenames, re-exported from `lib/behaviors/index.ts`.

- [ ] **Step 1: Port the nine DOM-only behaviours**

Lift `initHovers`, `initCursor`, `initServices`, `initFlags`, `initVideo`, `initMagnet`, `initTrail`, `initReel`, `initFanPointer` from the `<script type="text/x-dc">` block in `.source/templates/home.html`, one file each, applying the porting-rules table from Task 5.

Keep every pointer guard exactly as written — for example `magnet` begins:

```ts
if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return () => {};
```

That is a capability check, not a width check, and stays per Global Constraints.

- [ ] **Step 2: Write `lib/behaviors/ether.ts`**

The original loads the module through the artifact resource table; here it is a dynamic import so Three.js stays out of the initial bundle.

```ts
import type { Behavior } from './types';

export const ether: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-ether]');
  if (!el) return () => {};
  let dispose: (() => void) | null = null;
  let dead = false;
  import('@/lib/liquid-ether')
    .then((m) => {
      if (dead) return;
      dispose = m.mount(el, {
        colors: ['#B8410A', '#F2600C', '#FFC89E'],
        mouseForce: 22, cursorSize: 110, resolution: 0.5,
        autoDemo: true, autoSpeed: 0.6, autoIntensity: 2.8,
        takeoverDuration: 0.25, autoResumeDelay: 900, autoRampDuration: 0.6,
      });
    })
    .catch((e) => console.warn('liquid-ether', e));
  return () => { dead = true; dispose?.(); };
};
```

- [ ] **Step 3: Write `lib/behaviors/stroke.ts`**

```ts
import type { Behavior } from './types';

export const stroke: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-stroke]');
  if (!el) return () => {};
  let dispose: (() => void) | null = null;
  let dead = false;
  import('@/lib/stroke-text')
    .then((m) => {
      if (dead) return;
      dispose = m.mount(el, {
        text: 'AROHANCE',
        strokeColor:
          getComputedStyle(document.documentElement).getPropertyValue('--ag-accent').trim() || '#F2600C',
        fillColor: '#F5F2ED', strokeWidth: 1.6, drawDuration: 1.8, fillDelay: 0.15,
        stagger: 0.08, ease: 'power2.out', trigger: 'scroll', fillMode: 'wipe',
        fontSize: 200, fontWeight: 700, letterSpacing: -9,
        fontFamily: "'Archivo',sans-serif",
      });
      el.style.minHeight = '';
    })
    .catch((e) => console.warn('stroke-text', e));
  return () => { dead = true; dispose?.(); };
};
```

- [ ] **Step 4: Wire the homepage module list**

In `app/modules.ts`, matching the original `componentDidMount` order:

```ts
import {
  SHARED, services, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, trail, fanPointer, type Behavior,
} from '@/lib/behaviors';

export const HOME_MODULES: Behavior[] = [
  ...SHARED, services, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, trail, fanPointer,
];
```

- [ ] **Step 5: Verify**

Run: `node --test lib/behaviors/ssr.test.mjs && npx tsc --noEmit && npm run build`
Expected: tests PASS, no type errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add lib/behaviors app/modules.ts
git commit -m "feat: port homepage effects including LiquidEther and StrokeText"
```

---

## Task 9: Verify homepage fidelity at 1440px

**Files:** none created; fixes land in `app/page.tsx`, `components/*`, or `tools/tw.mjs`.

**Interfaces:** consumes the running app; produces no new exports.

- [ ] **Step 1: Serve both versions**

```bash
npm run build && npm run start &
npx serve -l 8080 . &
```

The original bundle is then at `http://localhost:8080/Arohance%20Homepage.html`, the port at `http://localhost:3000/`.

- [ ] **Step 2: Compare at 1440px**

Using the Chrome automation tools: open both URLs in separate tabs, `resize_window` to 1440x900, and screenshot each section in turn — hero, `#intro`, ribbons, `#work`, `#clients`, `#testimonials`, `#services`, `#contact`, footer.

- [ ] **Step 3: Record and fix drift**

For each difference, classify before fixing:
- **A mapping bug** (a whole category of elements is wrong) — fix `tools/tw.mjs`, add a case to `tools/tw.test.mjs`, re-run the converter, re-paste.
- **A one-off paste error** — fix `app/page.tsx` directly.

Re-run `node --test tools/tw.test.mjs` after any mapper change.

- [ ] **Step 4: Confirm the effects run**

With the port open, check via console that: the hero canvas exists (`document.querySelector('[data-ag-ether] canvas')` is non-null), the scroll trail path animates on scroll, the `MAGNETIC.` word follows the cursor, and the menu button opens the overlay and locks scrolling.

- [ ] **Step 5: Confirm no WebGL leak (Review Focus 3)**

Navigate `/` → `/about` → `/` five times via the in-page menu, then run in console:

```js
performance.getEntriesByType('navigation').length,
document.querySelectorAll('canvas').length
```

Expected: exactly one `canvas`. More than one means a disposer is not firing — revisit Task 4 Step 4.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: homepage desktop fidelity against the original bundle"
```

---

## Task 10: Homepage responsive pass

**Files:** Modify `app/page.tsx`, `components/Nav.tsx`, `components/MenuOverlay.tsx`, `components/Footer.tsx`, `app/globals.css`

**Interfaces:** no new exports.

Additive variants only. Every change is a `max-md:` or `md:` class appended to an existing `className`; no existing class is edited or removed.

- [ ] **Step 1: Contain the marquee ribbons (Review Focus 5)**

The ribbon track is double width and translates by `-50%`. Its wrapper must clip and must not widen the page. On the ribbon wrapper, append:

```
overflow-x-clip max-w-[100vw]
```

- [ ] **Step 2: Add the overflow regression test**

Create `app/overflow.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Review Focus 5: a ribbon that widens the page makes every phone
// scroll sideways.
test('body clips horizontal overflow', () => {
  assert.match(readFileSync('app/globals.css', 'utf8'), /overflow-x:\s*hidden/);
});

test('every ribbon wrapper clips horizontally', () => {
  const page = readFileSync('app/page.tsx', 'utf8');
  const ribbons = [...page.matchAll(/data-ag-ribbon/g)];
  assert.ok(ribbons.length > 0, 'homepage should have ribbons');
  for (const m of ribbons) {
    const around = page.slice(Math.max(0, m.index - 400), m.index);
    assert.match(around, /overflow-x-clip/,
      'each ribbon needs a clipping wrapper');
  }
});
```

Run: `node --test app/overflow.test.mjs` — expected PASS after Step 1.

- [ ] **Step 3: Fix the seven known breakpoints**

At 390px, append variants for:

1. **Nav** — reduce the gutter and button size: `max-md:px-5 max-md:gap-2` on the nav, `max-md:h-10 max-md:w-10 max-md:rounded-xl` on both buttons, `max-md:h-9` on the logo.
2. **Menu / news panels** — full bleed: `max-md:w-full max-md:max-w-none max-md:rounded-none` on each panel, and `max-md:p-6` for inner padding.
3. **Hero `h1`** — the `clamp()` already shrinks; if the three lines still overflow, append `max-md:text-[clamp(44px,13vw,72px)] max-md:leading-[0.92]`.
4. **Work cards** — stack image over meta: `max-md:flex-col max-md:items-start max-md:gap-4` on each card's row wrapper.
5. **Footer** — single column: `max-md:flex-col max-md:items-start max-md:gap-8`.
6. **Section gutters** — `max-md:px-5` wherever a section uses the `clamp(20px,4.4vw,64px)` gutter.
7. **Vertical rhythm** — halve oversized section padding with `max-md:py-16` where the desktop value exceeds `py-24`.

Apply each only if the 390px screenshot shows it is needed. Do not add a variant speculatively.

- [ ] **Step 4: Verify at 768 and 390**

With Chrome automation, `resize_window` to 768x1024 then 390x844 and screenshot every section. Confirm: no horizontal scrollbar, no clipped or overlapping text, tap targets at least 40px, menu overlay usable, and the hero canvas still renders.

- [ ] **Step 5: Re-verify desktop is unchanged**

Resize to 1440x900 and re-screenshot the hero and `#work`. They must be identical to Task 9. If anything moved, a desktop class was edited — revert that edit and express the fix as a `max-md:` variant instead.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: make homepage responsive at 768 and 390"
```

---

## Task 11: Convert Services and About

**Files:**
- Create: `app/services/page.tsx`, `app/services/modules.ts`, `app/about/page.tsx`, `app/about/modules.ts`

**Interfaces:**
- Consumes: everything from Tasks 5–8; both pages use the full effect set already ported.
- Produces: default exports `Services()` and `About()`; `SERVICES_MODULES` and `ABOUT_MODULES`.

- [ ] **Step 1: Generate**

```bash
node tools/convert.mjs services && node tools/convert.mjs about
```

- [ ] **Step 2: Assemble both pages**

Same procedure as Task 7 Step 2: paste the generated JSX, substitute `Nav`, `MenuOverlay`, `Footer`, `ContactPill`, wrap in `<div data-ag-root>`, append `<AgRuntime modules={...} />`.

- [ ] **Step 3: Wire the module lists**

`app/services/modules.ts` is identical to the homepage set:

```ts
import {
  SHARED, services, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, trail, fanPointer, type Behavior,
} from '@/lib/behaviors';

export const SERVICES_MODULES: Behavior[] = [
  ...SHARED, services, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, trail, fanPointer,
];
```

`app/about/modules.ts` omits `trail` — About has no `[data-ag-trail]` element:

```ts
import {
  SHARED, services, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, fanPointer, type Behavior,
} from '@/lib/behaviors';

export const ABOUT_MODULES: Behavior[] = [
  ...SHARED, services, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, fanPointer,
];
```

- [ ] **Step 4: Verify and make responsive**

Run `npm run build`, then repeat Task 9 Steps 2–4 and Task 10 Steps 3–5 for `/services` and `/about` against their original bundles at 1440, 768 and 390.

- [ ] **Step 5: Commit**

```bash
git add app/services app/about
git commit -m "feat: convert Services and About pages"
```

---

## Task 12: Convert Careers

**Files:**
- Create: `app/careers/page.tsx`, `app/careers/modules.ts`, `lib/behaviors/roles.ts`

**Interfaces:**
- Consumes: `SHARED`.
- Produces: default export `Careers()`; `CAREERS_MODULES`; `roles: Behavior`.

- [ ] **Step 1: Generate**

Run: `node tools/convert.mjs careers`

- [ ] **Step 2: Port `roles`**

Lift `initRoles` from the `<script type="text/x-dc">` block in `.source/templates/careers.html` into `lib/behaviors/roles.ts` under the porting rules. The original's `applyPay` is gated on the frozen prop `showPay: true`, so inline it as always-on: delete the conditional and keep the body. Export `roles` from `lib/behaviors/index.ts`.

- [ ] **Step 3: Assemble the page and module list**

```ts
// app/careers/modules.ts
import { SHARED, roles, type Behavior } from '@/lib/behaviors';

export const CAREERS_MODULES: Behavior[] = [...SHARED, roles];
```

Assemble `app/careers/page.tsx` as in Task 7 Step 2.

- [ ] **Step 4: Verify and make responsive**

Run `npm run build`, then Task 9 Steps 2–4 and Task 10 Steps 3–5 for `/careers`. Pay particular attention to the role list rows and the `data-ag-count` counter at 390px.

- [ ] **Step 5: Commit**

```bash
git add app/careers lib/behaviors/roles.ts lib/behaviors/index.ts
git commit -m "feat: convert Careers page with role list behaviour"
```

---

## Task 13: Convert Studio, Case Study and Contact

**Files:**
- Create: `app/studio/page.tsx`, `app/case-study/page.tsx`, `app/contact/page.tsx`

**Interfaces:**
- Consumes: `SHARED` only — these three pages have no page-specific behaviours.
- Produces: default exports `Studio()`, `CaseStudy()`, `Contact()`.

Studio's original inlines its logic directly in `componentDidMount` rather than splitting it into methods, but the behaviours are the shared set — reveal, parallax, nav, shell. No new modules are needed. Confirm this while porting: if `.source/templates/studio.html` contains a behaviour not covered by `SHARED`, stop and port it as its own module rather than inlining it.

- [ ] **Step 1: Generate**

```bash
node tools/convert.mjs studio && node tools/convert.mjs case-study && node tools/convert.mjs contact
```

- [ ] **Step 2: Assemble all three**

As in Task 7 Step 2. Each ends with:

```tsx
<AgRuntime modules={SHARED} />
```

imported as `import { SHARED } from '@/lib/behaviors';`.

- [ ] **Step 3: Verify and make responsive**

Run `npm run build`, then Task 9 Steps 2–4 and Task 10 Steps 3–5 for `/studio`, `/case-study` and `/contact`.

- [ ] **Step 4: Commit**

```bash
git add app/studio app/case-study app/contact
git commit -m "feat: convert Studio, Case Study and Contact pages"
```

---

## Task 14: Whole-site verification

**Files:** Modify `README.md`; fixes land wherever verification finds them.

- [ ] **Step 1: Run every check**

```bash
node --test tools/ lib/ app/ && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all tests PASS, no type errors, no lint errors, build succeeds.

- [ ] **Step 2: Cross-page navigation sweep**

With the production server running, walk every menu link on every page. Confirm each route loads, the menu closes on navigation, the body is scrollable after navigating from an open menu (Review Focus 4), and only one `<canvas>` exists at a time (Review Focus 3).

- [ ] **Step 3: Confirm no page scrolls horizontally at 390px**

For each of the seven routes at 390x844, run in console:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Expected: `true` on all seven.

- [ ] **Step 4: Write the README**

Replace the `create-next-app` boilerplate with: what the project is, that the seven root `.html` files are the original design and the reference for fidelity, how to regenerate (`node tools/unbundle.mjs`, `node tools/convert.mjs <slug>`), and that `tools/` is one-shot tooling rather than part of the build.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: document the port, tooling and verification"
```

---

## Self-review notes

**Spec coverage.** Source analysis → Task 1. Scaffold, fonts, keyframes → Task 2. Styling conversion → Tasks 3 and 6. Non-standard markup (`style-hover`, `image-slot`, `sc-camel-view-box`, `x-dc`/`helmet`, `data-props`) → Task 6 Step 1 tests and Task 3's frozen constants. Behaviour inventory → Tasks 5, 8, 11, 12, 13; the per-page module table in the spec is realised by the `*_MODULES` arrays. Assets and fonts → Tasks 1 and 2. Responsive strategy, all seven named breakpoints → Task 10. Verification → Tasks 9, 10, 14. Out-of-scope items are not implemented anywhere.

**Type consistency.** `Behavior` is `(root: HTMLElement) => () => void` in Task 5 and is used unchanged in Tasks 6, 8, 11, 12, 13. `MOTION` is defined once in Task 5 and referenced by `reveal` and `parallax`. `mount(el, opts) => () => void` is fixed in Task 4 and consumed in Task 8. `styleToClasses(cssText, prefix)` is defined in Task 3 and called in Task 6. `SHARED` is defined in Task 5, extended with `shell` in Task 6, and consumed in Tasks 7 and 11–13.

**Review Focus coverage.** (1) arbitrary-value spaces → `tools/tw.test.mjs`; (2) SSR window/document → `lib/behaviors/ssr.test.mjs`; (3) WebGL leak → `lib/effects.test.mjs` plus Task 9 Step 5; (4) scroll lock → `ssr.test.mjs` plus Task 14 Step 2; (5) horizontal overflow → `app/overflow.test.mjs` plus Task 14 Step 3.

**Known limitation.** Tasks 9–13 gate on human visual comparison rather than automated assertions. That is deliberate: "renders indistinguishably from the original" has no cheap machine oracle, and adding a screenshot-diff harness would cost more than the port. The three source-level tests above pin the failure modes that visual review is worst at catching.
