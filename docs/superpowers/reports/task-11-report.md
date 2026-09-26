# Task 11 Report: Convert the Services and About pages

## Status: DONE_WITH_CONCERNS

Both pages are converted, assembled, and verified for fidelity, `fanPointer`
status, and module-list correctness. `node --test` (47/47) and
`npx tsc --noEmit` (exit 0) are clean. **`npm run build` is not clean** — it
fails on a real, reproducible ESLint error in both new pages. I root-caused
it to a confirmed upstream bug in `@next/eslint-plugin-next`, not to
anything wrong with the converter or the markup, and **did not fix it**
(neither by hand-editing the pages nor by touching `tools/convert.mjs` or
any config), per the task's explicit instruction to stop and report a build
failure on converted JSX rather than work around it. Full diagnosis below.
This is the same shape of outcome Task 7 reported (build gate red, root
cause fully traced, fix deliberately deferred to a ruling) — I'm following
that precedent rather than inventing a new one.

---

## What I implemented

1. Ran `node tools/convert.mjs services` and `node tools/convert.mjs about`
   fresh (not reused stale copies). Both exited 0; the completeness guard
   stayed silent on both — no unknown construct, no unresolvable link/asset
   reference.
2. `app/services/page.tsx` and `app/about/page.tsx` — Server Components (no
   `'use client'`), assembled from `.source/jsx/{services,about}.jsx`
   verbatim, per Ruling 1 (no shared `Nav`/`MenuOverlay`/`Footer`). Built by
   a small one-off Node script (same method Task 7 used): read the
   converter's raw output, assert each target substring occurs **exactly
   once** before replacing it, wrap with the header/footer. This trades
   "typed by hand" risk for "verified by diff" certainty.
3. `app/services/modules.ts`, `app/about/modules.ts` — `SERVICES_MODULES`
   and `ABOUT_MODULES`, each a module-level `Behavior[]` constant, derived
   from each page's own `componentDidMount` (see below), not copied from
   the brief.
4. `app/services/services-runtime.tsx`, `app/about/about-runtime.tsx` — six
   -line `'use client'` wrappers mirroring `app/home-runtime.tsx` exactly
   (import `AgRuntime`, import the page's modules constant, render
   `<AgRuntime modules={...} />`).
5. `next/image` swaps with measured dimensions (see table below).
   `<ContactPill />` mounted directly on each page (already a client
   component), followed by the page's own runtime wrapper, before the
   root's closing `</div>` — same position as home.

---

## Per-page fidelity diff

`diff -u .source/jsx/<slug>.jsx app/<slug>/page.tsx`, counted precisely via
`grep -c '^[+-]'` minus the `---`/`+++` file-header lines (not eyeballed):

### Services: 4 removed / 10 added (14 changed lines)

| Bucket | Removed | Added |
|---|---|---|
| Wrapper (imports, `export default function Services()`, `return (`, closing `);`/`}`, the two mount lines `<ContactPill />`/`<ServicesRuntime />`) | 3 | 9 |
| `next/image` swap (logo) | 1 | 1 |

Every changed line falls into exactly one of the two buckets. 2 diff hunks
total, confirmed via `grep -c '^@@'` — head (imports/logo) and tail
(mounts/closing) — nothing else in the file differs.

### About: 9 removed / 15 added (24 changed lines)

| Bucket | Removed | Added |
|---|---|---|
| Wrapper (same shape as Services, `About`/`AboutRuntime` names) | 3 | 9 |
| `next/image` swap (logo) | 1 | 1 |
| `next/image` swap (studio-wide photo) | 1 | 1 |
| `next/image` swap × 4 (portraits) | 4 | 4 |

Wrapper bucket is identical in shape/count to Services' and to Home's own
last-recorded wrapper diff (3 removed / 9 added each) — internally
consistent across all three pages, which gave me confidence the assembly
script was not introducing accidental reformatting.

**No other difference exists in either file.** `className` strings are
untouched byte-for-byte — the swaps only change the tag name and insert
`width`/`height`/`priority` attributes, exactly the pattern home's own
`page.tsx` already uses (verified by direct comparison, e.g. home line 169:
`<Image src=... width={868} height={488} priority className="h-full w-full object-cover" />`).

---

## `fanPointer` verification — both pages, with evidence

