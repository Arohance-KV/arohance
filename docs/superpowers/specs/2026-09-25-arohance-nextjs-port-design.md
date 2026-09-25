# Arohance website — HTML → Next.js + Tailwind port

**Date:** 2026-09-25
**Status:** Approved design

## Intent

Seven hand-built HTML pages in the repo root are the finished design for the
Arohance studio site. Replace them with a Next.js application that renders the
**same design exactly**, styled with Tailwind, and that works on phones.

The existing HTML is the specification. Where this document and the rendered
HTML disagree, the HTML wins.

### Success criteria

1. Every page renders indistinguishably from its HTML original at 1440px.
2. Every page is usable and uncramped at 390px.
3. All motion and interaction behaviour is preserved, including the WebGL
   hero background, on mobile as well as desktop.
4. Styling is expressed as Tailwind classes, not inline `style` attributes.

### Stated constraints (from the user)

- Exact design — pixel fidelity over idiomatic class names.
- Tailwind for styling.
- Mobile responsive.

### Decisions taken (user-selected)

| Question | Choice |
|---|---|
| Fidelity vs. idiomatic Tailwind | **Mechanical-exact.** Arbitrary values where needed; long class strings accepted. |
| Mobile scope | **Fix what breaks.** Add breakpoints only where layout actually fails; desktop output unchanged. |
| Heavy effects on mobile | **Everything everywhere.** LiquidEther and all pointer effects ship on phones too. |
| Sequencing | **Homepage first**, reviewed, then the remaining six. |

## Source analysis

Each root `.html` file is a Claude artifact *bundle*, not a page: ~384 lines of
unpacking loader plus four JSON script blocks. The real markup is a JSON string
in `<script type="__bundler/template">`, and assets are base64 in the
accompanying manifest block.

Extracted templates:

| Page | Template | Inline styles | `style-hover` | Classes | Media queries |
|---|---|---|---|---|---|
| Homepage | 133 KB | 498 | 43 | 0 | 2 (reduced-motion only) |
| Services | 97 KB | 309 | 12 | 0 | 2 (reduced-motion only) |
| About | 68 KB | 168 | 12 | 0 | 2 (reduced-motion only) |
| Careers | 55 KB | 208 | 11 | 0 | 1 (reduced-motion only) |
| Studio | 54 KB | 206 | 11 | 0 | 0 |
| Case Study | 45 KB | 150 | 11 | 0 | 0 |
| Contact | 39 KB | 118 | 12 | 0 | 0 |

**There are zero CSS classes and zero responsive breakpoints.** Sizing is fluid
via `clamp()` and `vw`/`cqw` units. The only `@media` rules are
`prefers-reduced-motion`.

187 bundled assets deduplicate by content hash to **54 unique files**: 17 JPG,
15 PNG, 1 SVG, 11 WOFF2, and 10 JS libraries (Three.js r160, GSAP 3.12.5,
React + ReactDOM, the artifact `dc-runtime`, the `image-slot` authoring
component, plus three genuine page modules).

### Non-standard markup to resolve

| Construct | Origin | Resolution |
|---|---|---|
| `x-dc`, `helmet` elements | artifact runtime wrappers | dropped; head content moves to `app/layout.tsx` |
| `style-hover="..."` | artifact runtime hover shim | becomes Tailwind `hover:` variants |
| `image-slot` element | authoring-time image placeholder | becomes `next/image` |
| `sc-camel-view-box` | bundler-mangled `viewBox` | restored to `viewBox` |
| `data-props` on the script tag | artifact editor knobs | frozen to their defaults as constants |

The `data-props` are authoring knobs that never varied: `accentColor #F2600C`,
`motion "Expressive"`, `customCursor true`, `scrollTrail true`, `showPay true`.
They become constants. No configuration surface is built for values with one
value; `--ag-accent` stays a CSS custom property because the design already
references `var(--ag-accent,#F2600C)` throughout.

## Architecture

```
app/
  layout.tsx              fonts, html/body, globals
  globals.css             resets + @keyframes
  page.tsx                /             Homepage
  about/page.tsx          /about
  services/page.tsx       /services
  studio/page.tsx         /studio
  careers/page.tsx        /careers
  contact/page.tsx        /contact
  case-study/page.tsx     /case-study
components/
  Nav.tsx                 fixed top bar, logo, news + menu buttons
  MenuOverlay.tsx         blurred overlay, news panel, menu panel
  Footer.tsx
  ContactPill.tsx         floating "Up / make contact" pill
  AgRuntime.tsx           'use client'; mounts behaviour modules for a page
lib/
  behaviors/*.ts          one module per behaviour, (root) => cleanup
  liquid-ether.ts         vanilla Three.js fluid sim, ported as-is
  stroke-text.ts          vanilla GSAP outline-draw, ported as-is
public/images/            33 deduplicated images
tools/
  convert.mjs             the one-shot template to TSX converter
```

