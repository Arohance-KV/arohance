# Arohance — Next.js port

A Next.js 15 + Tailwind v4 port of seven hand-designed HTML pages: home,
about, services, studio, careers, contact, case study.

The seven root `Arohance *.html` files in this repo (`Arohance Homepage.html`,
`Arohance About.html`, `Arohance Services.html`, `Arohance Studio.html`,
`Arohance Careers.html`, `Arohance Contact.html`, `Arohance Case Study.html`)
are the **design reference**, not legacy content. They must stay
byte-identical — never edit them. Every page in `app/` is a port of one of
these, and correctness is defined as "renders indistinguishably from the
matching original," checked by the harness below, not by eye.

## Running it

```
npm install
npm run dev              # http://localhost:3000
npm run build && npm run start   # production build, then serve it
```

## The tooling (`tools/`)

These are one-shot / verification scripts. None of them run as part of
`npm run build` or `npm run dev` — they exist to regenerate the port's inputs
from the original bundles, and to check the result against them.

- **`node tools/unbundle.mjs`** — each root `.html` file is a self-unpacking
  bundle (a loader plus base64 assets), not plain markup. This extracts the
  real markup to `.source/templates/<slug>.html`, vendored JS libraries to
  `.source/vendor/`, images to `public/images/`, and fonts to `public/fonts/`.
  `.source/` is gitignored and regenerated on demand — run this if it's
  missing, or after a change to one of the root `.html` files.
- **`node tools/convert.mjs <slug>`** (`slug` is one of `home`, `about`,
  `services`, `studio`, `careers`, `contact`, `case-study`) — parses
  `.source/templates/<slug>.html` and rewrites its inline `style` attributes
  into Tailwind classes, writing draft JSX to `.source/jsx/<slug>.jsx`. That
  output is a starting point a developer hand-merges into
  `app/<slug>/page.tsx` (swapping `<img>`/internal `<a>` for
  `next/image`/`next/link`, wiring the page's behaviour mount) — it does not
  write into `app/` itself.
- **`tools/shoot.mjs`, `tools/compare.mjs`, `tools/mobile-audit.mjs`** — the
  fidelity harness. See below.

## Verifying fidelity

`tools/shoot.mjs` opens both the original bundle and the Next.js route in
Playwright at a given width and dumps a screenshot plus a JSON measurement
record; `tools/compare.mjs` diffs the two JSON records; `tools/mobile-audit.mjs`
reports absolute-threshold breakage (no "original" is worth diffing against
at a mobile width, since the originals have zero responsive breakpoints).

Desktop fidelity, at 1440 (requires a build first — `shoot.mjs`'s `port`
target starts `next start` itself, but doesn't build):

```
npm run build
node tools/shoot.mjs original 1440 900
node tools/shoot.mjs port 1440 900
node tools/compare.mjs 1440
```

This currently reports **exactly 5 differences**, every one expected:

- **4 live clock/timer readings** — a `[data-ag-clock]` wall clock (rendered
  on studio, contact, case-study) and the homepage showreel's video timer all
  read the live system clock. Two captures taken a couple of seconds apart
  will never show the same value; that's not a defect.
- **1 occluded background-color**, on Contact — a `background-color` that
  sits behind an always-opaque foreground layer on both the original and the
  port, so the actual color values were never visible to a user in either
  version and were never worth chasing.

Any other difference, or a different total, is a real regression — go find
it, don't wave it through.

Mobile, at 390 and 768:

```
node tools/shoot.mjs port 390 844
node tools/mobile-audit.mjs 390
node tools/shoot.mjs port 768 1024
node tools/mobile-audit.mjs 768
```

The hard gate is **zero page-level overflow** (`scrollWidth === clientWidth`)
on all seven pages at both widths — that's the "nobody gets horizontal
scroll on their phone" check. The same report also lists softer findings
(sub-40px tap targets, sub-12px text) at a fixed threshold; those were
triaged during the mobile responsive pass and aren't a build-breaking gate.

## The three regression guards (inside `compare.mjs`)

Five separate typography defects shipped past code review during this port
and were only caught by actually rendering the pages, not by reading a diff.
Each guard below exists so one of those root causes fails loudly, by name,
instead of reappearing as an unexplained wall of geometry deltas for someone
to re-diagnose from scratch:

1. **Real-element font rendering guard** — measures a real, already-on-the-
   page element per self-hosted family (an Archivo `<h1>`, a JetBrains Mono
   footer label, an Instrument Sans paragraph), not a synthetic test node.
   Catches a font family that silently stops resolving (wrong CSS, a
   reverted `globals.css`, a font file that failed to ship).
2. **`html` line-height guard** — asserts `<html>`'s computed line-height is
   the literal string `"normal"` on both targets. Tailwind's Preflight sets
   `line-height: 1.5` on `<html>`, which the original never had; left
   unoverridden, every element without its own explicit `leading-*` utility
   silently inherits the wrong line-height.
3. **Form control guard** — asserts a real `<textarea>`'s font-size,
   font-family, and height all match, on the pages that have one. A stray
   global `input, textarea, button { font: inherit }` outside any Tailwind
   `@layer` used to beat every utility class regardless of specificity;
   this catches that class of bug directly on a real control.

## Fonts

Archivo, Instrument Sans, and JetBrains Mono are self-hosted as WOFF2 files
extracted verbatim from the original bundles (`public/fonts/`, wired up via
`@font-face` rules in `app/globals.css`) — deliberately **not** `next/font`:
the converted markup references these families by their real CSS names
everywhere (because that's exactly what the original's own inline styles do),
and `next/font` only ever exposes a font under its own hashed internal name,
which nothing in this markup looks up.