Ruling 3 requires re-verifying, not assuming, from each page's own source.
I did both checks independently (not trusting the `data-ag-fan` count
signal from Task 8's carry-forward note):

### Services (`.source/templates/services.html`)

- `componentDidMount` is at line 673 (script block starts line 671). Read
  directly (lines 673–692):
  ```
  applyTheme, initReveal, initParallax, initNav, initServices, initHovers,
  initCursor, initClock, initForm, initFlags, initVideo, initShell,
  initEther, initMagnet, initStroke, initReel, initTrail
  ```
  **No `initFanPointer` call.**
- `grep -noi "fanpointer"` over the **whole file**: exactly **one** hit,
  line 897 — `initFanPointer() {`, the method's own definition. A call site
  (`this.initFanPointer()`) would be a *second* hit; there isn't one.
- `data-ag-fan` appears exactly twice in the whole file: lines 899 and 903
  (`root.querySelector('[data-ag-fan]')` and
  `root.querySelector('[data-ag-fanfallback]')`), both **inside**
  `initFanPointer`'s own body (which starts at line 897, itself inside the
  script block that starts at line 671) — never as markup.

### About (`.source/templates/about.html`)

- `componentDidMount` is at line 520 (script block starts line 518). Read
  directly (lines 520–538):
  ```
  applyTheme, initReveal, initParallax, initNav, initServices, initHovers,
  initCursor, initClock, initForm, initFlags, initVideo, initShell,
  initEther, initMagnet, initStroke, initReel
  ```
  **No `initFanPointer` call** (also no `initTrail` call — see module-list
  section).
- `grep -noi "fanpointer"` over the whole file: exactly **one** hit, line
  683 — the method definition, same shape as Services.
- `data-ag-fan` appears exactly twice: lines 685 and 689, both inside
  `initFanPointer`'s own body — never as markup.

**Verdict: dead in both pages, in the same two independent ways as the
homepage (Task 8).** Neither page genuinely uses `fanPointer`. Consistent
with `initFanPointer` having been deleted from `lib/behaviors` entirely —
it cannot be imported even if I wanted to. `SERVICES_MODULES`/
`ABOUT_MODULES` omit it, with the evidence documented inline in each
`modules.ts`.

---

## Module lists, derived from each page's own `componentDidMount`

### Services — `SERVICES_MODULES`

Full call order (source, lines 673–692, quoted above) minus the SHARED
members (`applyTheme, initReveal, initParallax, initNav, initShell,
initClock, initForm`), in the order the remaining calls appear:

```
services, hovers, cursor, flags, video, ether, magnet, stroke, reel, trail
```

**Matches the brief exactly**, once `fanPointer` — which the brief lists
but which does not exist as an export and is dead per the verification
above — is correctly excluded. `services.html` carries its own
`[data-ag-trail]` SVG (confirmed: `.source/jsx/services.jsx` has exactly
one `data-ag-trail` occurrence, matching the wrapper markup), so `trail`
correctly stays in.

### About — `ABOUT_MODULES`

Full call order (source, lines 520–538, quoted above) minus SHARED members,
in order:

```
services, hovers, cursor, flags, video, ether, magnet, stroke, reel
```

No `trail`. **Matches the brief exactly** (again modulo dropping
`fanPointer`). This is confirmed on stronger grounds than "not called": I
checked whether `initTrail` exists at all, not just whether it's invoked —
`grep -c "initTrail" .source/templates/about.html` → **0**, and
`grep -c "data-ag-trail" .source/templates/about.html` → **0**. The method
and its target markup are both entirely absent from the source document,
not merely present-but-dead (contrast with `services.html`, where
`initTrail` exists and is called, and `data-ag-trail` markup exists too —
2 occurrences of `initTrail` there: the method definition and its call
site).

Both `SERVICES_MODULES` and `ABOUT_MODULES` are separate module-level
`export const` arrays (per Ruling 4), each documented inline with this
evidence.

---

## Images converted to `next/image`

Measured with the project's `image-size@2.0.4` (`imageSize(buffer)` named
export, same probe Task 7 used), run against the actual files in
`public/images/`:

| Page | File | Width | Height | Used for | `priority` |
|---|---|---|---|---|---|
| Services | `93c7aab596.png` | 422 | 133 | Nav logo | yes |
| About | `93c7aab596.png` | 422 | 133 | Nav logo | yes |
| About | `b7afa59dc4.jpg` | 950 | 535 | "The studio, wide" (first content photo, `(01) The studio` section) | yes |
| About | `29a3935bff.jpg` | 700 | 900 | Portrait — NEER, Founder & CEO | no |
| About | `64f3340595.jpg` | 700 | 900 | Portrait — KV, CMO | no |
| About | `fb23c7b2c7.jpg` | 700 | 900 | Portrait — Rohan Sunwar, Technology & Product | no |
| About | `234f5a93d8.jpg` | 700 | 900 | Portrait — Ayesha Khan, Content & Production | no |