### Styling conversion

A Node script (`tools/convert.mjs`) parses each extracted template and rewrites
every `style` attribute into Tailwind classes:

- Common declarations map to real utilities — `display:flex` becomes `flex`,
  `position:fixed` becomes `fixed`, `color:#F5F2ED` becomes `text-[#F5F2ED]`,
  `padding:16px` becomes `p-4`.
- Shorthands split where Tailwind needs it — `padding:16px clamp(20px,4.4vw,64px)`
  becomes `py-4 px-[clamp(20px,4.4vw,64px)]`.
- Anything exotic falls back to an arbitrary property — `[mix-blend-mode:screen]`.
- Spaces inside arbitrary values become `_`, per Tailwind's syntax.
- `style-hover` declarations run through the same mapper with a `hover:` prefix.

Codegen rather than hand-conversion because the mapping table is written once
and every page benefits: a wrong rule is one line to fix and re-run, not two
hundred call sites to hunt. The emitted TSX is the artefact that ships and gets
hand-tuned; the converter is a one-shot tool, not a build step.

Keyframes (`ag-marquee`, `ag-marquee-rev`, `ag-rail-l`, `ag-rail-r`, `ag-wave`,
`ag-pulse`, `ag-drift`) are long generated blocks with no Tailwind equivalent.
They move verbatim into `globals.css`.

### Behaviour

The page logic is a `DCLogic` subclass whose methods are already
framework-agnostic DOM code: query `[data-ag-*]`, attach listeners, push a
cleanup. That shape is kept. Each becomes `(root: HTMLElement) => () => void`,
and a single `AgRuntime` client component runs the set for its page inside one
`useEffect`, disposing on unmount.

Rewriting imperative GSAP/RAF animation into React state would be a rewrite,
not a port, and every rewrite is a chance to drift. The near-verbatim path is
both less work and lower risk.

**Shared by all pages:** `applyTheme`, `reveal` (IntersectionObserver fade-up),
`parallax`, `nav` (scroll state, dark-section detection), `shell` (overlay,
news + menu panels, burger, Escape, scroll lock), `clock`, `form`.

**Page-specific:**

| Module | Pages |
|---|---|
| `ether` (Three.js LiquidEther) | Home, Services, About |
| `stroke` (GSAP outline draw) | Home, Services, About |
| `magnet`, `reel`, `fanPointer` | Home, Services, About |
| `trail` (SVG scroll trail) | Home, Services |
| `hovers`, `cursor`, `flags`, `video`, `services` | Home, Services, About |
| `roles`, `pay` | Careers |

Case Study, Contact and Studio use only the shared set.

### Fonts and assets

Archivo and Instrument Sans load through `next/font/google`, which self-hosts
the identical Google WOFF2 files — exact, and it removes 11 binaries from the
repo. The 33 unique images are written to `public/images/` under readable names
derived from their `alt` text, with a UUID-to-filename map applied during
conversion. Internal links (`Arohance%20About.dc.html`) are rewritten to routes.

### Responsive strategy

A second pass over the emitted TSX. Desktop classes are never modified; mobile
work is additive `max-md:` / `md:` variants, so desktop output stays identical.

Both existing grids are already `repeat(auto-fit,minmax(min(100%,Npx),1fr))`
and need nothing. The places that genuinely fail at 390px:

1. Nav — logo and two 46px buttons against `clamp(20px,4.4vw,64px)` padding.
2. Menu and news panels — panel widths need to go full-bleed.
3. Hero `h1` — the three-line `WE MAKE / YOU / MAGNETIC.` type scale.
4. Work cards — image + meta rows that assume horizontal room.
5. Footer columns.
6. Marquee ribbons — must scroll without creating page-level horizontal overflow.
7. Section gutters and vertical rhythm.

Effects are not disabled on mobile, per the decision above.

## Verification

Chrome automation is available in this session. For each page, the original
bundle and the Next.js route are opened at **1440**, **768** and **390** and
compared section by section. Fidelity is confirmed by that comparison, not by
assertion. `npm run build` must also pass clean.

## Out of scope

- No CMS, forms backend, or analytics — forms keep their current client-side
  behaviour.
- No content or copy changes.
- No redesign. Mobile layout decisions are the minimum needed to stop breakage.
- The original `.html` bundles stay in the repo untouched as the reference.
