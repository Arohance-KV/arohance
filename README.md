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

## Tests

```
npm test
```

Runs `node --test` over the working glob (`tools/*.test.mjs lib/*.test.mjs
lib/behaviors/*.test.mjs`) — 61 tests. The obvious fallback, `node --test
tools/ lib/` (letting Node discover files under a directory itself), fails
on Node 22; only the explicit glob form works, which is why it's a script
instead of something left for each developer to remember.

**On a fresh clone, run `node tools/unbundle.mjs` once before `npm test`.**
Two files — `tools/unbundle.test.mjs` and `lib/behaviors/form.test.mjs` —
read from `.source/` (gitignored, produced by the unbundler; see "The
tooling" below), so the suite fails until that's been generated at least
once. `npm test` does not do this for you.

**Sequencing note for the fidelity harness:** `npm test` re-runs the real
unbundler (`unbundle.test.mjs` spawns `node tools/unbundle.mjs`), which
rewrites every file under `public/images/` and `public/fonts/` with a fresh
mtime — same bytes, new timestamp. `tools/shoot.mjs`'s `port` target
refuses to run against a `.next` build older than the newest file under
`app/`, `lib/`, `components/`, `public/` (see "Verifying fidelity"), so
running `npm test` *after* `npm run build` can make the very next
`node tools/shoot.mjs port ...` refuse, correctly, citing a stale build —
nothing meaningful changed, but the build genuinely now predates
`public/`. The guard is fail-closed and doing its job; it just means the
order matters: build immediately before shooting, and if `npm test` runs
in between, rebuild again first.

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
  `app/<slug>/page.tsx` (swapping `<img>` for `next/image` — the converter
  already emits `next/link`'s `<Link>` for internal anchors itself, so that
  part needs no manual swap — and wiring up the page's behaviour mount) — it
  does not write into `app/` itself. **Every `app/**/page.tsx` is generated
  *and* hand-augmented this way, and stays that way permanently — see
  "Changing the converter" below before regenerating one.**
- **`tools/shoot.mjs`, `tools/compare.mjs`, `tools/mobile-audit.mjs`** — the
  fidelity harness. See below.

## Changing the converter

Every `app/**/page.tsx` is `tools/convert.mjs`'s output for that slug,
hand-merged into `app/` once (see above) — but it did not stay pure,
untouched output. The mobile responsive pass added **166 hand-written
`max-lg:` classes across the seven files** (26 home / 25 about / 26
services / 19 studio / 28 contact / 18 case-study / 24 careers) directly in
`app/`, because `tools/convert.mjs` has no concept of a breakpoint at all —
it transcribes the original's inline desktop-only styles, one non-responsive
class per declaration, and nothing else. Each of the seven files carries a
header comment recording its own count; read it before touching that file.

Regenerating a page from the converter and pasting the result over the
committed file deletes all of that page's `max-lg:` classes silently — the
page still builds, still renders correctly at 1440, and `tools/compare.mjs`
(which only ever measures 1440) still reports the same known-acceptable "5
differences" it always does and still exits 0. Only `tools/mobile-audit.mjs`
at 390/768 would show it, and only if someone thinks to run it.

So a converter change (fixing a wrong Tailwind class in `tools/tw.mjs`, or
teaching it a new CSS shorthand) is never "regenerate, replace, done." The
procedure:

1. Fix `tools/tw.mjs` (never hand-edit a generated class string directly in
   `app/**/page.tsx` — the same wrong value likely repeats across other
   pages, and any future regeneration overwrites the hand-edit anyway).
2. `node tools/convert.mjs <slug>` for every affected page, producing a
   fresh `.source/jsx/<slug>.jsx`.
3. Diff that fresh output against the committed `app/<slug>/page.tsx`. The
   *only* differences should be the class string(s) your `tw.mjs` fix was
   meant to change. Anything else (missing `next/image`/`Link` swaps,
   different behaviour wiring) means a blind paste is about to regress
   something else.
4. Re-apply that page's `max-lg:` classes (and any other hand-merge deltas)
   on top of the freshly-generated output — they do not survive a blind
   paste and nothing regenerates them for you.
5. Re-run both gates before committing: `node tools/compare.mjs 1440` (must
   stay at exactly 5 known-acceptable differences, exit 0) and
   `node tools/mobile-audit.mjs 390`/`768` (zero page overflow). The first
   gate cannot see a lost `max-lg:` class — the second is the only thing
   here that can.

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

This currently reports **exactly 5 differences**, every one expected, and
`compare.mjs` classifies each of the 5 by name and **exits 0** when nothing
else is wrong (1 otherwise) — the exit code is a real pass/fail signal, safe
to wire into CI or a commit hook, not just a number to eyeball against this
README:

- **4 live clock/timer readings** — a `[data-ag-clock]` wall clock (rendered
  on studio, contact, case-study) and the homepage showreel's video timer all
  read the live system clock. Two captures taken a couple of seconds apart
  will never show the same value; that's not a defect.
- **1 occluded background-color**, on Contact — a `background-color` that
  sits behind an always-opaque foreground layer on both the original and the
  port, so the actual color values were never visible to a user in either
  version and were never worth chasing.

Any other difference, or a different total, is a real regression — go find
it, don't wave it through. Concretely: `compare.mjs` masks out only the
literal clock/timer text shape and only Contact's own specific, hardcoded
background-color *value pair* before deciding pass/fail (not just "Contact
is allowed to differ here") — so a genuine regression that happens to land
on the same page (even the same line) as one of the four clock captures,
or that changes Contact's background to any value other than the two known
ones, is still caught and still named in a `RESIDUAL` section. The verdict
was never "the total is still 5," it's "everything is accounted for."

**Known limitation of the Contact background-color check:** it measures
`getComputedStyle(document.body).backgroundColor` only. On Contact, `<body>`
sits underneath an opaque `[data-ag-root]` layer that is what a visitor
actually sees — the same layer that makes this diff acceptable in the first
place (see above). That means this check only ever catches a change to the
*hidden* `<body>` colour; a real, user-visible regression on the *visible*
root layer's own background would not be measured by this line at all, on
either target. Widening the harness to also measure `[data-ag-root]` is
out of scope for this fix wave — recorded here so the gap is visible
without having to read `tools/compare.mjs`'s comments.

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

## Four nav modules, on purpose

`lib/behaviors/` has four separate, similarly-named nav modules —
`nav.ts`, `navCareers.ts`, `navOnDark.ts`, `navPad.ts` — instead of one
shared module with internal branches. Anyone browsing the directory hits
these four look-alikes before they hit an explanation, so: this is
deliberate, not undone refactoring. Each page's original nav-scroll handler
genuinely differs (hardcoded button recolouring vs. none, a `resize`
listener vs. none, a live `onDark`-conditional recolour vs. none, a CTA
toggle vs. none) — confirmed, per module, by diffing each against its own
`.source/templates/<slug>.html`. Composing the wrong one into a page adds or
removes a behaviour its original never had. Do not merge these into one
"smart" nav that branches on a prop; see the doc comment at the top of each
file for its own specific, verified justification, and each page's own
`app/<slug>/modules.ts` for which module that page actually mounts.

## Fonts

Archivo, Instrument Sans, and JetBrains Mono are self-hosted as WOFF2 files
extracted verbatim from the original bundles (`public/fonts/`, wired up via
`@font-face` rules in `app/globals.css`) — deliberately **not** `next/font`:
the converted markup references these families by their real CSS names
everywhere (because that's exactly what the original's own inline styles do),
and `next/font` only ever exposes a font under its own hashed internal name,
which nothing in this markup looks up.

## Why Next is pinned to 15.5.26

`package.json` pins `next` and `eslint-config-next` to the exact version
`15.5.26` — not a `^15` range. Deliberate: Next 16 switches the default
dev/build tooling to Turbopack, and this entire port's fidelity claim was
built and measured against Next 15's webpack-based build. A hand-rolled
converter (`tools/tw.mjs`) emitting Tailwind v4 arbitrary-value classes is
exactly the kind of thing that's worth re-verifying under a different
bundler, not assuming is fine. Upgrading is a real migration, not a patch
bump — treat it like any other change that could move rendered output (see
"Changing the converter" above): bump the version deliberately, rebuild,
and re-run the full harness (`compare.mjs` at 1440, `mobile-audit.mjs` at
390 and 768) before trusting the new build, rather than letting a `^`
range pick it up silently on some future `npm install`.

## Forms don't submit anywhere

Contact's and Careers' forms (`[data-ag-form]`) do not send data anywhere,
by design — matching the original static bundles exactly. On submit, the
handler (`lib/behaviors/form.ts`) calls `preventDefault()`, swaps the
button's text to a per-page confirmation message, and disables it. There is
no `fetch`, no `mailto:`, no backend, nothing to configure. This is not a
missing feature introduced by the port; the original `Arohance Contact.html`
/ `Arohance Careers.html` never had one either.

## Lint warnings you'll see

`npm run lint` is 0 errors, but not 0 warnings (67, as of this writing) —
that's expected, not a backlog to clear:

- **Most of them** (`@next/next/no-img-element`, on `app/page.tsx`,
  `app/services/page.tsx`, `app/about/page.tsx`) are decorative or fill
  images — client-logo grids, animated 3D rail cards — left as plain
  `<img>` on purpose. Only the measurable key visuals (hero art, work-card
  thumbnails, the logo) were converted to `next/image` with real, known
  width/height; the rest don't have a meaningful fixed intrinsic size to
  give it. The warning is a real performance hint being knowingly declined
  here, not a defect.
- **The rest** (`@typescript-eslint/no-unused-vars`,
  `no-unused-expressions`, in `lib/behaviors/reel.ts`,
  `lib/liquid-ether.ts`, `lib/stroke-text.ts`) are unused catch bindings and
  one dead computation, inherited from near-verbatim ports of the original
  page scripts — matching the source exactly was chosen over tidying up
  code this project doesn't otherwise touch. `tools/shoot.mjs` has one more
  (an `eslint-disable` comment for a function only ever invoked indirectly,
  via `page.evaluate()`, which the linter can't see).

No rule is disabled repo-wide or per file to make any of these go away —
a warning that's explained is more useful than one that's hidden, and
turning off `no-img-element` here would also hide a genuine finding on a
real photo added later. `.source/**` (vendored third-party bundles, not
this project's code) is excluded from lint entirely, the same as
`node_modules/**`/`.next/**`/`out/**`/`build/**`.