**Selection rule** (matching the homepage's own discriminator, verified by
re-reading `app/page.tsx`): an `<img>` sitting inside a wrapping `<div>`
that carries `data-hover-img` and/or `data-parallax` (a real, prominent
content photo — the homepage's #work key visuals used exactly this shape)
gets converted; an `<img>` carrying `data-hover-img` **directly on the img
tag itself** (the homepage's #clients brand-logo grid) does not, and
neither do decorative/background/placeholder images. On Services, the only
matching element is the logo — the `data-ag-stream` "content studio"
background cards (18 occurrences, 4 distinct files, `loading="lazy"
decoding="async" draggable="false"`) are byte-for-byte the same pattern
homepage already leaves as plain `<img>`, and the lightbox placeholder is
the same base64 GIF stub homepage also leaves alone. On About, the four
team portraits and the studio-wide photo all match the wrapping-div
pattern, so all six images (logo + 5) were converted. `priority` is on the
logo and the first large image only, per instruction — for Services that
means the logo is the *only* priority image (there is no other large photo
on that page); for About it's the logo plus the studio-wide photo (the
first content photo in reading order, appearing before the four
portraits).

`className` is unchanged on every swap; attribute order matches home's
established pattern (`src, alt, width, height, priority?, className`, or
`data-ag-logo="", src, alt, width, height, priority, className"` for the
logo).

---

## Build-gate problem — found, root-caused, NOT worked around

### The failure

`npm run build` fails (`Failed to compile.`) with three ESLint **errors**
(not warnings — these fail the build):

```
./app/about/page.tsx
68:11  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />`
       from `next/link` instead.  @next/next/no-html-link-for-pages

./app/services/page.tsx
69:11  Error: (same message)
70:11  Error: (same message)
```

`about`'s line 68 is its "Home" menu link (`href="/"`, converted from
`about.html`'s own source href, unmodified by me). `services`' lines 69–70
are its "Home" (`href="/"`) and "Work" (`href="/#work"`) menu links, same
provenance. **These `href` values are exactly what the converter emits from
each page's own source** — I did not write, alter, or hand-place them; they
are part of the verbatim-pasted markup this task's own rules require.

### Root cause — traced into the actual rule source, not guessed

I read `node_modules/@next/eslint-plugin-next/dist/rules/no-html-link-for-pages.js`
and its `utils/url.js` helper directly. The rule builds its list of "real
Next.js routes" by walking the `app/` directory. The walker
(`getUrlFromAppDirectory` → `parseUrlForAppDir`) correctly recognises
`page.tsx` **only at the directory level it is directly called on**. When
it recurses into a **subdirectory** (e.g. `app/about/`), it calls the
*wrong* helper — `parseUrlForPages` (the **Pages Router** variant) instead
of recursing into itself:

```js
// utils/url.js, parseUrlForAppDir, the subdirectory-recursion branch:
if (dirent.isDirectory(dirPath) && !dirent.isSymbolicLink()) {
  res.push.apply(res, _to_consumable_array(parseUrlForPages(urlprefix + dirent.name + '/', dirPath)));
  //                                        ^^^^^^^^^^^^^^^ bug: should be parseUrlForAppDir
}
```

`parseUrlForPages` treats **every** `.ts(x)`/`.js(x)` file in the directory
as its own route by filename, rather than recognising that `page.tsx`
means "this directory is the route." So for `app/about/`, it generates
routes `/about/page`, `/about/modules`, `/about/about-runtime` — never
`/about` itself. I confirmed this empirically, not just by reading the
code: `<a href="/about">`, `<a href="/services">`, `<a href="/studio">`,
etc. appear in **every** menu panel on **every** page (including home's
own, and each page's link to itself) and **none** of them are flagged —
only the literal `href="/"` links are, because "/" is the one route
correctly detected at the top-level call (`app/page.tsx` is read directly
by the initial, non-buggy invocation).

This is a confirmed bug in Next.js's own shipped ESLint plugin
(`@next/eslint-plugin-next`), not anything in this project's converter or
in my markup. `grep -rl "next/link" **/*.{ts,tsx}` across the whole repo
returns nothing — `<Link>` is not used anywhere in this codebase; every
page's internal navigation has always been plain `<a>`, a pattern already
established and approved in Tasks 6b/7/8. Home never triggers this because
its own nav link is `href="#top"` (it never needs to link to `/`, since
it's already there) — it was invisible until a **second** page existed
that links back to home. **Every future page (studio, careers, contact,
case-study) will have this exact same `href="/"` Home link and will hit
this exact same error the moment it's built** — this is not particular to
Services/About, it is inherent to the site having more than one page.

### Diagnostic-only check (performed and fully reverted — not shipped)

To find out whether anything else was wrong (SSR, types, chunking) *behind*
this lint error, I temporarily added `eslint: { ignoreDuringBuilds: true }`
to `next.config.ts`, ran `npm run build`, and reverted the file
immediately after. `git diff next.config.ts` is empty — nothing shipped.
With linting bypassed, the build is otherwise completely clean:

```
✓ Compiled successfully in 1606ms
   Skipping linting
   Checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (6/6)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      323 B         115 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 321 B         115 kB
└ ○ /services                              323 B         115 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-2dbbf79f36f0dfa2.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          2.08 kB
```

`/about` and `/services` are in the same ballpark as `/` (all three
~115 kB First Load JS, ~320 B page-specific size) — satisfies Fact #1.
Chunk inspection (`.next/static/chunks/`, sizes via `ls -la`) confirms
three.js/GSAP stay in **shared, lazily-loaded** chunks, not inlined per
route: `b536a0f1.*.js` (481 KB, liquid-ether/three.js), `c15bf2b0.*.js`
(51 KB) and `605.*.js` (18 KB, gsap/stroke-text) — one instance of each,
same chunk hashes Task 8 originally identified, now shared across three
pages instead of one.

This confirms the *only* problem is the lint rule itself — not a real
defect in the pages, the converter's output, or the routing.

### Why I did not fix this

Per the task's explicit instruction — *"If the build fails on converted
JSX, the fix belongs in `tools/convert.mjs` — and in that case stop and
tell me rather than editing the tool yourself"* — and per Ruling 5's
broader instruction not to hand-tune converter output. I considered three
remediation shapes, implemented none of them, and leave the choice to you:

1. **Convert internal `<a href="...">` links to `<Link href="...">` in
   `tools/convert.mjs`.** Systematic and generated-code-correct, but a real
   architecture change: it touches every internal link on all seven pages,
   including the four already reviewed and approved (home, and this task's
   own two) — `<Link>` renders as an `<a>` in the DOM (same tag, same
   classes, same visual output) but adds client-side routing/prefetch
   behaviour that plain `<a>` intentionally didn't have. Not something I
   judged safe to decide unilaterally.
2. **Disable/reconfigure just this rule** (e.g.
   `eslint.config.mjs` rule-level override, similar in spirit to Task 5's
   scoped vendored-file override) — defensible given the rule is
   confirmed-buggy for this project's `app/` directory shape and can only
   ever catch the "/" case, never the nested ones it's nominally meant to
   catch, so it's already an inconsistent guard, not a complete one.
3. Something else you prefer.

I did not touch `tools/convert.mjs`, `eslint.config.mjs`, or ship any
change to `next.config.ts`, and I did not hand-edit either page's `<a>`
tags to route around it.

---

## Gate output

### `node --test tools/*.test.mjs lib/*.test.mjs lib/behaviors/*.test.mjs`
```
# tests 47
# pass 47
# fail 0
```

### `npx tsc --noEmit`
Exit 0, zero output.

### `npm run build` (real, unmodified — the actual gate)
Exit 1. Compiles successfully, fails at the lint step:
```
✓ Compiled successfully in 6.0s
Linting and checking validity of types ...
Failed to compile.
./app/about/page.tsx
68:11  Error: ... @next/next/no-html-link-for-pages
./app/services/page.tsx
69:11  Error: ... @next/next/no-html-link-for-pages
70:11  Error: ... @next/next/no-html-link-for-pages
```
(plus the same pre-existing `no-img-element`/`no-unused-vars` warnings
already present on `main` for `app/page.tsx`, `lib/behaviors/reel.ts`,
`lib/liquid-ether.ts`, `lib/stroke-text.ts` — unrelated to this task, not
modified by me.)

### Route-size table
Only obtainable via the reverted diagnostic run above (the real build
doesn't reach static generation). See table above:
`/` 115 kB, `/about` 115 kB, `/services` 115 kB First Load JS — same
ballpark, three.js/GSAP confirmed in shared lazy chunks.

---

## Files changed

New:
- `app/services/page.tsx`
- `app/services/modules.ts`
- `app/services/services-runtime.tsx`
- `app/about/page.tsx`
- `app/about/modules.ts`
- `app/about/about-runtime.tsx`

Touched-then-fully-reverted (diagnostic only, zero net diff, confirmed via
`git diff next.config.ts` returning empty):
- `next.config.ts`

Not touched: `tools/`, `lib/`, `components/`, `app/page.tsx`,
`app/modules.ts`, `app/home-runtime.tsx`, `eslint.config.mjs`,
`package.json`. Confirmed via `git status --porcelain` showing only
`app/about/` and `app/services/` as untracked additions.

---

## Self-review

- **Fidelity, per page:** Services 4 removed/10 added (14 changed);
  About 9 removed/15 added (24 changed). Every changed line is the
  wrapper, a `next/image` swap, or a component mount — no other
  difference, confirmed by hunk count (2 for Services, 6 for About) and by
  direct re-reading of both generated files' head and tail.
- **`fanPointer`:** independently re-verified for both pages (not assumed
  from the homepage's carry-forward signal) — no call site in either
  page's own `componentDidMount`, target markup only inside the dead
  method's own body in both. Evidence quoted above.
- **Module lists:** derived from each page's own source
  (`.source/templates/{services,about}.html`), not copied from the brief;
  both happen to match the brief once `fanPointer` is correctly dropped.
  About's `trail` omission is confirmed on stronger grounds than the brief
  states (the method and its markup are entirely absent, not merely
  uncalled).
- **Client boundary:** both `page.tsx` files have no `'use client'`
  directive; both module-list files export module-level `const` arrays
  (not recomputed per render); both runtime wrappers are minimal six-line
  `'use client'` components mirroring `home-runtime.tsx`.
- **Discipline:** no shell components created; no hand-tuned markup;
  nothing outside the six listed files was shipped. The one file I touched
  outside that list (`next.config.ts`, for diagnosis) was fully reverted
  before finishing, verified via `git diff`.

## Concerns

1. **`npm run build` fails** on all three required gates being "all
   clean" — this is the reason for DONE_WITH_CONCERNS rather than DONE.
   Root cause is external (a confirmed upstream `@next/eslint-plugin-next`
   bug), not a defect in this task's files, but it is real and it does
   block a clean build today. It will recur identically on every future
   page task (12, 13) the moment that page's own "Home" link exists,
   unless ruled on before then.
2. I have not chosen a remediation (see the three options above) — that is
   an architectural decision (whether to introduce `next/link` project-wide,
   or to reconfigure/suppress a confirmably-buggy lint rule) that affects
   already-shipped, already-reviewed pages, so I left it to you rather than
   guessing.
3. Everything else — conversion, assembly, fidelity, `fanPointer`, module
   lists, `next/image` swaps, `node --test`, `tsc` — is verified clean and
   I have no doubts about it.

I committed the six new files as-is (matching Task 7's own precedent of
committing correct, disclosed-incomplete work rather than withholding it),
since none of them are the cause of the build failure and withholding them
would not make the underlying tooling issue any less real for Tasks 12/13.

---

# Fix Round 1

## Status: DONE

Ruling: convert internal navigation to `next/link` in the converter, do not
suppress the lint rule. Authorised to modify `tools/convert.mjs`,
`tools/convert.test.mjs`, `app/page.tsx` (Home's menu links to all six other
routes, so it needed regenerating too), leaving `app/home-runtime.tsx`
untouched. All three gates are now clean, including `npm run build` with
**no** `ignoreDuringBuilds` and no rule suppression anywhere.

---

## The converter change

### Gate: on `toRoute()`'s own resolution, not on output shape

In `tools/convert.mjs`'s attribute loop, the branch that already rewrites an
`Arohance*.html` href to its route (`toRoute(v)`) now also promotes that
same `<a>` element to `<Link>`, but only inside the `route !== null` branch
— i.e. only for a link the converter itself resolved. A same-page
`#fragment` anchor (`#top`, `#work`, `#contact`) and an external href
(`mailto:...`) never start with `Arohance`, so they never reach this branch
at all and stay plain `<a>`. I checked all seven real templates for any
already-literal `/`-prefixed href that might slip past this gate uncounted:
**zero** — every slash-rooted href anywhere in the seven templates' JSX
output comes from this exact resolution, so gating on it, rather than on
whatever the output string happens to look like, does not miss anything
real in this codebase today. `/#work` (home's own "Work" menu item, a
route-plus-fragment) is still `toRoute()`-resolved, so it correctly becomes
a `<Link>` too, per the ruling's explicit callout.

**Correction to my own first-draft comment:** my initial version of this
comment cited "the footer's social 'links', which point at /contact without
ever having been an Arohance-prefixed source href" as an example of a
same-shaped-but-different-provenance href. I checked this against the raw
source before shipping it and it was **wrong** — `grep` on
`.source/templates/home.html` shows the Instagram/LinkedIn footer links are
literally `href="Arohance%20Contact.dc.html"` in the source, i.e. they
*are* real `toRoute()`-resolved links (to `/contact`), same as any other.
There is no case in the real data of an already-literal internal-looking
href that bypasses `toRoute()` — I rewrote the comment to say so accurately
instead of citing a hypothetical that isn't real, rather than ship a
misleading rationale.

### A real bug this surfaced: `rawTagName = 'Link'` collides with the HTML5 `<link>` void element

My first attempt set `el.rawTagName = 'Link'` directly. Verified by direct,
isolated testing against `node-html-parser` (not assumed): its serializer
decides whether a tag is void by **lower-casing it first**
(`isVoidElement(tag.toLowerCase())`), so `'Link'` collides with the real
HTML5 void element `<link>`. The effect is silent and severe — every child
of the anchor (its text, any nested `<span>`) is dropped, and no closing
tag is ever emitted:

```js
const root = parse('<a href="/about">About</a>', ...);
root.querySelector('a').rawTagName = 'Link';
root.toString() // -> '<Link href="/about">'   -- "About" is gone
```

Fix: rename to a placeholder tag name that shares no name with any real
HTML element — `agnextlink` — which serializes as an ordinary paired
element with its children intact, then swap `<agnextlink>`/`</agnextlink>`
for `<Link>`/`</Link>` by exact string replace on the final output.

This placeholder swap has to run **after** step 4 (the void-element
self-closing pass), not before: step 4's regexes match void tag names
case-insensitively too, so renaming to `Link` any earlier would let that
same step re-collapse it right back into a self-closed, childless `<link
... />` on its very next pass. I found this the hard way (first attempt put
the swap before step 4; the two internal-link tests failed with exactly
that `<link href="/about" />` shape) before moving it after step 4, at
which point all tests passed.

---

## Mutation proofs (both directions)

**Mutation A — disable the rename, confirm the "becomes a Link" tests fail:**
commented out the `el.rawTagName = 'agnextlink'` assignment (leaving `v =
route` in place, i.e. exactly the pre-fix behaviour) and re-ran the suite:

```
not ok 7  - internal artifact links become routes
not ok 8  - internal links convert from both suffix spellings, preserving fragments
not ok 9  - an internal artifact link becomes a Link, with every other attribute preserved
not ok 10 - a route-plus-fragment link also becomes a Link
ok 11 - a bare same-page fragment link stays an <a>, not a Link
```

All four "becomes a Link" tests fail; the "stays `<a>`" test is unaffected
(it never depended on the rename firing). Confirms 7–10 discriminate on the
fix's presence.

**Mutation B — an over-broad, shape-based gate, confirm the "stays `<a>`"
test fails:** added a second, deliberately-wrong branch that promotes any
`<a href>` starting with `#` or `/` to `Link`, regardless of whether
`toRoute()` resolved it — i.e. exactly the anti-pattern the ruling warned
against ("gate on the shape of the output string"). Re-ran the suite:

```
ok 7  - internal artifact links become routes
ok 8  - internal links convert from both suffix spellings, preserving fragments
ok 9  - an internal artifact link becomes a Link, with every other attribute preserved
ok 10 - a route-plus-fragment link also becomes a Link
not ok 11 - a bare same-page fragment link stays an <a>, not a Link
```

Tests 7–10 are unaffected (those links are genuinely resolved either way);
test 11 fails, because the mutation now also promotes `href="#work"`.
Confirms test 11 is not vacuous — it actually catches the over-broad
implementation the ruling specifically called out.

Both mutations reverted; restored file confirmed **byte-identical** to the
pre-mutation version (`diff` empty) before moving on. Full suite re-ran
clean (27/27 in `convert.test.mjs` alone) after each restoration.

---

## New/changed tests (`tools/convert.test.mjs`)

- **Updated** the two existing happy-path internal-link tests (`internal
  artifact links become routes`; `internal links convert from both suffix
  spellings, preserving fragments`) — their expected output was `<a
  href="/about">...</a>`, which is now correctly `<Link href="/about">
  ...</Link>` for every one of their cases (all are `toRoute()`-resolved).
- **New:** `an internal artifact link becomes a Link, with every other
  attribute preserved` — pins that `data-ag-mlink` and a `style`-derived
  `className` both survive the tag-name change untouched.
- **New:** `a route-plus-fragment link also becomes a Link` — the specific
  edge case the ruling flagged (`/#work`).
- **New:** `a bare same-page fragment link stays an <a>, not a Link` — the
  converse direction, proven non-vacuous by Mutation B above.

---

## Regenerated all seven templates

```
home       -> wrote .source/jsx/home.jsx        exit=0
about      -> wrote .source/jsx/about.jsx       exit=0
services   -> wrote .source/jsx/services.jsx    exit=0
studio     -> wrote .source/jsx/studio.jsx      exit=0
careers    -> wrote .source/jsx/careers.jsx     exit=0
contact    -> wrote .source/jsx/contact.jsx     exit=0
case-study -> wrote .source/jsx/case-study.jsx  exit=0
```

Completeness guard silent on all seven — confirms the fix generalises
across every real template's link shapes, not just the three pages this
task owns.

Spot-checked what actually changed to `<Link>` in home/about/services via
`grep`: every menu-panel cross-page link (`/about`, `/services`, `/studio`,
`/careers`, `/contact`, home's own `/`), the footer social links (all
genuinely `Arohance Contact.html`-sourced, see the correction above), the
"See all work"/"More news" CTAs, and all four `#work`-section work-card
wrappers on home. Everything that stayed `<a>` is a same-page fragment
(`#top`, `#work`, `#services`, `#contact`) or `mailto:`.

---

## Re-assembled `app/page.tsx`, `app/services/page.tsx`, `app/about/page.tsx`

Same procedure as before (read the regenerated `.source/jsx/<slug>.jsx`
verbatim, assert each target substring occurs exactly once, replace,
wrap), with one addition to every wrapper: `import Link from 'next/link';`
alongside the existing `import Image from 'next/image';`. All three pages
use `<Link>` in their own markup (confirmed above), so all three genuinely
need the import — not adding it blindly to pages that don't use it.

## Regenerated fidelity diffs

`diff -u .source/jsx/<slug>.jsx app/<path>/page.tsx`, precisely counted
(`grep -c '^[+-]'` minus the `---`/`+++` header lines each):

| Page | Removed | Added | Changed | Δ vs previous round |
|---|---|---|---|---|
| Home (`app/page.tsx`) | 8 | 15 | 23 | +1 added (the new `Link` import) |
| Services | 4 | 11 | 15 | +1 added |
| About | 9 | 16 | 25 | +1 added |

Exactly the shift the ruling predicted ("shift the fidelity diffs by one
line per page — expected"), and nothing else: I re-ran the full diffs (not
just the counts) for all three files and confirmed every changed line is
still one of the three permitted buckets (wrapper/imports, a `next/image`
swap, or the two component mounts). The `<Link>` tag changes themselves
are **invisible** to these diffs, by design: they're already identical on
both sides, since the converter (not my assembly step) produced them —
confirmed by inspecting the full home diff, where every `<Link
href="/case-study" data-hover-group="" ...>` wrapper line appears as
unchanged context, not a +/- line.

Services' and About's bucket breakdown from the original report is
otherwise unchanged (wrapper 3 removed / now 10 added; image swaps as
before) — only the import-line count moved.

---

## Gate output (final, this round)

**`node --test tools/*.test.mjs lib/*.test.mjs lib/behaviors/*.test.mjs`**
```
# tests 50
# pass 50
# fail 0
```
(47 previous + 3 new convert.test.mjs tests.)

**`npx tsc --noEmit`**: exit 0, zero output.

**`npm run build`** (real, unmodified, no `ignoreDuringBuilds`, no rule
suppression): **exit 0.**
```
✓ Compiled successfully in 6.0s
Linting and checking validity of types ...
```
Only the same pre-existing warnings as before this whole task started —
`no-img-element` on the images intentionally left as `<img>`, and the
pre-existing `no-unused-vars`/`no-unused-expressions` warnings in
`lib/behaviors/reel.ts`, `lib/liquid-ether.ts`, `lib/stroke-text.ts` (files
this task has never touched). **Zero errors, and specifically zero
`no-html-link-for-pages` errors** — the three that blocked the previous
round are gone.

### Route-size table (real build, not a diagnostic)

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      331 B         117 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 328 B         117 kB
└ ○ /services                              332 B         117 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-2dbbf79f36f0dfa2.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          2.08 kB
```

`/`, `/about`, `/services` are all ~117 kB First Load JS — same ballpark as
before (was ~115 kB pre-`Link`; the small, expected increase is
`next/link`'s own client-side routing/prefetch runtime, now exercised for
the first time in this codebase). Satisfies Fact #1.

### Chunk check — three.js/GSAP still shared and lazy, not duplicated per route

`.next/static/chunks/`, largest files:
```
481032 bytes  b536a0f1.966c25e1a7e1b971.js   (liquid-ether / three.js)
182716 bytes  framework-acd67e14855de5a2.js
173687 bytes  255-2dbbf79f36f0dfa2.js
173019 bytes  4bd1b696-c023c6e3521b1417.js
122045 bytes  main-a1ff5f1d941a9f29.js
112594 bytes  polyfills-42372ed130431b0a.js
 51154 bytes  c15bf2b0.59a74778c8940b18.js   (gsap / stroke-text)
 22075 bytes  850-e2f4b8acb00a5fe7.js        (new -- next/link's own runtime)
 19625 bytes  170-4a7dca349033a2ea.js
 18620 bytes  605.41f9f6b0165a8de6.js        (gsap / stroke-text)
```
Same three chunk hashes and sizes as every prior check in this project
(Task 8's original 472 KB/52 KB/20 KB, confirmed again in this task's first
round) — one instance of each, unchanged by this fix. The one genuinely new
chunk (`850-e2f4b8acb00a5fe7.js`, ~22 KB) is `next/link`'s own
client-navigation code, appearing for the first time because this is the
first code in the whole project to use it — not a duplication of anything
vendored.

---

## Files changed this round

- `tools/convert.mjs` — the `Link`-promotion logic (attribute loop) and the
  placeholder-swap step (post-`root.toString()`), both described above.
- `tools/convert.test.mjs` — 2 existing tests updated, 3 new tests added,
  all mutation-proven.
- `app/page.tsx` — regenerated from the reconverted `.source/jsx/home.jsx`
  (Home's own menu links to all six other routes, so it changes too, as
  the ruling anticipated). `app/home-runtime.tsx` and `app/modules.ts`
  untouched — confirmed via `git diff --stat`, empty for both.
- `app/services/page.tsx`, `app/about/page.tsx` — regenerated the same way.

Not touched: `lib/`, `components/`, `eslint.config.mjs`, `next.config.ts`
(confirmed clean — the diagnostic bypass from the previous round was
already fully reverted and stayed that way), `app/services/modules.ts`,
`app/services/services-runtime.tsx`, `app/about/modules.ts`,
`app/about/about-runtime.tsx` (none of these reference `Link` directly, so
none needed a change).

## Self-review

- **The ruling's four numbered requirements**, checked one by one:
  1. Gated on `toRoute()`'s actual resolution, not output shape — confirmed
     by Mutation B specifically targeting the anti-pattern.
  2. Every other attribute preserved — confirmed by the dedicated
     `data-ag-mlink`/`className` test, and by the fact that the fix only
     ever touches `el.rawTagName`, never the attribute-handling code path.
  3. Discriminating tests for both directions, each mutation-proven — done,
     shown above.
  4. `import Link from 'next/link'` added to each page's wrapper lines —
     done for all three (home, services, about), all three genuinely use it.
- **Gates:** `node --test` 50/50, `tsc --noEmit` exit 0, `npm run build`
  exit 0 with no suppression anywhere. This is the first clean `npm run
  build` this task has produced.
- **Regenerated all seven templates**, not just the three this task owns —
  completeness guard silent on all seven, so the fix is confirmed general.
- **Corrected my own inaccurate comment** before shipping it, once I
  checked it against the real source and found the specific example I'd
  reached for didn't hold up — replaced with what I actually verified
  (zero literal `/`-prefixed hrefs anywhere in the seven templates).

## Concerns

None outstanding. All three gates are clean without any suppression, the
fix is proven in both directions by mutation, and it's been confirmed
general across all seven templates rather than special-cased to the three
pages this task touches.
