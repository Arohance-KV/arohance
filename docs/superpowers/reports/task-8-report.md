# Task 8 Report: Port the homepage's page-specific behaviours

## Status: DONE_WITH_CONCERNS

All eleven behaviours are ported and wired; all three gates are clean
(`ssr.test.mjs` 3/3, `tsc --noEmit` zero errors, `npm run build` exit 0).
The concerns are not gate failures — they are two findings the task's own
"stop and tell me" clause asks me to surface rather than resolve on my own
judgement: `initFanPointer` is dead code in the source (never called, and
its target markup doesn't exist either), and `initVideo`'s lightbox poster
image depends on a bundler resource table that has no equivalent in this
app, so it will render a broken image path as ported. Both are ported
verbatim and flagged; details below.

---

## What I implemented

1. Ported the nine DOM-only methods from `.source/templates/home.html`'s
   `<script type="text/x-dc">` block (lines 943–1466) into
   `lib/behaviors/{services,hovers,cursor,flags,video,magnet,trail,reel,fanPointer}.ts`,
   applying the Task 5 porting-rules table and nothing else.
2. Added `lib/behaviors/ether.ts` and `lib/behaviors/stroke.ts` verbatim from
   the brief (dynamic `import()` wrappers around the vendored effects).
3. Re-exported all eleven from `lib/behaviors/index.ts`.
4. Rewrote `app/modules.ts`: `HOME_MODULES = [...SHARED, services, hovers,
   cursor, flags, video, ether, magnet, stroke, reel, trail, fanPointer]`,
   verified against `componentDidMount` (see below).
5. Ran all three gates. All clean.

---

## Per-module fidelity table

Methodology: for each module I list the source range, the ported line
count, and a changed-line count split into **(a)** mechanical/table-driven
(root deletion, `cleanups` array wiring, disposer wrapper, prop
substitution — required by the porting table for every module) **(b)**
TypeScript-typing-only (generics on `querySelector`, parameter/variable
type annotations — required because the source is untyped JS landing in a
strict `.ts` file, zero behaviour change) and **(c)** other — anything not
explained by (a) or (b), itemized individually. (c) is what would indicate
a rewrite; it is small and fully accounted for in every module.

| Module | Source range | Source lines | Ported lines | (a)+(b) | (c) other, itemized |
|---|---|---|---|---|---|
| `services.ts` | 1334–1359 | 26 | 30 | ~9 | 0 |
| `hovers.ts` | 1361–1379 | 19 | 25 | ~7 | 0 |
| `cursor.ts` | 1381–1406 | 26 | 36 | ~11 | 1: `(true as boolean) === false` for the frozen `customCursor` guard |
| `flags.ts` | 1437 | 1 | 6 | ~4 (wrapper only) | 0 (empty body ported as-is) |
| `video.ts` | 1439–1463 | 25 | 40 | ~12 | 1: `window as Window & { __resources?: ... }` cast (see Concern 2) |
| `magnet.ts` | 1035–1051 | 17 | 25 | ~9 | 1: `cancelAnimationFrame(raf!)` non-null assertion |
| `trail.ts` | 1108–1166 | 59 | 76 | ~13 | 4: `(true as boolean) === false` cast; `String(len)` ×2 (CSSOM props are string-typed); added `if (!line‖!ghost‖!dot‖!halo) return () => {}` guard (source has none — see note); `if (rt) clearTimeout(rt)` guard; `cancelAnimationFrame(raf!)` |
| `reel.ts` | 1053–1106 | 54 | 64 | ~11 | 2: `tmp.textContent \|\| ''` fallback; `cancelAnimationFrame(raf!)` |
| `fanPointer.ts` | 1168–1241 | 74 | 90 | ~16 (incl. doc comment) | 0 code-logic deviations (cleanup's `if (raf) cancelAnimationFrame(raf)` was already guarded in source) |

Every module was also individually re-read side-by-side against the source
text captured during investigation (not just written once and trusted) —
selectors, magic numbers, easing strings, and thresholds were checked
character-for-character (e.g. `trail.ts`'s Bezier control-point arithmetic,
`fanPointer.ts`'s `-26`/`-16`/`5.5`/`-4`/`1.035` transform coefficients,
`reel.ts`'s `8000`/`0.62`/`380` timing constants). No selector, threshold,
easing curve, duration, magnitude, or string format was changed anywhere.

**On the four "(c) other" TypeScript accommodations** (the `true as
boolean` cast, `String(len)`, and the non-null assertions): these exist
because the porting table's own prescribed substitutions, applied
literally to strict TypeScript, don't compile as bare text substitutions.
Concretely: `this.props.customCursor === false` → `true === false` is
rejected by `tsc` as `TS2367` ("this comparison appears to be
unintentional because the types 'true' and 'false' have no overlap") —
verified by isolated compilation before writing any file. `line.style.
strokeDasharray = len` (a `number`) doesn't satisfy `CSSStyleDeclaration`'s
`string`-typed properties. `cancelAnimationFrame(raf)` where `raf: number |
null` doesn't satisfy a `number`-only parameter. Each fix is a type-level
annotation with **zero runtime effect** — I verified each in isolation
against the project's real tsconfig before use, not guessed.

**The `trail.ts` added null-guard is the one deviation that adds a line of
actual control flow not in the source**, so it gets its own paragraph: the
original queries `line`/`ghost`/`dot`/`halo` via `svg.querySelector(...)`
with **no null check at all**, and then uses all four unconditionally —
unlike every other queried element in this same script, which either has
an explicit guard or is defensively checked at each use site. TypeScript's
strict null checks don't allow this. Rather than inventing a new pattern,
I mirrored `initShell`'s own established idiom elsewhere in the *same*
source file for the *same* situation (`if (!ov || !news || !menu)
return;`) and combined the four into one guard. This is a structural
necessity, not a judgement call about original intent — the four elements
are hard-coded into the markup (`app/page.tsx`'s trail SVG), so the guard
is unreachable in practice, exactly like the equivalent guards elsewhere.

---

## Verified `componentDidMount` order

Read directly from `.source/templates/home.html` lines 944–963:

```
applyTheme, initReveal, initParallax, initNav, initServices, initHovers,
initCursor, initClock, initForm, initFlags, initVideo, initShell,
initEther, initMagnet, initStroke, initReel, initTrail
```

Filtering to only the page-specific (non-`SHARED`) calls, in the order
they appear, gives exactly:

```
services, hovers, cursor, flags, video, ether, magnet, stroke, reel, trail
```

**This matches the brief's proposed order exactly** for all ten items that
actually have a call site.

**Finding: `initFanPointer` is never called anywhere.** I grepped the
entire `<script type="text/x-dc">` block (and the whole file, case
insensitive) for `FanPointer` — the only hit is the method definition
itself at line 1168. It does not appear in `componentDidMount`, and no
other method calls it either. I also checked whether its target markup
exists: `[data-ag-fan]` appears **nowhere** in `.source/templates/home.html`
and **nowhere** in `app/page.tsx`. So `initFanPointer` is dead in two
independent ways in the original artifact — never invoked, and its target
element was never built. Wiring it into `HOME_MODULES` (as both the brief
and this task's own "Wiring" section explicitly instruct, twice) is
therefore **provably inert**: the behaviour's own first guard
(`if (!fan) return`) fires immediately, every time, in both the original
site and this port, so this does not add any new visible or functional
behaviour to the shipped page. I ported and wired it in per the explicit
instruction rather than dropping it on my own judgement (the task's policy
for a "provably-dead computation" is "report it — do not remove it on your
own judgement," and I read that policy as covering this case too, one
level up: a provably-dead *method*, not just a provably-dead
*computation*). Flagging prominently per the task's own escalation clause
("if any of the nine methods ... stop and tell me what you found"),
documented inline in `fanPointer.ts` and in `app/modules.ts`.

---

## Other things that surprised me

1. **Two intra-method dead computations**, same category as the
   already-approved `nav.ts` `darks`/`onDark` removal, but I did **not**
   remove these — I ported them verbatim and am reporting them, per the
   explicit instruction that governs *new* findings of this kind:
   - `reel.ts`: `const q = (L.getAttribute('data-vt-quote') || '').replace(...)` is
     computed inside `show()` and never read again — the code actually
     uses a separately-computed `txt` (via a scratch `<div>` + `.textContent`)
     for everything downstream. Bonus detail: `q`'s regex
     (`/&#8220;|&#8221;/g`) can never match anyway, because
     `getAttribute()` already returns entity-decoded text, so the literal
     `&#8220;`/`&#8221;` character sequences it searches for can't occur in
     the string being searched — doubly dead.
   - `fanPointer.ts`: `dur` is assigned inside the `loadedmetadata` handler
     (`dur = vid.duration || 0`) and never read anywhere else in the method.
   - Both are confirmed dead by ESLint itself in the `npm run build` output
     (`'dur' is assigned a value but never used`, `'q' is assigned a value
     but never used`) — a warning, not an error, so it doesn't fail the
     build.
2. **`initVideo`'s lightbox poster resolution depends on `window.__resources`**,
   the same artifact-bundler resource table `initEther`/`initStroke` used
   (via the sibling `loadMod` helper) before this task replaced those two
   with real dynamic imports. Unlike ether/stroke, there is **no prescribed
   replacement** for this one in the brief, and I found no equivalent
   mapping anywhere in the repo (`.source/assets.json` is keyed by GUIDs
   from the artifact's script-resource table, not by the human-readable
   slugs like `work-agasti-s` that `data-vt-poster="assets/work-agasti-s.jpg"`
   uses — I checked, no match). This is a genuine "helper outside its own
   body" per the escalation clause, so I ported it exactly as written (the
   cast is TypeScript-only) rather than improvising a resource map myself.
   See Concern 2 below — this is the one that most needs a decision.
3. **`initCursor` appends its dot to `document.body`, not `root`** — the one
   "touches DOM outside `[data-ag-root]`" case among the nine. This is
   necessary, not accidental: `root` (`[data-ag-root]`) carries
   `overflow-clip` in `app/page.tsx`, and has parallax-transformed
   descendants — either would break a `position:fixed` cursor overlay by
   changing its containing block. Ported as written; flagged per the
   escalation clause; see Concern 3.
4. **`initFanPointer`'s `live()` re-queries `[data-ag-flaghint]` into a new
   local `h`** instead of reusing the outer `hint` it already queried at the
   top of the method — a redundant DOM query, not a bug (both would resolve
   to the same element). Ported as written, per "if something looks
   inefficient, port it as written and say so."
5. Several `cancelAnimationFrame(raf)`/`clearTimeout(rt)` calls in the
   source are **inconsistently guarded across sibling methods** — e.g.
   `magnet`/`trail`/`reel` call `cancelAnimationFrame(raf)` bare, while
   `cursor`/`fanPointer` guard it with `if (raf)`. This looks like the
   original author's own inconsistency, not a pattern I should normalize.
   I preserved each method's own shape exactly (bare calls got a `!`
   non-null assertion for TypeScript, not an added `if`; already-guarded
   calls kept their guard) rather than making them uniform.

---

## Disposal audit

General note: three modules (`video.ts`, `trail.ts`, `reel.ts`) schedule a
one-off `setTimeout` **inside a running callback** (a debounce, a lightbox
fade-out, a per-word colour reset) whose timer ID is never captured or
cleared by the module's own disposer. This is a pre-existing characteristic
of the original — identical in the source — not something introduced by
porting. Listed per-module below.

| Module | Setup creates | Disposer releases | Gap? |
|---|---|---|---|
| `services.ts` | Per-item `click` listener (items with a head) | Same, 1:1 | None |
| `hovers.ts` | Per-group `mouseenter`/`mouseleave` | Same, 1:1 | None |
| `cursor.ts` | `document.body`-appended dot element; global `mousemove`; RAF loop; per-`[data-cursor]` `mouseenter`/`mouseleave` | Listener removed, RAF cancelled (guarded), dot removed, per-element listeners removed | None |
| `flags.ts` | Nothing | No-op | None (trivially) |
| `video.ts` | Per-card `click`; lightbox `click`; global `keydown` | All three removed | `close()`'s internal `setTimeout(..., 400)` (hides the lightbox) is never cleared on unmount — pre-existing in source, identical here |
| `magnet.ts` | Global `mousemove`; RAF loop | Listener removed; RAF cancelled | None |
| `trail.ts` | Global `scroll`; RAF loop; `ResizeObserver` on root (which itself debounces via `setTimeout`) | Scroll listener removed; observer disconnected; RAF cancelled | The `ResizeObserver` callback's own debounce timer (`rt`) is never cleared by the disposer (only by the *next* resize firing) — pre-existing in source, identical here |
| `reel.ts` | Per-item `click`; stage `mouseenter`/`mouseleave`; RAF loop; a Web Animation (`kb`, replaced on every `show()`) | Per-item listeners removed; stage listeners removed; RAF cancelled; latest `kb.cancel()` (correct via closure) | `tick()`'s per-word `setTimeout(..., 380)` (resets a word's colour) is never cleared — pre-existing in source, identical here |
| `fanPointer.ts` | `vid` metadata/loadeddata/playing listeners; global `mousemove`/`blur`; `fan` `mouseenter`/`mouseleave`; RAF loop | All of the above, across the method's own two `cleanups.push` calls (both always run on unmount) | None |
| `ether.ts` / `stroke.ts` | See teardown trace below | — | — |

All timer-related gaps above are cosmetic (a value gets written once, ~0.3–0.4s late, to a possibly-detached element — no error is thrown, since the DOM nodes remain valid JS objects even once removed from the document) and are byte-identical to the original's own behaviour. I did not "fix" them, per the porting mandate.

---

## Ether teardown trace (Fact 1 — the WebGL context leak)

Traced the unmount-before-import-resolves race explicitly:

1. `ether(root)` runs synchronously: finds `[data-ag-ether]`, starts
   `import('@/lib/liquid-ether')` (a pending promise), sets `dead = false`,
   `dispose = null`, and returns `() => { dead = true; dispose?.(); }` to
   `AgRuntime` immediately.
2. **Unmount before the import resolves:** `AgRuntime` calls the returned
   disposer — `dead = true`; `dispose` is still `null`, so `dispose?.()` is
   a no-op. When the import *later* resolves, `.then((m) => { if (dead)
   return; ... })` sees `dead === true` and returns **before** calling
   `m.mount(...)`. The WebGL context is therefore **never created** in this
   ordering — there is nothing to leak because there is nothing to release.
3. **Unmount after `mount()` already ran:** `dispose` holds the real
   disposer from `lib/liquid-ether.ts`. The returned closure runs `dead =
   true; dispose?.()`, invoking it. `lib/liquid-ether.ts`'s own disposer
   (unmodified, per instructions) guards `if (disposed) return;` before
   `.dispose()` + `forceContextLoss()` — confirmed by `lib/effects.test.mjs`,
   which I ran as part of understanding this (not part of my required
   gates, and I did not modify that file).
4. Double-invocation (defensive case): even if `AgRuntime` somehow called
   the returned disposer twice, the real disposer's own `if (disposed)
   return;` guard makes a second call a no-op.

Both orderings are leak-free. `stroke.ts` uses the identical `dead`-flag
shape against `lib/stroke-text.ts`'s own idempotent disposer (`if
(disposed) return;` before `tl.kill()`/`io.disconnect()`), so the same
trace applies there.

---

## `npm run build` route-size output

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    12.2 kB         115 kB
└ ○ /_not-found                            990 B         104 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-2dbbf79f36f0dfa2.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          2.08 kB

○  (Static)  prerendered as static content
```

**Only `/` and `/_not-found` currently exist as routes** — `find app -type
f` shows no `studio`/`contact`/`case-study` pages yet in this branch (those
are presumably later tasks), so I cannot literally compare home's size
against a scaffolded sibling route yet. As the best available verification
that three.js/GSAP stay out of the initial bundle, I inspected the actual
built chunks: the three.js/liquid-ether payload lands in its own
lazily-loaded chunk, `.next/static/chunks/b536a0f1.*.js` (472 KB — by far
the largest chunk in the build), and gsap/stroke-text in two more separate
chunks (`605.*.js` 20 KB, `c15bf2b0.*.js` 52 KB) — **none of the 472+72 KB
of vendored-effect code is counted in the 115 kB "First Load JS" for `/`**,
confirming the dynamic-`import()` split in `ether.ts`/`stroke.ts` is doing
its job. `lib/behaviors/index.ts` re-exports `ether`/`stroke` from its
barrel, but only `app/modules.ts` (home-specific) actually references them
as values, so tree-shaking keeps them out of any future page that imports
other names from the same barrel without touching `ether`/`stroke`.

---

## Gate output

**`node --test lib/behaviors/ssr.test.mjs`**
```
# tests 3
# pass 3
# fail 0
```

**`npx tsc --noEmit`** — exit 0, zero output.

**`npm run build`** — exit 0. Only pre-existing warnings (all in files I
did not touch, or on the two lines I ported verbatim and am reporting as
dead code):
```
./app/page.tsx — pre-existing no-img-element warnings (unrelated to this task)
./lib/behaviors/fanPointer.ts
21:109  Warning: 'dur' is assigned a value but never used.
./lib/behaviors/reel.ts
36:11  Warning: 'q' is assigned a value but never used.
./lib/liquid-ether.ts, ./lib/stroke-text.ts — pre-existing warnings, files I did not touch
✓ Generating static pages (4/4)
```
All three ran together in one chain (`node --test ... && npx tsc --noEmit
&& npm run build`) with a combined exit code of 0.

---

## Files changed

New:
- `lib/behaviors/services.ts`, `hovers.ts`, `cursor.ts`, `flags.ts`,
  `video.ts`, `magnet.ts`, `trail.ts`, `reel.ts`, `fanPointer.ts`,
  `ether.ts`, `stroke.ts`

Modified:
- `lib/behaviors/index.ts` — imports + re-exports the eleven new modules
- `app/modules.ts` — `HOME_MODULES` rewritten with the full, verified order

Nothing under `tools/`, `app/page.tsx`, `components/`, or the two vendored
effect files (`lib/liquid-ether.ts`, `lib/stroke-text.ts`) was touched —
confirmed via `git status --short`.

---

## Self-review findings

- **Fidelity:** see table above — every module's non-table/non-typing
  deviation count is 0–4, each one individually justified and traceable to
  a specific, verified TypeScript compile error I reproduced in isolation
  before writing the accommodation, or (for `trail.ts`'s guard) to an
  existing same-file precedent (`initShell`). No selector, threshold,
  duration, magnitude, or string format was changed.
- **Disposal:** see audit table above. Three pre-existing, source-identical
  timer gaps (video/trail/reel); everything else is complete.
- **Ether teardown:** traced explicitly above; leak-free in both orderings.
- **Discipline:** no new dependencies; only the 13 files listed above
  changed; no selectors/constants changed; no computations removed on my
  own judgement (both new dead-code findings were kept and reported, matching
  the task's explicit policy for this situation).

## Concerns for you to decide on

1. **`initFanPointer` wiring is provably inert right now** (dead call site
   in source *and* dead target markup), but is wired into `HOME_MODULES`
   per explicit instruction. If `[data-ag-fan]` markup is ever added in a
   future task, this behaviour will activate for the first time — worth
   knowing it exists and is currently a no-op by construction, not by luck.
2. **`initVideo`'s lightbox poster image will not resolve.** As ported
   (matching source), clicking a testimonial reel card sets the poster
   `<img>`'s `src` to the literal string `"assets/work-agasti-s.jpg"` (etc.)
   because `window.__resources` doesn't exist in this app and no equivalent
   mapping exists in the repo for these specific asset keys. This is the
   one finding I'd most want a ruling on: either a real image needs to be
   added to `public/images/` + a small resolution table, or this is
   accepted as a known gap for a later task. I did not invent a mapping
   myself, per the "don't improvise an equivalent" instruction.
3. **`initCursor` intentionally appends to `document.body`, not `root`** —
   flagged per the "touches DOM outside root" escalation clause, but I
   believe this is correct and necessary (see "Other things that surprised
   me" #3) rather than something to change.
4. None of the above are gate failures — all three required gates are
   clean. I'm marking DONE_WITH_CONCERNS rather than DONE because #2 is a
   real, user-visible gap that this task is the first to actually surface
   in code, and I want it seen and ruled on rather than quietly shipped.

---

# Fix Round 1

## Status: DONE

All three concerns were ruled on by the coordinator; two required action
(Concern 1: delete; Concern 2: root-cause and fix upstream), one needed
none (Concern 3: confirmed faithful). Both fixes are in, both new tests are
mutation-proven, all seven templates reconvert cleanly, `app/page.tsx` is
refreshed from the regenerated source, and all three gates plus the full
project test suite are green.

## Ruling 1 — `initFanPointer`: deleted

Verified independently before deleting: grepped the entire `<script
type="text/x-dc">` block in `.source/templates/home.html` for `FanPointer`
(case-insensitive) — the only hit is the method definition at line 1168,
confirming no call site anywhere, in `componentDidMount` or otherwise.

Removed:
- `lib/behaviors/fanPointer.ts` (deleted)
- Its import/export in `lib/behaviors/index.ts`
- `fanPointer` from `HOME_MODULES` in `app/modules.ts`, with a comment
  explaining why it's absent (same category as `nav.ts`'s dropped
  `darks`/`onDark` computation)

Grepped the repo afterward for stray `fanPointer` references: none remain
outside `docs/` (planning documents, out of scope, not touched).

**`about.html`/`services.html` re Task 11:** independently re-counted
`grep -c 'data-ag-fan'` across all seven templates: `home`, `about`, and
`services` each show **2** (this is `[data-ag-fan]` plus `[data-ag-fanfallback]`
matching as a substring — not two independent uses); `studio`, `careers`,
`contact`, `case-study` show **0**. This matches the signature the
coordinator described for `home.html` exactly, which is consistent with
`about.html`/`services.html` carrying the same dead method. I have **not**
verified the two deeper claims for those pages (no call site in their own
`componentDidMount`; no `[data-ag-fan]` in their markup) — neither page has
a `page.tsx` yet, so that verification isn't possible from here. Task 11
should re-run both checks itself rather than assume this holds.

## Ruling 2 — lightbox posters: root cause fixed upstream

### `tools/unbundle.mjs`

Added a second extraction pass alongside the existing per-bundle `manifest`
loop: for each bundle, reads the `__bundler/ext_resources` block (same
`blockAfter(lines, kind)` helper already used for `manifest`/`template`),
resolves each `{id, uuid}` entry's `uuid` through the `assetMap` that pass
just populated for that same bundle, and accumulates into `extResources`
(`id -> public path`). An id whose uuid resolves to `null` (a font, or
page-logic JS the manifest loop already discards) is skipped, never written
as `null`. A same-id conflict across bundles (should not occur — same
mechanism, same intent as the existing `byHash` content-dedup) is handled
the same way the file already handles vendor-file variants: keep the
first, warn once via `console.warn`. Writes `.source/ext-resources.json`.

### `tools/convert.mjs`

`convert(html, assets, extResources = {})` — new third parameter. Inside
the existing per-attribute loop, right after the bare-uuid `assets[v]`
check: a value matching `/^assets\/(.+)\.\w+$/` has its captured id looked
up in `extResources`; found → the value is replaced with the mapped path;
not found → `problems.add('unmapped asset reference: ' + v)`, folded into
the exact same diagnostics `Set` the unmapped-internal-link check already
throws through (one error path for both categories, per the file's
existing design). The CLI block now loads `.source/ext-resources.json`
alongside `.source/assets.json` and passes it through.

### `lib/behaviors/video.ts`: left untouched, as instructed

No change. Once the attribute holds a real `/images/<hash>.jpg` path, the
ported regex `^assets\/(.+)\.jpg$` (verbatim from source) simply doesn't
match, `.replace()` returns the string unchanged, and `img.setAttribute('src',
...)` receives the correct path. The `window.__resources` lookup — and the
TypeScript cast around it — becomes dead code that can never execute, not
a live bug. This is the same category as `q` in `reel.ts` and the (now
deleted) `dur` in `fanPointer.ts`: a provably-dead-after-the-fact branch,
noted here rather than removed, since removing it would make `video.ts` a
less faithful port of `initVideo` than leaving the (now-inert) original
logic in place.

## Mutation proofs

**Converter rewrite + loud failure**, both in one exercise (`tools/convert.test.mjs`):
removed the entire new block from `convert.mjs` (the `assetRef` regex
check and its two branches), leaving only the pre-existing `assets[v]`
check:

```
not ok 11 - an assets/<id>.<ext> reference is rewritten to its mapped path
not ok 12 - an unresolvable assets/<id> reference is reported, not silently passed through
# pass 22 / # fail 2
```

All 22 other tests stayed green — the mutation is isolated to exactly the
two new tests, confirming neither one passes vacuously against the
pre-fix converter. Restored the fix immediately after; re-ran:

```
# tests 24
# pass 24
# fail 0
```

## Regenerated fidelity diff: `app/page.tsx` vs `.source/jsx/home.jsx`

Ran `node tools/unbundle.mjs` (output: `variant ignored: contact-pill.js
differs between bundles; keeping first` — the same single pre-existing
warning as always, plus `templates: 7  assets: 38  ext-resources: 7`, and
**no** `ext-resource conflict ignored` warning, confirming no id collided
across bundles). Reconverted all seven templates — every one exited 0,
completeness guard silent on all seven:

```
home       -> wrote .source/jsx/home.jsx        exit=0
about      -> wrote .source/jsx/about.jsx       exit=0
services   -> wrote .source/jsx/services.jsx    exit=0
studio     -> wrote .source/jsx/studio.jsx      exit=0
careers    -> wrote .source/jsx/careers.jsx     exit=0
contact    -> wrote .source/jsx/contact.jsx     exit=0
case-study -> wrote .source/jsx/case-study.jsx  exit=0
```

`.source/ext-resources.json` (regenerated):
```json
{
  "work-identity-s": "/images/b7afa59dc4.jpg",
  "three": ".source/vendor/three.js",
  "le": ".source/vendor/liquid-ether.js",
  "st": ".source/vendor/stroke-text.js",
  "work-redpanda-s": "/images/ce6c217cd9.jpg",
  "work-social-s": "/images/3143905490.jpg",
  "work-agasti-s": "/images/df2ee54140.jpg"
}
```
(`three`/`le`/`st` confirm the module ids `ether.ts`/`stroke.ts` were built
against, as the coordinator noted. Note `work-agasti-s` resolves to the
same hash — `df2ee54140.jpg` — already used as that testimonial's
full-size `data-vt-kb` key visual: the "poster" and the key visual are
byte-identical content, deduplicated by the existing `byHash` mechanism,
not a bug.)

The regenerated `home.jsx`'s four `data-vt-poster` values:
```
data-vt-poster="/images/df2ee54140.jpg"
data-vt-poster="/images/ce6c217cd9.jpg"
data-vt-poster="/images/3143905490.jpg"
data-vt-poster="/images/b7afa59dc4.jpg"
```

Confirmed each old value (`assets/work-agasti-s.jpg` etc.) occurred exactly
once in `app/page.tsx` before replacing (same discipline as Task 7's own
re-paste), then replaced all four via targeted edits — no other line
touched. `git diff app/page.tsx` confirms: exactly those 4 lines changed.

Full `diff -u .source/jsx/home.jsx app/page.tsx`: **8 removed, 14 added** —
identical in shape and count to Task 7's own last recorded fidelity diff
(wrapper: imports/`export default`/`return`/closing brace; 5 `next/image`
swaps; 2 component mounts: `<ContactPill />`, `<HomeRuntime />`). The four
poster values are not part of this diff at all — they're now identical on
both sides, which is the point: this refresh introduced zero new drift.

## Gate output (final, post-fix)

**`node --test lib/behaviors/ssr.test.mjs`**: 3/3 pass.

**`npx tsc --noEmit`**: exit 0, zero output.

**`npm run build`**: exit 0.
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    11.6 kB         114 kB
└ ○ /_not-found                            990 B         104 kB
+ First Load JS shared by all             103 kB
```
Only pre-existing warnings remain (the `<img>` LCP warnings on
intentionally-unconverted images, `lib/liquid-ether.ts`/`lib/stroke-text.ts`'s
pre-existing warnings — files I did not touch), plus exactly one new-code
warning: `lib/behaviors/reel.ts: 'q' is assigned a value but never used`
(the still-open, deliberately-kept dead computation from the original
report — unchanged by this round). The `fanPointer.ts`/`dur` warning from
the original report is gone, because the file is gone.

**Full project test suite** (`node --test tools/*.test.mjs lib/*.test.mjs
lib/behaviors/*.test.mjs`): **47/47 pass** (45 previously + 2 new).

**Home's First Load JS: 114 kB** (down from 115 kB — `fanPointer.ts`'s
removal).

## Files changed this round

- `lib/behaviors/fanPointer.ts` — deleted
- `lib/behaviors/index.ts` — `fanPointer` import/export removed
- `app/modules.ts` — `fanPointer` removed from `HOME_MODULES`, comment updated
- `tools/unbundle.mjs` — new `ext_resources` extraction pass, writes
  `.source/ext-resources.json`
- `tools/convert.mjs` — new `extResources` parameter and asset-reference
  rewrite/diagnostic; CLI block loads and passes the new map
- `tools/convert.test.mjs` — 2 new tests, both mutation-proven
- `app/page.tsx` — refreshed: the four `data-vt-poster` values now hold
  real `/images/*.jpg` paths instead of unresolved `assets/*.jpg` strings

Not touched: `lib/behaviors/video.ts` (per instruction — the dead branch is
noted above, not removed), `tools/tw.mjs`, `components/`, the two vendored
effect files.

## Self-review (this round)

- **Ruling 1:** verified independently (fresh grep, not trusted from the
  coordinator's message alone) before deleting; confirmed no stray
  references remain in code.
- **Ruling 2:** root cause traced to a bundler table Task 1 never read
  (`__bundler/ext_resources`), not to `video.ts`'s port, which was correct
  all along — matching the instruction to leave it untouched.
- **Discipline:** both new tests follow the file's own established
  convention exactly (whole-string `assert.equal`/`assert.throws` with a
  message-pinning regex, a comment explaining the mutation it catches,
  citation-style label matching the file's existing "Task N, fix round M,
  finding K" pattern). Both proven by actual mutation, not reasoned about.
- **Scope:** only the files listed above changed; `git status --short`
  confirms nothing else moved.

## Concerns

None outstanding from this round. All three of the prior report's concerns
are now resolved or confirmed correct. The one item worth carrying forward
is the Task 11 caveat above: the `data-ag-fan` count match for
`about.html`/`services.html` is a strong signal, not a verified conclusion
for those pages.
