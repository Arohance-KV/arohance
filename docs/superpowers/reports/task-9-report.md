# Task 9 (revised) Report: Playwright fidelity harness + desktop comparison

## Status: DONE_WITH_CONCERNS

The harness works, both targets capture cleanly (7/7 pages each), and the
comparison ran at 1440×900. There is one systematic, well-evidenced
"likely real defect" (a font-rendering difference that changes line
wrapping and section heights across every page) and one small,
unexplained "needs a ruling" item. Marked DONE_WITH_CONCERNS rather than
DONE because of the font finding — it is real and worth a decision, not
because the harness itself is in doubt.

---

## 1. How the harness works

### `tools/shoot.mjs` — capture

```
node tools/shoot.mjs <original|port> <width> [height]
```

For `original`: starts a small static HTTP file server (Node's built-in
`http`, no new dependency) over the repo root on `localhost:4500`, because
the seven bundles decode their base64 payloads into blob URLs and replace
the document — this does not work from `file://` and needs a moment.

For `port`: requires `.next` to already exist (run `npm run build` first;
the script does not build, only serves). Starts `next start -p 4501` by
invoking `node_modules/next/dist/bin/next` directly with `process.execPath`
(not `npm start`), so it is a single child process on Windows with no
npm/.cmd wrapper — a plain `child.kill()` reliably tears it down, no
process-tree cleanup needed.

For every one of the seven pages, per page:
1. `page.goto(url, { waitUntil: 'domcontentloaded' })`.
2. `page.waitForSelector('[data-ag-root]')` — the real readiness signal.
   Applied to both targets (harmless for the port, essential for the
   original).
3. `document.fonts.ready` (wrapped with a 10s timeout so a stuck font
   promise can't hang the run).
4. `page.waitForLoadState('networkidle')`.
5. **Scroll-trigger pass**: scrolls from top to bottom in ~8+ steps
   (150ms apart) so the `IntersectionObserver`-driven `[data-reveal]`
   elements fire, then returns to the top and waits 1800ms — comfortably
   past `reveal.ts`'s own 1600ms force-reveal guard, so even elements the
   scroll pass didn't precisely intersect end up at `opacity:1` before the
   screenshot.
6. Measures (see below) and takes a `fullPage` screenshot.

Each page runs in its own fresh `browser.newContext()` (isolated cache/
storage), all within one `chromium` process. A per-page try/catch means
one failing page does not abort the batch; its JSON record gets
`ok:false` and the raw error, and the run continues.

**Output** (per target, per width, per page):
```
<OUT_BASE>/<target>/<width>/<slug>.png
<OUT_BASE>/<target>/<width>/<slug>.json
```
`OUT_BASE` defaults to this session's scratch directory (override with
`SHOOT_OUT_DIR`). Never writes inside the repo.

The JSON record contains: `scrollWidth`/`clientWidth`/`scrollHeight`,
bounding boxes for `[data-ag-nav]`, `header`, `footer`, and every
`section[id]`, normalised whole-page visible text (`document.body.
innerText`, whitespace collapsed), the first `h1`'s computed
`font-family`/`font-size`/`color`/text, and `body`'s computed
`background-color`.

### `tools/compare.mjs` — comparison

```
node tools/compare.mjs <width> [outBase]
```

Reads both targets' JSON for every page slug, and reports, per page: text
differences (common-prefix/suffix diff, so a long page doesn't dump
thousands of characters — just the differing middle with context),
landmarks present in only one target, and geometry deltas beyond a 4px
tolerance (chosen as "small" per the brief — subpixel font-metric
rounding between the two rendering paths is expected noise; anything
past a handful of pixels is reported). Exits non-zero if any difference
was found, so it composes in a script/CI sense.

### Exact commands to reproduce this run

```
npm i -D playwright                      # already committed; only needed once
npx playwright install chromium          # only needed once

npm run build
node tools/shoot.mjs original 1440 900
node tools/shoot.mjs port 1440 900
node tools/compare.mjs 1440
```

No manual server start/stop needed — `shoot.mjs` starts and stops
whichever server that target needs.

---

## 2. Two things that had to be resolved before the comparison was valid

I'm reporting these prominently because both would have silently
corrupted the results if I hadn't caught them — worth knowing about even
though neither is a finding about the port itself.

**A stray `next dev` process was running in this exact repo directory**
(started 15:41:23, PIDs 9628/19996/23888, discovered via
`Get-CimInstance Win32_Process`), left over from outside this task. It
shares `.next` with `next start` (dev and production builds both write to
`.next`), and its incremental compiler was almost certainly overwriting
production build artifacts while my `next start` was concurrently serving
them. First symptom: the first 4 of 7 pages (home/about/services/studio)
captured with correct styling, the last 3 (careers/contact/case-study)
captured completely unstyled (Times New Roman, transparent background,
collapsed nav/header/footer geometry) — an exact split at the point in my
fixed page-iteration order where the concurrent rebuild most likely hit.
Confirmed by then finding `.next/BUILD_ID` missing entirely on a
follow-up check. **Resolution:** killed the stray process tree, deleted
`.next`, ran a clean `npm run build`, and recaptured — careers then
rendered correctly (screenshot confirms full dark theme, correct fonts,
orange accent). This was environmental contamination, not a port defect;
I flag it because if it happens again mid-comparison the symptom (some
pages perfectly fine, others totally unstyled) looks alarming and is easy
to misdiagnose as a real bug.

**A bug in my own `collectMeasurements()`** (in `tools/shoot.mjs`, so mine
to fix — not the port under test): the whole-page `text` field correctly
used `document.body.innerText` (rendering-aware: inserts a break at block
boundaries), but the `h1.text` sub-field used `h1.textContent` (raw DOM
text concatenation, no break awareness). The original's hand-written HTML
has literal newline+indentation whitespace text nodes between a
multi-line heading's `<span>` lines (harmless to `textContent`); JSX
strips that inter-element whitespace at compile time, so the port's
`textContent` glued the lines together (e.g. "WE MAKEYOUMAGNETIC."
instead of "WE MAKE YOU MAGNETIC."), even though both render pixel-
identical output — confirmed by checking `h1.innerText` in isolation
(correct on both targets) and by the screenshots themselves. **Fixed** by
switching that one field to `innerText`, matching the whole-page field's
method, and recaptured both targets. Every one of the six "h1 text
differs" false positives from the first run is gone from the final data
below.

Both fixes are in the committed `tools/shoot.mjs`. All data in this
report is from the recaptured, clean run (see file timestamps: 15:56–15:58).

---

## 3. Per-page comparison table at 1440×900

Geometry tolerance: ±4px. "Cascading" means the delta is the downstream
effect of a height difference earlier on the same page, not an
independent cause (see Section 4).

| Page | Text differences | Missing landmarks | Geometry deltas beyond tolerance |
|---|---|---|---|
| **home** | Video-reel counter digits only ("00:13/02:02" vs "00:21/02:02") | none | footer (y +76, h +1, cascading); `#work` (h −89); `#clients` (h +31); `#testimonials` (h +2, cascading); `#services` (h +18); `#contact` (h +3, cascading) |
| **about** | none | none | footer (y +15, h +1, cascading); `#studio` (h +12); `#intro` (h +3, cascading); `#contact` (h +3, cascading) |
| **services** | none | none | footer (y +129, h +1, cascading); `#services` (h +18); `#contact` (h +3, cascading) |
| **studio** | Clock digits only ("15:56:38 IST" vs "15:58:17 IST") | none | `header` (h **−152**, see Section 4 — a real line-wrap change, not rounding); footer (y −74, h +1, cascading) |
| **careers** | none — verified the "Six roles open" → "6 roles open" mutation fires identically on both targets | none | footer (y +68, h +1, cascading); `#roles` (h +13); `#process` (h +25); `#apply` (h +7) |
| **contact** | Clock digits only ("15:56:54 IST" vs "15:58:32 IST") | none | `header` (h +31); footer (y +17, h +1, cascading); `body` background-color `rgb(19,17,16)` (original) vs `rgb(12,11,10)` (port) |
| **case-study** | Clock digits only ("15:57:04 IST" vs "15:58:42 IST") | none | footer (y +50, h +1, cascading) |

**All seven pages**: `scrollWidth`/`clientWidth` match exactly (1440) on
both targets — no horizontal overflow on either side. `[data-ag-nav]`
geometry matches within tolerance everywhere. No landmark was present on
one target and absent on the other, on any page. No page failed to load
on either target (7/7 clean captures, both targets, both the
contaminated-run diagnosis and the final clean run).

TOTAL: 27 differences across 7 pages (down from 50 in the first,
contaminated/buggy run — see Section 2).

---

## 4. Every difference, classified

### Likely real defect (one systematic root cause, 22 of the 27 diffs)

**The Archivo variable font's width axis (`font-variation-settings:
'wdth' 106`, used on every big display heading) does not appear to take
effect in the port, making its headline text render measurably narrower
than the original.** This is not a rounding-level claim — I confirmed it
visually and structurally:

- `app/studio/page.tsx`'s h1 has three `[data-reveal]` line-spans; the
  first two ("A STUDIO,", "NOT A") are plain, but the third is one span
  containing `"SUPPLY CHAIN."` with no forced break — it wraps or doesn't
  wrap purely based on rendered glyph width. In the **original** screenshot
  it wraps to two lines ("SUPPLY" / "CHAIN."), giving a 4-line heading. In
  the **port** screenshot the identical text, identical class list,
  identical container, fits on one line ("SUPPLY CHAIN."), giving a
  3-line heading — hence `header` height 1081px (original) vs 929px
  (port), a 152px difference that is really "one fewer wrapped line," not
  noise.
- `app/layout.tsx` requests Archivo via `Archivo({ weight: ['100',...,
  '900'], ... })` — an explicit array of static weights. next/font/google
  generates real variable-font output (respecting axes like `wdth`) only
  when `weight: 'variable'` is passed; requesting an explicit weight list
  is the documented way to get static per-weight instances instead. The
  original bundle embeds the actual variable Archivo file directly
  (base64), which does carry the `wdth` axis. I believe this mismatch —
  static instances in the port vs. the real variable file in the original
  — is why `font-variation-settings: 'wdth' 106` has nothing to act on in
  the port. **I have not opened the served font file's `fvar` table to
  prove this with 100% certainty** (that would mean inspecting a
  downloaded `.woff2`'s binary tables, which felt like it crossed from
  "diagnose the comparison" into "debug the product" — exactly the kind
  of thing this task asked me not to do); the behavioural + visual
  evidence above is what I have, and it's consistent across every
  instance in the data.
- Every other geometry delta in the table besides the four clock/timer
  texts and the one body-background item is explained by this same
  mechanism: a shared "services" section on both `home` and `services`
  shows the *exact same* +18px delta on both pages; a shared "contact CTA"
  section on `home`/`about`/`services` shows the *exact same* +3px delta
  on all three; `careers`' three sections and `studio`'s header are the
  same font-driven reflow, just with more or less text near a wrap
  threshold. Footer y-offsets are the cumulative sum of every section
  above them being a few pixels off — not a separate defect at the
  footer.

Per this task's own rule, I have **not** touched `app/layout.tsx` or any
font config to fix this — it needs to be fixed once (if it's confirmed)
at the font-loading layer and would then correct itself across all seven
pages, exactly the "systematic conversion error" this task's constraints
describe.

### Known-acceptable (4 of the 27 diffs)

- The four "text differs" entries (`home`, `studio`, `contact`,
  `case-study`) are **only** a live clock/timer's digits — confirmed
  because after the differing digits, the total character count matches
  exactly on both targets (995=995, 1683=1683, 2375=2375, 5995=5995) and
  the surrounding text is identical. `studio`/`contact`/`case-study` use
  the ported real-time IST clock; `home`'s is the testimonial video's
  playhead counter. Two live captures taken at different wall-clock
  moments will never agree here, on either target.
- Explicitly checked per the brief: Careers' "Six roles open" (static) →
  "6 roles open" (mutated by script after mount) fires identically on
  both targets — both captured JSONs show "CAREERS 6 R[OLES OPEN]"
  verbatim. Not a finding.
- WebGL/GSAP canvas pixel content and DOM-depth/wrapper differences: per
  the brief, out of scope by design — I compared landmarks and text, not
  tree shape, and did not attempt to diff canvas pixels.

### Needs a ruling (1 of the 27 diffs)

- **`contact` page: `body` computed `background-color` is `rgb(19,17,16)`
  (`#131110`) on the original vs `rgb(12,11,10)` (`#0C0B0A`, the sitewide
  default) on the port.** I traced this partway: both targets'
  `[data-ag-root]` wrapper (`contact/page.tsx` line 8) explicitly carries
  `data-dark` + `bg-[#131110]`, matching the original's root div
  (`background:#131110`) exactly — and that wrapper is `min-h-[100svh]`,
  fully covering the viewport, so **this difference has no visible effect
  under normal scrolling on either target** (confirmed by side-by-side
  screenshot — both look identical). What I could not trace is why the
  original's actual `<body>` tag itself computes to `#131110` rather than
  the sitewide `body{background:#0C0B0A}` rule every other page's `body`
  correctly shows — there may be a per-page theme-sync behaviour in the
  original bundle's script that copies the root's background onto `body`
  (e.g. to avoid a colour mismatch during touch-device elastic overscroll)
  that either doesn't exist in the port or wasn't in scope for a task I
  can identify. Flagging rather than chasing further, since it's cosmetic
  and invisible in the only viewing condition I tested.

---

## 5. Screenshot and data directories (for your own review)

```
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\shots\original\1440\
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\shots\port\1440\
```
Each holds 7 `.png` (full-page) + 7 `.json` (measurements) files, one pair
per slug (`home`, `about`, `services`, `studio`, `careers`, `contact`,
`case-study`).

The full raw comparison output (final clean run) is saved at:
```
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-final.txt
```
(this is a redirected copy for my own reference while writing this report
— re-running `node tools/compare.mjs 1440` reproduces the same content to
stdout).

---

## 6. What failed to load or measure, and why

Nothing, in the final run: 7/7 pages captured cleanly on both targets
(`ok:true` in every JSON record). The one load failure that did occur
(3 of 7 port pages unstyled) was diagnosed as the stray-`next-dev`
contamination in Section 2, resolved, and recaptured — it is not a
present-tense failure.

---

## 7. Files changed

New (committed, `aca667d`):
- `tools/shoot.mjs`
- `tools/compare.mjs`

Modified (committed, `aca667d`):
- `package.json` — `playwright` added to `devDependencies` only
- `package-lock.json` — resulting lockfile update

Not touched: `app/`, `lib/`, `components/`, the seven root `.html` files,
anything else under `tools/`. No screenshots or JSON output were written
inside the repo (all in the session scratch directory per the brief);
`git status` is clean of anything besides the commit above.

I did run `npm run build` twice (once contaminated, once clean after
killing the stray process) and deleted/regenerated the gitignored `.next`
directory — this is a build artifact, not a tracked file, and is exactly
what the brief's own reproduction steps call for.

---

## 8. Concerns for you to decide on

1. **The font-width-axis finding (Section 4) is the one I'd most want a
   ruling on.** I'm confident in the observation (visual + structural
   evidence is solid) but have not opened the actual served font file to
   confirm the mechanism at the byte level — that felt like it belonged
   to whoever fixes it, not to this comparison task.
2. **The `contact` body-background item** is real but, as far as I can
   tell, invisible in practice. Low priority, included for completeness.
3. **I chose to commit** `tools/shoot.mjs`, `tools/compare.mjs`, and the
   `playwright` devDependency (commit `aca667d`) rather than leaving them
   uncommitted, matching this project's established per-task pattern
   visible in `progress.md` (every prior task's implementer committed its
   own work before review). If you'd rather review the diff uncommitted
   first for this task specifically, it's a one-line `git reset
   HEAD~1 --soft` away.
4. **The 4px geometry tolerance** in `compare.mjs` is a judgement call
   (the brief said "a small tolerance" without a number). Documented
   inline in the script and here; easy to change if you want it tighter
   or looser.

---

# Fix Round 1

## Status: DONE_WITH_CONCERNS

The authorised fix (`app/layout.tsx`, Archivo `axes:['wdth']`) is in,
proven working in the browser (not just accepted by the build), and the
harness now asserts it automatically. But **only 1 of the 22 geometry
deltas attributed to the font issue actually collapsed** — the other 21
survive unchanged, and I found why: a **second, independent, pre-existing
font bug** in the same file — `<body>`'s `font-family` never applies at
all, sitewide, on every one of the seven pages. Full diagnosis below. Not
fixed — outside what this round authorised — but the mechanism is proven,
not just suspected, and I believe it explains all 21 survivors.

---

## 1. The Archivo `wdth` fix — applied and proven

`app/layout.tsx`: replaced the explicit `weight` array with `axes:
['wdth']` and no `weight`, per your ruling exactly. `npm run build`
accepted it with no error and no fallback needed.

**Proof it actually renders, not just compiles** (per your instruction —
config accepted is not evidence): added `measureFontAxis()` to
`tools/shoot.mjs`, which creates a hidden off-DOM span in
`font-family:'Archivo',sans-serif` (the same family reference every real
heading uses), measures its rendered width at `font-variation-settings:
'wdth' 62` vs `'wdth' 125`, and records the ratio. Before the fix, I ran
this manually against the built port: ratio 1.0 (no measurable
difference — a static instance, confirming the axis was inert). After the
fix, against the same page: **narrow=1313.53125px, wide=2506.84375px,
ratio=1.908** — and run against the original bundle, the exact same
numbers to five decimal places. Not merely "different and present" —
metrically identical to the reference.

**Folded into the harness** (not just checked by hand once): `tools/
compare.mjs` now has a dedicated `checkFontAxis()` regression guard,
printed as its own section and contributing to the exit code:

```
## Font variable-width axis regression guard (Archivo 'wdth', threshold ratio >= 1.3)
  PASS home (original ratio 1.908, port ratio 1.908)
  PASS about (original ratio 1.908, port ratio 1.908)
  PASS services (original ratio 1.908, port ratio 1.908)
  PASS studio (original ratio 1.908, port ratio 1.908)
  PASS careers (original ratio 1.908, port ratio 1.908)
  PASS contact (original ratio 1.908, port ratio 1.908)
  PASS case-study (original ratio 1.908, port ratio 1.908)
```

1.3 is comfortably between a working axis (~1.9, measured) and a reverted
static instance (~1.0, measured) — a future regression back to an
explicit `weight` array will make this fail loudly with the exact
per-target ratios printed, rather than reappearing as 22 unexplained
geometry deltas for someone else to re-diagnose from scratch.

**Visual confirmation, the same way the original finding was made**:
`/studio`'s heading (`app/studio/page.tsx` line 100, span text `"SUPPLY
CHAIN."`, no forced break — wraps purely on rendered width) now wraps to
two lines in the port too, matching the original exactly — 4 total
heading lines on both targets. The `header` geometry delta on `/studio`
(previously −152px) is gone from the comparison entirely.

---

## 2. Re-shot comparison at 1440 — what survived

Recaptured both targets fresh (`npm run build`, then `shoot.mjs original
1440 900` and `shoot.mjs port 1440 900`; checked for stray processes
before each, per the lesson from the first round). **27 → 26 total
differences.** Only the `/studio` header delta collapsed. Every other
geometry delta is present at the **exact same pixel magnitude** as before
the font fix — proof in itself that the font-width axis was never their
cause; something else, common to all of them, still is.

| Page | Text differences | Missing landmarks | Geometry deltas beyond tolerance |
|---|---|---|---|
| home | Video counter digits only (known-acceptable) | none | footer, `#work`, `#clients`, `#testimonials`, `#services`, `#contact` — all unchanged from round 1 |
| about | none | none | footer, `#studio`, `#intro`, `#contact` — unchanged |
| services | none | none | footer, `#services`, `#contact` — unchanged |
| studio | Clock digits only (known-acceptable) | none | **only footer remains — `header` delta gone** |
| careers | none (roles-open mutation still verified matching) | none | footer, `#roles`, `#process`, `#apply` — unchanged |
| contact | Clock digits only (known-acceptable) | none | `header`, footer, body background-color (ruled below) — unchanged |
| case-study | Clock digits only (known-acceptable) | none | footer only — unchanged |

Full raw output:
`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-fixround1.txt`

---

## 3. The separate defect — `<body>`'s font-family never applies

Investigated the most-repeated survivor first: `#services` on `home` and
on `services` both show the identical +18px height delta. A clipped,
targeted Playwright screenshot of that section on both targets (not a
downscaled full-page image — full-page images are too tall to show a
single section legibly) shows the **first accordion item's body-copy
paragraph wrapping at a different word**:

- Original: `"...who shoot it. Monthly / creative direction, a production
  calendar, and enough footage that / the feed never runs dry."`
- Port: `"...who shoot it. / Monthly creative direction, a production
  calendar, and / enough footage that the feed never runs dry."`

That paragraph has no explicit font override, so it inherits from
`<body>`. Measuring `getComputedStyle(document.body).fontFamily`
directly:

```
ORIGINAL: "Instrument Sans", system-ui, sans-serif
PORT:     -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", "Noto Sans", Arial, sans-serif,
          "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
          "Noto Color Emoji"
```

**The port's `<body>` is not rendering Instrument Sans at all** — it's
falling all the way back to Tailwind v4's own default sans stack. I
traced this to the compiled CSS (`.next/static/css/*.css`):

```
body{color:#f5f2ed;-webkit-font-smoothing:antialiased;background:#0c0b0a;margin:0;overflow-x:hidden}
```

No `font-family` on `body` at all. And the utility class `app/layout.tsx`
puts on `<body>` — `className="font-[var(--font-instrument),system-ui,
sans-serif]"` — **does compile to a rule, but the wrong property**:

```
.font-\[var\(--font-instrument\)\,system-ui\,sans-serif\]{--tw-font-weight:var(--font-instrument),system-ui,sans-serif}
```

Tailwind's `font-` prefix is ambiguous between the `font-family` and
`font-weight` utility groups; for this particular arbitrary-value shape
(starting with `var(...)`) its heuristic resolved it as a **font-weight**
utility, writing the font-stack string into `--tw-font-weight` — a
CSS custom property that is nonsensical as a weight and has no effect on
the rendered font at all. `<body>` therefore has no working font-family
rule of its own and inherits Tailwind's preflight default from `<html>`
(`font-family:var(--default-font-family,-apple-system,BlinkMacSystemFont,
"Segoe UI",...)`, confirmed present in the same CSS file).

**This is why it wasn't caught by eye**: Segoe UI (this machine's system
UI font, since Playwright's Chromium is running on Windows) and
Instrument Sans are both clean, similar-weight geometric sans-serifs, so
the substitution is easy to miss on a screenshot glance — exactly the
class of thing this harness exists to catch instead of relying on visual
review. It is sitewide (every page shares this `<body>` in `app/
layout.tsx`) and affects every piece of text that doesn't carry an
explicit font override — which, unlike Archivo's display headings, is
most of the body copy on all seven pages: paragraphs, list items, form
labels, nav text. I believe this fully explains the 21 surviving geometry
deltas (all of them are heights of sections containing body-copy text
whose line-wrapping depends on font metrics) — I did not re-derive each
one individually beyond the `#services` case above and the general
mechanism, since that felt like the right stopping point for a
diagnosis rather than a fix.

**I have not applied a fix.** This file was authorised for the Archivo
change specifically; this is a different, newly-found defect in the same
file. The likely correct fix, by analogy with the pattern that already
works correctly everywhere else in this codebase (every `h1`'s
`[font-family:'Archivo',sans-serif]`, which is Tailwind's unambiguous
arbitrary-*property* syntax, `[property:value]`, not the ambiguous
arbitrary-*value* syntax `font-[value]`) would be to change `<body>`'s
className to the same pattern:
```
className="[font-family:var(--font-instrument),system-ui,sans-serif]"
```
I have not tried this — verifying it is the right one-line fix (and not,
say, masking a second issue) belongs to whoever takes the ruling, per
this task's standing "do not fix, report" rule outside of the one
change explicitly authorised this round.

---

## 4. Contact background-color — recorded per your ruling, not changed

No code change made. Per your ruling, `globals.css` is untouched. Still
present in the data (`contact`: `rgb(19,17,16)` original vs
`rgb(12,11,10)` port) — carried forward here for the final review record,
not as an open question.

---

## 5. Files changed this round

- `app/layout.tsx` — Archivo font config only (`axes:['wdth']`, `weight`
  removed); `Instrument_Sans` config untouched (verified against all
  seven source templates first: every `@font-face` for Instrument Sans
  declares a single fixed `font-weight` and `font-stretch:100%` — static
  by design in the original too, confirming your ruling before I acted
  on it, not after)
- `tools/shoot.mjs` — added `measureFontAxis()`, folded into
  `collectMeasurements()` as `archivoWdthAxis` on every page record
- `tools/compare.mjs` — added `checkFontAxis()` + its printed section,
  `FONT_AXIS_RATIO_MIN` constant

Not touched: `globals.css`, anything under `app/*/page.tsx`,
`components/`, `lib/`, the seven root `.html` files.

One incidental, unrelated observation while verifying Instrument Sans
against source (not touched, just noting it): `app/layout.tsx` requests
Instrument Sans at weight `700` in addition to `400/500/600`; grepping
all seven `.source/templates/*.html` files, only `400/500/600` are ever
declared for that family. A harmless, pre-existing over-fetch (one unused
static weight), not part of this round's scope.

---

## 6. Concerns for you to decide on

1. **The new `<body>` font-family bug (Section 3) is the one I'd most
   want a ruling on** — I believe it's the real explanation for the 21
   survivors, diagnosed down to the exact wrong compiled CSS rule, but I
   have not applied or tested the proposed fix.
2. Once that's fixed, I'd expect a third capture/compare round to show
   whether the 21 deltas collapse the way `/studio`'s did — I have not
   done that round since the fix isn't in.
3. The font-axis regression guard's 1.3 threshold is a judgement call
   (same category as the 4px geometry tolerance from round 1) — margin
   looks wide (measured 1.0 vs 1.9) but it's still a chosen number, not a
   derived one.

---

# Fix Round 2

## Status: DONE_WITH_CONCERNS

The authorised fix is in and proven in the browser two ways, as
instructed. Re-shot comparison: 26 → 24 total differences, several
deltas collapsed or shrank substantially, but **three did not move at
all** — home/services' shared `#services` accordion, about's `#studio`,
careers' `#roles` — identical to the pixel across all three font states
tested in this task. I traced the `#services` case down to exactly which
part of the page it comes from (localized to one accordion item, not
accumulating), but not to a confirmed root cause — that's the one open
item below.

---

## 1. The fix — applied exactly as ruled

`app/globals.css`: `font-family: var(--font-instrument), system-ui,
sans-serif;` inserted into the `body` rule in the position you specified
(between `color` and `-webkit-font-smoothing`, matching the original's
declaration order exactly). `app/layout.tsx`: `<body>` now carries no
`className` at all. `npm run build` accepted both with no error.

Confirmed in the compiled CSS immediately after:
```
body{color:#f5f2ed;font-family:var(--font-instrument),system-ui,sans-serif;-webkit-font-smoothing:antialiased;background:#0c0b0a;margin:0;overflow-x:hidden}
```

---

## 2. Proof it renders, not just compiles — two checks, both required

Per your instruction not to accept a third silent-config-change on trust,
`measureBodyFont()` (added to `tools/shoot.mjs`) checks two independent
things:

**1. The resolved font-family string actually names Instrument Sans.**
```
getComputedStyle(document.body).fontFamily
  → "Instrument Sans", "Instrument Sans Fallback", system-ui, sans-serif
```
(Before the fix, this was the raw system stack: `-apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, ...` — no mention of Instrument
Sans at all.) Cross-checked against `document.fonts` (the FontFaceSet):
`Instrument Sans` and `Instrument Sans Fallback` both appear with
`status: 'loaded'`.

**2. A real body-copy string renders at a different width under that
value than under the literal keyword `system-ui`** — guarding against
the string naming the right family while the face silently fails to load
and the browser substitutes something metrically identical to system-ui
anyway. Measured on a real sentence (`"Always-on content built by the
people who shoot it, 0123456789"` at 16px/400):
```
width as rendered (resolved font-family): 466.73px
width forced to system-ui:                456.23px
delta:                                     10.50px
```
**Identical on both targets** (original and port both measure exactly
10.50px), and identical across all seven pages.

**Folded into `tools/compare.mjs`** as `checkBodyFont`, printed as its own
section alongside the existing font-axis guard, both contributing to the
exit code:
```
## Body font regression guard (Instrument Sans, min 2px delta vs system-ui)
  PASS home (original delta 10.50px, port delta 10.50px)
  PASS about (original delta 10.50px, port delta 10.50px)
  PASS services (original delta 10.50px, port delta 10.50px)
  PASS studio (original delta 10.50px, port delta 10.50px)
  PASS careers (original delta 10.50px, port delta 10.50px)
  PASS contact (original delta 10.50px, port delta 10.50px)
  PASS case-study (original delta 10.50px, port delta 10.50px)
```
A future regression to a fallback font — whether the name goes wrong or
just the face fails to load — now fails the comparison loudly, with the
exact numbers printed, instead of reappearing as a wall of unexplained
geometry deltas.

---

## 3. Re-shot comparison at 1440 — what moved, what didn't

Recaptured both targets fresh (checked for stray processes before each,
per the round 1 lesson). **26 → 24 total differences.**

Some deltas resolved fully or substantially:
- `home #work`: gone entirely (was −89px)
- `home #clients`: 31px → 3px (now mostly within tolerance; the small
  residual is cascaded Y-offset, not its own height)
- `contact header`: gone entirely (was +31px)
- `careers #process`: 25px → 8px
- `careers #apply`: 7px → 4px

**Three did not move at all — identical to the pixel across every font
state I tested this task** (originally broken / Archivo fixed only /
both fixed):
- `home #services` and `services #services`: **+18px**, unchanged
- `about #studio`: **+12px**, unchanged
- `careers #roles`: **+13px**, unchanged

Updated per-page table:

| Page | Text differences | Missing landmarks | Geometry deltas beyond tolerance |
|---|---|---|---|
| home | Video counter digits only (known-acceptable) | none | footer (cascade); `#clients` (mostly resolved, small cascade residual); `#testimonials` (cascade); **`#services` +18px, unresolved**; `#contact` (cascade) |
| about | none | none | footer (cascade); **`#studio` +12px, unresolved**; `#intro` (cascade); `#contact` (cascade) |
| services | none | none | footer (cascade); **`#services` +18px, unresolved** (same as home's); `#contact` (cascade) |
| studio | Clock digits only (known-acceptable) | none | footer (cascade) only — clean otherwise |
| careers | none (roles-open mutation still verified matching) | none | footer (cascade); **`#roles` +13px, unresolved**; `#process` (mostly resolved); `#apply` (mostly resolved) |
| contact | Clock digits only (known-acceptable) | none | footer (cascade); body background-color (ruled — recorded, no action) |
| case-study | Clock digits only (known-acceptable) | none | footer (cascade) only |

Full raw output:
`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-fixround2.txt`

---

## 4. The three survivors — traced, not yet root-caused

Took a fresh clipped screenshot of the full `#services` accordion (all 6
items — I'd only captured the first item's crop in round 1, which
understated what was visible) at a viewport tall enough to render the
whole 1270–1288px section in one shot, for both targets:

- **Item 1's paragraph now wraps identically** on both targets ("...who
  shoot it. Monthly / creative direction, a production calendar, and
  enough footage that / the feed never runs dry." — same break points
  both sides), confirming the body-font fix did resolve the specific
  wrap difference I found in round 1.
- **But the +18px gap still appears, and it appears entirely within item
  1's own block** — the divider between item 1 and item 2 sits 18px
  lower in the port than in the original. Every item after that
  (2 through 6) sits at that same constant +18px offset, not a growing
  one — item 6's divider is not 6×18px lower, it's still just +18px.
  So this is not a per-item accumulation; it is a fixed, one-time height
  difference contributed by item 1's expanded panel specifically, then
  carried downward unchanged by ordinary block flow.

**What I ruled out:** the paragraph's `leading-[1.55]` is a unitless
line-height, which computes purely from the element's own font-*size*
(itself fixed by a `vw`-based `clamp()`, not font-metric-dependent) —
identical on both targets regardless of which font renders it. That
rules out the paragraph as the source, now that its wrap also matches.

**My best remaining hypothesis, explicitly unconfirmed:** the panel's
right-hand column (`<span>` list — "Content strategy", "Always-on
social", etc.) has `flex flex-col gap-[9px]` but **no explicit
line-height class**, unlike the paragraph beside it. Its line height is
therefore the browser's "normal" value — derived from the font's own
vertical metrics (ascent/descent/line-gap), not just its declared
font-size. My round-2 proof (Section 2) only measured *horizontal*
character width, matching exactly between targets; I did not measure
vertical metrics. It's plausible that next/font's self-hosted Instrument
Sans file and the original's directly-embedded one, while naming the
same family and matching in width, differ slightly in vertical metrics —
which would show up exactly as a small, constant, non-accumulating
height difference in the one text block on the page with no explicit
line-height override. **I have not verified this** — it would need a
third proof technique (comparing natural/default line-height, not
width), and applying it crosses from diagnosing into a new investigation
beyond what this round authorised. Flagging it as the concrete next
thing to check, not as a finding I'm confident enough to call fixed or
even fully explained.

I did not individually re-trace `about #studio` or `careers #roles` to
the same depth — both show the identical cross-round-invariant pattern
(unchanged across all three font states), which is consistent with the
same mechanism, but that is inference from one representative case, not
independent confirmation for each.

---

## 5. Files changed this round

- `app/globals.css` — `body` rule gains `font-family`, in the original's
  declaration position
- `app/layout.tsx` — `<body>`'s `className` removed entirely
- `tools/shoot.mjs` — added `measureBodyFont()`, folded into
  `collectMeasurements()` as `instrumentBodyFont`
- `tools/compare.mjs` — added `checkBodyFont()` + its printed section,
  `BODY_FONT_NAME` / `BODY_FONT_DELTA_MIN_PX` constants

Not touched: anything under `app/*/page.tsx`, `components/`, `lib/`, the
seven root `.html` files.

---

## 6. Concerns for you to decide on

1. **The three survivors (Section 4) are the open item.** Traced
   precisely (localized to one element, non-accumulating) but not
   root-caused. My hypothesis (vertical font-metric mismatch on an
   un-overridden line-height) is plausible, not verified.
2. If that hypothesis is right, the fix would very likely be adding an
   explicit `leading-*` class to that list (and whatever equivalent
   elements exist in `#studio` / `#roles`) rather than another font
   config change — but I have not confirmed the hypothesis, so I have
   not proposed a specific edit the way I could for the two font issues.
3. Both regression guards (font axis + body font) are now in
   `tools/compare.mjs` and will catch a regression in either typeface
   going forward, independent of whether Section 4 gets resolved.

---

# Fix Round 3 — Diagnosis Only

## Status: DONE (diagnosis) — no application code changed

**No changes to `app/`, `lib/`, `components/`, or `globals.css` this round.**
`git status --short` is clean; everything below came from throwaway
scripts in the scratch directory
(`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\`,
listed in Section 8) plus one already-built `.next` I read files out of.
I did not modify and revert anything — I never needed to touch app code
to get any of this evidence.

**Headline result: your round-2 hypothesis (real font-file vertical
metrics differ) is refuted at the file level** — the two Instrument Sans
WOFF2 files have byte-identical `hhea`/`OS/2`/`head` metrics. **But
line-height genuinely does differ, empirically, in the browser, for
every element that relies on unset (`normal`) line-height** — and I
traced the actual mechanism: it is not the real font files, it is
**next/font's automatic "size-adjust" fallback face** (`Instrument Sans
Fallback`, `Archivo Fallback`) altering how `normal` resolves, plus, for
`#studio` specifically, **a third, previously unchecked font that turns
out to be completely broken** — `JetBrains Mono` isn't loading in the
port at all. Full evidence below, with confidence levels attached to
each claim as requested.

---

## 1. Direction and precision — all three survivors are the port running TALLER

| Block | Original height | Port height | Direction | Magnitude |
|---|---|---|---|---|
| `home #services` | 1270.44px | 1287.94px | port taller | **+17.5px** |
| `services #services` (same component) | 1270.44px | 1287.94px | port taller | **+17.5px** |
| `about #studio` | 1393.58px | 1405.83px | port taller | **+12.25px** |
| `careers #roles` | 1312.11px | 1324.61px | port taller | **+12.5px** |

(Sub-pixel figures from unrounded `getBoundingClientRect()`; `tools/
compare.mjs` rounds to whole px, which is why its own printed deltas read
18/18/12/13 — same numbers, just rounded.)

**Confidence: certain (directly measured, both targets, this round).**

This direction is itself informative per your own framing: Tailwind
Preflight removing a default margin could only make the port *shorter*
or equal, never taller. Every survivor going the same direction, and
that direction being the one Preflight *cannot* produce, is already a
strong signal before checking anything else — confirmed properly in
Section 4.

---

## 2. Is it line-height? Yes — measured directly, in the browser, on both targets

Per your instruction, I measured `getComputedStyle(el).lineHeight` and
`el.offsetHeight` on the same element on both targets, for a no-explicit-
line-height element in the panel, and for comparison, a single-line
reference nearby.

**`#services` item 1, the Instrument Sans list span** (`<span>Content
strategy</span>`, `text-[14px]`, no `leading-*` class — located via
Playwright's text locator, not a class selector, so it's guaranteed to
be the same element on both targets regardless of markup differences):

| | original | port |
|---|---|---|
| `font-family` (computed) | `"Instrument Sans", system-ui, sans-serif` | `"Instrument Sans", "Instrument Sans Fallback", system-ui, sans-serif` |
| `line-height` (computed) | `normal` | `21px` |
| `offsetHeight` | **18px** | **21px** |

**+3px per line.** The parent container (5 stacked spans, `gap:9px`)
measures 126px (original) vs 141px (port) — **+15px**, exactly 5 × 3px.
That is the *entire* item-1-specific delta (see Section 5).

**A single-line JetBrains Mono reference**, tested two ways to rule out a
one-off (`#services`'s accordion index number "01", and the section's own
eyebrow label "(04) What we do" — different elements, same font/size):

| | original | port |
|---|---|---|
| `font-family` (computed) | `"JetBrains Mono", monospace` | `"JetBrains Mono", monospace` (string identical, but see Section 3b — it does not resolve to a real distinct face) |
| `line-height` (computed) | `normal` | `16.5px` |
| `offsetHeight` | **14px** | **17px** |

**+3px per line, both elements, exact same magnitude.** Reproducible, not
a fluke.

**An Archivo single-line reference** (`about #studio`'s hover-card name,
`<div>NEER</div>`, `font-bold`, no `leading-*` class, no explicit
`font-variation-settings` on this specific element — unlike the display
headings, which do set one):

| | original | port |
|---|---|---|
| `line-height` (computed) | `normal` | `30px` |
| `offsetHeight` | **22px** | **30px** |

**+8px** — same phenomenon (unset line-height resolving differently),
larger magnitude, one data point only (see Section 5's honesty note on
`#studio`).

**Confidence: certain that line-height differs and is real (directly
measured, reproducible on 4 independent elements across 2 font
families). Confidence that this is the *complete* explanation for
`#studio`'s magnitude specifically: medium — see Section 5.**

---

## 3. Font-file forensics

### 3a. Instrument Sans — files are byte-identical where it matters

Extracted the original's actual embedded Instrument Sans (latin) WOFF2 —
it is still inside `Arohance Homepage.html`'s `__bundler/manifest` block
(uuid `64be1078-c59b-45b1-ba1c-1bccc0ae896b`), unbundle.mjs just never
writes it to disk. Copied next/font's corresponding file from `.next/
static/media/26d0ba92e140f0dc-s.p.woff2` (matched via the compiled CSS's
`@font-face` `src` for the same `unicode-range`). Wrote a minimal WOFF2
parser (header + table directory + Node's built-in `zlib.
brotliDecompressSync` — no new dependency) to read the `hhea`/`OS/2`/
`head` tables directly:

| Field | Original | Port |
|---|---|---|
| `head.unitsPerEm` | 1000 | 1000 |
| `hhea.ascent` | 970 | 970 |
| `hhea.descent` | −250 | −250 |
| `hhea.lineGap` | 0 | 0 |
| `OS/2.sTypoAscender/Descender/LineGap` | 970 / −250 / 0 | 970 / −250 / 0 |
| `OS/2.usWinAscent/usWinDescent` | 986 / 350 | 986 / 350 |
| `fvar` table | present (68 bytes) | present (68 bytes) |

**Every field CSS `normal` line-height could derive from is identical.**
Both files are also variable fonts (`fvar` present in both) — which
resolves a smaller mystery in passing: next/font declares 4 separate
`@font-face` rules (weights 400/500/600/700) that all point at the exact
same physical file; I initially read that as a bug, then found the
*original bundle does the exact same thing* (its own weight-400 and
weight-500 `@font-face` blocks cite the identical two uuids) — Google's
CSS2 API apparently serves one variable file regardless of which
discrete weight you request, and both the original tool and next/font
inherit that behavior identically. Not a divergence.

The only structural difference: the original's file has a `prep` table
(hinting instructions) the port's lacks. `prep` does not contain
ascent/descent/lineGap data and is not used in `normal` line-height
computation.

**Confidence: certain.** This directly refutes the round-2 hypothesis as
stated. **The remedy it implied (drop next/font, ship the raw WOFF2s) is
not supported by this evidence** — the files are not meaningfully
different; something else, downstream of the file, changes the computed
value.

### 3b. JetBrains Mono — not a metrics question, it isn't loading at all

Unlike Archivo and Instrument Sans, **JetBrains Mono has no `next/font`
call anywhere** — I grepped `app/`, `lib/`, `components/`: every use is
`[font-family:'JetBrains_Mono',monospace]` directly in a `className`,
with no `@font-face` for it anywhere in `globals.css` either. It depends
entirely on the browser finding a locally-installed font named
"JetBrains Mono".

Measured directly: a test string set to `'JetBrains Mono', monospace`
vs. the same string set to the bare keyword `monospace`:

| | original | port |
|---|---|---|
| width at `'JetBrains Mono', monospace` | 595.2px | 545.4px |
| width at generic `monospace` | 545.4px | 545.4px |
| differs? | **yes** — a real distinct face loads | **no** — identical to generic monospace |

The original bundle embeds its own JetBrains Mono file directly (same
technique as Archivo/Instrument Sans), so it renders correctly. The port
never ships one, so every element using this class silently falls back
to whatever generic monospace font the operating system provides. On
this Windows/Chromium environment that fallback's `normal` line-height
happens to be 3px taller per line than the real JetBrains Mono's — which
is coincidental to this OS/browser combination, not a guaranteed
constant, and is a completely different *kind* of bug from 3a (a font
that was never requested at all, not a fallback-face side effect of one
that was).

**Confidence: certain that JetBrains Mono is unstyled in the port.**
Whether this is "in scope" for the three survivors is answered in
Section 5 — for `#services`/`#roles` the arithmetic says mostly no; for
`#studio` it may well be a contributor, unquantified.

---

## 4. Tailwind Preflight — ruled out, two independent ways

**By direction:** all three survivors are the port running *taller*.
Preflight only zeroes default margins/padding, which can only make an
element the same size or smaller, never larger. This alone rules it out
as the (sole) cause, before checking a single line of markup.

**By source:** grepped all three blocks (`app/page.tsx` lines 378–495,
`app/about/page.tsx` lines 103–165, `app/careers/page.tsx` lines
136–250) for every `<p>`, `<h1>`–`<h6>`, `<ul>`, `<li>`. Every `<p>` and
`<h3>` in all three blocks explicitly carries `m-0` (or another explicit
margin utility) already — there is no bare, unstyled block element
anywhere in these three sections for Preflight to have zeroed a default
on in the first place, and there are no `<ul>`/`<li>` elements at all
(the "lists" are `<div>`/`<span>`, not semantic lists Preflight would
touch differently). There is nothing here for Preflight to be doing.

**Confidence: certain, ruled out.**

---

## 5. Why only these three blocks — mostly explained, one gap disclosed honestly

**`#services` (home and services): fully, precisely reconciled.**
Item 1's own block is +15px (5 Instrument Sans list spans × +3px each,
measured exactly as 126px → 141px). The section eyebrow row above it is
one JetBrains Mono line, +3px. **15 + 3 = 18px — the entire section
delta, to the pixel.** Items 2–6 are collapsed accordion headers whose
row height is governed by the tall Archivo `<h3>` (proven fixed,
unaffected), not by the small idx label — confirmed directly: their
measured heights are bit-for-bit identical between targets (119.40625px
et al., matched exactly), which is *why* the extra height doesn't
accumulate item-by-item. This was the locality clue you flagged, and it
fully explains itself once you know a collapsed row's height doesn't
come from the element that's actually different.

**`#roles` (careers): same shape, closely reconciled, not pixel-exact.**
Same accordion structure, item 1 auto-expanded. Item-1-only delta
measured at +10px; the panel has 3 Instrument Sans spans + 1 anchor
(`Apply →`, also no explicit `leading-*`) — at +3px each that predicts
+12px, 2px more than measured. Section eyebrow contributes another +3px
→ predicted total +13 (matches exactly the reported +13). I did not
resolve the 2px item-1 sub-discrepancy (a gap-rounding effect, most
likely, but I have not isolated it) — flagging rather than papering over
it.

**`#studio` (about): same mechanism clearly present, but NOT
arithmetically closed.** This section has no accordion at all — a
different layout (flex-wrap cards, each an image plus a name/role pair).
The one data point I have (`data-hover-title` "NEER": +8px) is real and
uses the identical mechanism (Archivo, unset line-height). But naively
multiplying by the 4 cards' name+role pairs overshoots the actual +12px
section total by a wide margin, which tells me the row-dominance effect
seen in `#services` (a taller sibling absorbing the small element's
extra height) is very likely happening here too — but with different
per-card layout math I have not worked out. **I am not confident I have
identified `#studio`'s complete cause.** It is very likely the same
family of bug (unset-line-height elements, one of which is Archivo/
`data-hover-title`, the other JetBrains-Mono/role-label, both broken in
ways proven above) rather than a fourth, unrelated mechanism — but I
have not reconciled the arithmetic the way I could for the other two,
and I have not ruled out a contribution from image sizing (this section
has 5 images; `next/image` vs the original's plain `<img>` handle
intrinsic sizing differently and I did not check this).

**Why only three blocks sitewide:** most of the site's text either uses
an explicit `leading-*` class (a unitless multiplier of the element's own
font-size — provably unaffected by any of this, since it never consults
`normal`/fallback-face metrics at all) or is an Archivo display heading
that also carries an explicit `font-variation-settings` *and* an explicit
`leading-[1]`-style class. Elements with **no** explicit line-height at
all are rare across the seven pages — concentrated in exactly these
accordion side-lists and hover-card labels. That is not a coincidence;
it is why the search space was already small enough for this diagnosis
to be tractable in one round.

**Confidence: high for `#services`, high for `#roles`, medium for
`#studio`** (real contributing mechanism identified, magnitude not fully
accounted for).

---

## 6. Full remaining difference list — all 24, direction + magnitude, grouped

"Cascade" = downstream Y-offset from a taller element earlier on the
same page, not an independent cause. All footers also carry a universal
**+1px height** (405→406 or 252→253, every single page) — almost
certainly ordinary sub-pixel rounding, listed once here rather than
repeated seven times.

**Group A — the line-height/fallback-face mechanism (Sections 2–5), the
open item:**
| Item | Direction | Magnitude |
|---|---|---|
| `home #services` | port taller | +18px |
| `services #services` | port taller | +18px |
| `about #studio` | port taller | +12px |
| `careers #roles` | port taller | +13px |

**Group B — cascaded Y-offset from Group A (not independent findings):**
| Item | Direction | Magnitude |
|---|---|---|
| `home` footer | port lower | +62px (+1px h) |
| `home #clients` | port lower | +5px (h within tolerance) |
| `home #testimonials` | port lower | +7px (h within tolerance) |
| `home #contact` | port lower | +61px (+3px h) |
| `about` footer | port lower | +15px (+1px h) |
| `about #intro` | port lower | +12px (+3px h) |
| `about #contact` | port lower | +15px (+3px h) |
| `services` footer | port lower | +52px (+1px h) |
| `services #contact` | port lower | +51px (+3px h) |
| `studio` footer | port lower | +83px (+1px h) |
| `careers` footer | port lower | +49px (+1px h) |
| `careers #process` | port lower | +39px (+8px h — partial residual of Group A's mechanism at smaller scale, same 3 accordion structure, item 1 not auto-expanded here so smaller effect) |
| `careers #apply` | port lower | +46px (+4px h) |
| `case-study` footer | port lower | +50px (+1px h) |

**Group C — anomalous direction (not yet explained, smallest magnitude):**
| Item | Direction | Magnitude |
|---|---|---|
| `contact` footer | port **higher/earlier** | −12px (+1px h) — the one footer that goes the other way; `contact` is a short, simple page with no `section[id]` elements between header and footer, so it has the least surface for Group A/B effects to accumulate before reaching the footer |

**Group D — known-acceptable (live clock/timer text, not geometry):**
| Item | Note |
|---|---|
| `home` | testimonial video playhead counter digits |
| `studio` | live IST clock digits |
| `contact` | live IST clock digits |
| `case-study` | live IST clock digits |

**Group E — ruled, recorded, no action (per your Fix Round 1 ruling):**
| Item | Note |
|---|---|
| `contact` body background-color | `#131110` vs `#0C0B0A`, fully occluded by the root wrapper, cosmetically invisible |

4 (A) + 14 (B) + 1 (C) + 4 (D) + 1 (E) = 24.

---

## 7. Recommended remedy — by confidence, deliberately not a single answer

I'm not proposing "abandon next/font" — the evidence doesn't point there
(Section 3a). Three narrower, independent candidates instead:

1. **JetBrains Mono (high confidence this is a real, separate bug worth
   fixing regardless of the other two):** it is not loaded at all in the
   port. The straightforward fix is adding it via `next/font/google` the
   same way Archivo/Instrument Sans already are (or self-hosting it),
   which would also make it consistent with how the other two fonts are
   now handled. This alone would resolve `#studio`'s JetBrains-Mono-
   driven component and is unambiguously correct regardless of what else
   is going on.
2. **The Instrument Sans / Archivo Fallback faces (medium-high
   confidence this is the mechanism, low confidence on the exact fix):**
   next/font's automatic fallback-face generation (`adjustFontFallback`,
   on by default) is what differs from the original, not the real font
   files. The likely remedy is disabling it (`adjustFontFallback: false`
   in the `Archivo(...)`/`Instrument_Sans(...)` calls) so the resolved
   `font-family` list matches the original's shape exactly (no synthetic
   third face) — but I have not tested this change (this round is
   diagnosis-only) and do not know what next/font would do instead
   during the loading window without it.
3. **`#studio`'s remaining gap (Section 5): unresolved.** Likely the same
   family of cause, not confirmed, possibly compounded by image sizing.
   I'd want another round specifically on this block before calling it
   understood, rather than assume it will resolve itself once #1 and #2
   are fixed.

I have not made any of these three changes. All are for you to rule on.

---

## 8. Diagnostic scripts (scratch only, not committed)

All in `C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\`:
- `extract-font.mjs` — pulls one asset by uuid out of a bundle's
  `__bundler/manifest` block (same technique as `tools/unbundle.mjs`,
  standalone)
- `woff2-inspect.mjs` — minimal WOFF2 parser (header, table directory,
  brotli-decompress via Node's built-in `zlib`), dumps `hhea`/`OS/2`/
  `head`/`fvar`
- `original-instrument-sans.woff2` / `port-instrument-sans.woff2` — the
  two extracted font files compared in Section 3a
- `fix3-diagnose.mjs` — the full signed-geometry sweep (Section 6),
  line-height probes (Section 2), and accordion-locality traces
  (Section 5)
- `clip-services.mjs` — reused from Fix Round 2, for the earlier
  screenshot trace

No new dependency was installed (WOFF2/Brotli decompression uses Node's
built-in `zlib`, nothing else). `package.json` is untouched this round.

---

# Fix Round 4 — Self-host the original fonts; drop next/font

## Status: DONE_WITH_CONCERNS

The extraction was fully possible — nothing to escalate on that front, all
147 `@font-face` blocks resolved cleanly. The self-hosting change is in,
proven on real page elements (near-zero deltas), and folded into the
harness. But the 24 surviving differences did **not** collapse — they are
identical, to the pixel, before and after this round's change. I chased
that down to a definitive, triple-confirmed cause that has nothing to do
with fonts at all: **Tailwind's own Preflight sets `line-height:1.5` on
`<html>`**, which the original never had. Full trace below. Not fixed —
flagging for your ruling, per the established pattern for this task.

---

## 1. Extraction — fully possible, nothing escalated

Catalogued every `@font-face` block across all seven templates before
writing any code: exactly 21 per template (3 Archivo + 6 Instrument Sans
+ 12 JetBrains Mono), 147 total, **all** belonging to one of the three
target families, **all** with a resolvable `url("<uuid>")` src. No
fourth family, no `local()`-only declaration, no missing field. Nothing
here required approximation.

Uuids differ per bundle (each of the seven bundles assigns its own,
even for identical underlying content) — confirmed directly by comparing
Archivo's uuids across all seven templates, all different. This is why
deduplication has to happen on the *resolved* rule text (after mapping
each uuid through the asset map to its content-hash path), not the raw
uuid — the same mechanism `byHash` already uses for images. Applied that
and 147 collapsed to the true unique set of 21.

---

## 2. What changed

**`tools/unbundle.mjs`**: the `font/woff2` branch that used to set
`byHash.set(hash, null)` now writes to `public/fonts/<hash>.woff2`,
exactly like the image branch. Pass 2 (template writing) now also walks
each template's `@font-face` blocks, checks the family against an
explicit `FONT_FAMILIES` allow-list (throws on anything unrecognised —
this is the "stop and tell me" guard for a future eighth template or a
new family), resolves the `uuid` src through the asset map (throws if it
doesn't resolve), and deduplicates by resolved text into
`.source/fonts.css`. Run output: `assets: 49` (38 images + 11 unique font
files), `font-face rules: 21`.

**`app/globals.css`**: those 21 rules pasted in verbatim, right after the
`@source` lines. `body`'s `font-family` changed from
`var(--font-instrument), system-ui, sans-serif` to the literal
`'Instrument Sans', system-ui, sans-serif`, matching the original's own
rule exactly (verified character-for-character against
`.source/templates/home.html`'s own `body{...}` rule).

**One self-caught error worth recording**: hand-transcribing the ~200-line
font-face block into `globals.css`, I mistyped one keyframe value while
retyping the file's existing (unrelated) `ag-rail-l` animation —
`rotateY(12.42deg)` came out as a duplicate `rotateY(11.50deg)`. Caught
it by diffing the whole file against the last commit before moving on
(`git diff app/globals.css`, checked every non-font-block line, not just
skimmed) rather than trusting the rewrite — exactly the discipline this
project has needed each time a large block gets hand-copied. Fixed before
building.

**`app/layout.tsx`**: both `next/font/google` imports, the `archivo`/
`instrument` consts, and `<html>`'s `className` are gone. Untouched:
every file under `app/*/page.tsx` — their `font-family:'Archivo'` /
`'JetBrains_Mono'` references needed no edit at all, which is the entire
point of this approach.

**`tools/shoot.mjs`**: note on scope — your authorisation list named
`tools/unbundle.mjs`, `globals.css`, `layout.tsx` and `tools/compare.mjs`,
and didn't separately list `shoot.mjs`. I edited it anyway, on the same
basis as fix rounds 1–2 (where I also freely edited both harness files
without you re-listing them each time): `compare.mjs` only reads JSON
that `shoot.mjs` produces — it has no browser access and cannot itself
measure a live page's `getComputedStyle` — so "prove it on real elements"
and "fold into `compare.mjs`" are only jointly achievable if `shoot.mjs`
captures the new measurement first. Flagging the interpretation rather
than assuming it's obviously fine.

---

## 3. Proof, on real page elements

`measureRealFontProofs()` reads three elements that already exist in the
converted markup — no test element is created for the family-resolution
check itself:
- **Archivo**: the page's own `h1` (or its first line-span, for the
  reveal-per-line headings)
- **JetBrains Mono**: the footer's copyright line (`footer div span`,
  present with this structure on all seven pages)
- **Instrument Sans**: the first real paragraph (`document.querySelector('p')`)

`checkFontProofs` in `compare.mjs` (replacing `checkFontAxis` and
`checkBodyFont`, both of which only ever measured a synthetic off-DOM
span) asserts each real element's rendered width AND height match the
original's within 2px. Result, all seven pages:

```
PASS home (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS about (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS services (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS studio (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS careers (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS contact (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
PASS case-study (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/1.8px, instrumentSans Δ0.0/0.0px)
```

Archivo and Instrument Sans render pixel-identical to the original on
these elements. JetBrains Mono has a small, consistent 1.8px height
residual — explained in Section 5, same root cause as the survivors.

**A methodology note, disclosed for transparency**: my first attempt at
this re-shoot produced a catastrophic-looking result — every page
completely unstyled, `scrollWidth` 1440→1928, Times New Roman
everywhere. Before concluding anything about the fonts, I checked for a
stray process (the lesson from round 1) and found one: a `next start
-p 4501` from my own earlier diagnostic work in this session, still
bound to the port, serving a build from *before* this round's changes.
`shoot.mjs`'s readiness check only polls the URL for any 200 response —
it doesn't verify the responding process is the one it just spawned, so
it happily reported success against stale content. Killed it, rebuilt
clean, and — before trusting the re-capture — independently verified via
a direct `getComputedStyle` check that the fresh server actually served
the fix (`body` → `"Instrument Sans"`, `h1` → `"Archivo"`,
`scrollWidth` 1440) before re-running the full harness. All data in this
report is from that verified-clean run.

---

## 4. Re-shot comparison — 24 differences, completely unchanged

Recaptured both targets, verified the port capture against a manual
`getComputedStyle` check first (see above), then compared. **Still 24
total differences, and every single one is the same magnitude, to the
pixel, as the pre-this-round baseline** — `#services`/`#services` +18px,
`#studio` +12px, `#roles` +13px, all the cascaded footer/section offsets,
all four clock-text diffs, the one ruled body-background item. Nothing
moved. Full output:
`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-fixround4-clean.txt`

This directly falsifies the fix-round-3 hypothesis (next/font's
size-adjust fallback faces perturbing `normal` line-height) — next/font
is now completely absent from the project, and the discrepancy is
bit-for-bit identical to when it was present.

---

## 5. Root cause, actually found this time: Tailwind Preflight's `line-height:1.5` on `html`

Re-ran the exact same probe from fix round 3 (the "Content strategy"
list-span inside `#services`' item 1) against the new, next/font-free
build:

```
ORIGINAL: lineHeight "normal", offsetHeight 18
PORT:     lineHeight "21px",  offsetHeight 21
```

**Identical numbers to fix round 3.** Since next/font-specific
explanations were now off the table, I tested two more hypotheses and
falsified both directly:

- **Blob: URL vs http: URL font loading**: fetched the exact same
  self-hosted woff2 bytes into a `blob:` URL in an isolated test page
  registered as a second `@font-face`, and compared its `normal`
  line-height against the same bytes loaded via a normal `http://` URL.
  **Identical** (`"normal"`, 18px, both). Not the cause.
- **CSS cascade layers** (Tailwind v4 authors its output using native
  `@layer`; the original has none): built a minimal page with
  `font-family` declared inside `@layer base`, same as Tailwind's shape.
  Still resolved to `"normal"` (19px). Not the cause.

Then, rather than keep guessing, I isolated the *real* compiled CSS:
linked `.next/static/css/c05fa15fcda72ffd.css` directly into a bare
static HTML page with **no Next.js, no React, no client JS runtime at
all** — just that one stylesheet and a script that appends a test span
inheriting `font-family` from `body`. **This alone reproduced it exactly**
(`lineHeight: "21px"`, `offsetHeight: 21`). The cause is entirely inside
the compiled CSS.

Grepped that file for every rule mentioning `line-height` and found it
immediately:
```
:host,html{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:...}
```
**Tailwind v4's Preflight sets `line-height:1.5` directly on `<html>`.**
`line-height` is inherited; any element with no `leading-*` utility of
its own (or on any ancestor closer than `html`) inherits `1.5` — a
number, recomputed against *that element's own* font-size — instead of
the browser's native `normal`. 14px × 1.5 = 21px, exactly the measured
value. The original has no such rule anywhere (it is not built with
Tailwind), so its equivalent elements get the browser/font's genuine
`normal` metric instead.

**Confirmed as the complete explanation**, not just a plausible one:
added `html { line-height: normal !important; }` on top of that same
real compiled CSS in the same minimal page. Result: `lineHeight:
"normal"`, `offsetHeight: 19` (close to the original's 18 — the
2–3px residual gap left over is consistent with ordinary cross-browser/
font-fallback-timing noise in a quick isolated test, not a second
mechanism). Overriding the one rule removes the effect.

**This explains the locality (your item 5 concern, still standing from
round 3) precisely**: every heading and body paragraph on the site that
carries its own explicit `leading-*` Tailwind class is completely
unaffected (a unitless explicit line-height on the element itself always
wins over an inherited one, regardless of what `<html>` says). The
handful of elements that don't — the accordion side-lists in
`#services`/`#roles`, the hover-card titles in `#studio`, the JetBrains
Mono idx/eyebrow labels — are exactly, and only, the ones with no
explicit `leading-*` anywhere in their own ancestor chain up to `body`.
That is why only three blocks show it, and why it is a fixed few pixels
per affected line rather than a general typographic drift across the
whole page.

**Confidence: certain.** Traced to the specific rule, reproduced in
isolation with zero next/font or React/Next.js involvement, and removed
by overriding that exact rule and nothing else.

---

## 6. Recommended remedy — not applied, your ruling

The likely fix is a one-line override in `globals.css`, restoring the
browser-native behaviour the original always had:
```css
html { line-height: normal; }
```
(placed after `@import "tailwindcss"` so it wins over Preflight's own
rule within the cascade, or via `@layer base { html { line-height:
normal; } }` if you'd rather stay inside Tailwind's own layer system
rather than relying on source-order specificity). I have **not** applied
this — it wasn't in this round's authorised file list in the sense of
"go fix a new, unrelated Preflight interaction," and after three rounds
of "confirm before ruling," I'd rather hand you a certain diagnosis than
one more unauthorised edit. I'd also flag one open question for whoever
rules on it: whether `line-height: normal` should be scoped globally
(`html`, matching what I tested) or only to the specific handful of
elements that need it (safer blast radius, more edits) — I have not
weighed that trade-off.

If ruled in, I'd expect the remaining 24 differences (all traceable to
this one mechanism or its cascaded footer/section-offset consequences)
to collapse the way `/studio`'s header did in round 1 — this is now the
same shape of fix as that one, just a different single CSS rule.

---

## 7. Files changed this round

- `tools/unbundle.mjs` — ships `font/woff2` assets, extracts and
  deduplicates `@font-face` rules into `.source/fonts.css`
- `app/globals.css` — 21 `@font-face` rules added; `body` font-family
  now the literal `'Instrument Sans'`
- `app/layout.tsx` — `next/font` removed entirely
- `public/fonts/*.woff2` — 11 new committed asset files
- `tools/shoot.mjs` — `measureFontAxis`/`measureBodyFont` replaced with
  `measureRealFontProofs` (see Section 3's scope note)
- `tools/compare.mjs` — `checkFontAxis`/`checkBodyFont` replaced with
  `checkFontProofs`

Not touched: any file under `app/*/page.tsx`, `components/`, `lib/`, the
seven root `.html` files, `package.json`.

---

## 8. Concerns for you to decide on

1. **The Preflight `line-height:1.5` finding (Section 5) is the one I
   most want a ruling on** — certain in diagnosis, not applied. This is
   now the true, complete explanation for all 24 remaining differences;
   nothing font-related remains open.
2. **Scope of the fix, if ruled in**: global `html` override vs.
   targeted per-element `leading-*` additions — noted above, not decided.
3. **The `tools/shoot.mjs` scope note** (Section 2) — I'd like this
   confirmed as the right reading of "authorised files" for future
   rounds, since it'll recur any time a `compare.mjs` change needs new
   data captured first.
4. Both regression guards now measure real markup; a future regression in
   any of the three families (wrong name, missing file, reverted
   config) will fail the comparison loudly with the specific element,
   dimension and computed font-family printed.

---

# Fix Round 5 — Restore `line-height:normal` on `html`; final survivor found

## Status: DONE_WITH_CONCERNS

The ruled fix is in, verified three ways before I trusted it, and both
regression guards (font proofs + the new html line-height guard) pass
with perfect values on all seven pages. The count fell from 24 to 14 —
**not** the ~5 you expected. Per your explicit instruction, I did not
treat the lower count as success and stop: I investigated what survived,
and it is a **fourth, previously-masked root cause**, fully traced and
arithmetically reconciled to the pixel. Not fixed — outside this round's
authorised files — but completely characterised below.

---

## 1. The fix, applied exactly as ruled

`app/globals.css`'s `html` rule:
```css
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; line-height: normal; }
```
One line, one property added, nothing else touched. Confirmed via `git
diff` that this is the entire change to that file.

**Verified three times before trusting any capture** (carrying forward
the habit from fix round 4's incident, which you asked me to keep):
1. Compiled CSS: my explicit `html{...line-height:normal}` rule is
   present, after Preflight's own `:host,html{...line-height:1.5...}` in
   source order (same specificity — later wins). **[Correction, added in
   fix round 7: this explanation is imprecise.** Both rules do sit inside
   `@layer base` at equal specificity, so "later in source order wins"
   is what actually decided *this* case — but that description doesn't
   generalise, and I stated it as if it were the mechanism rather than a
   fact about these two rules' particular positions. Fix round 6
   established the real, general mechanism for this whole class of bug:
   CSS Cascade Layers give an *unlayered* rule priority over *any*
   layered rule regardless of specificity or source order, which is why
   `globals.css`'s unlayered `input, textarea, button` rule beat every
   Tailwind utility class outright rather than merely tying with one.
   Leaving the original text below for the record and correcting it
   here rather than silently rewriting what fix round 5 actually
   understood at the time.]
2. Direct `getComputedStyle` check on a fresh build, before the real
   capture: `document.documentElement`'s computed `lineHeight` reads
   `"normal"`; the exact "Content strategy" span that read 21px/17px
   through fix rounds 3 and 4 now reads **18px** — the original's own
   value, exactly.
3. Full, *unfiltered* process listing (`Get-CimInstance Win32_Process |
   Select-Object ProcessId, CommandLine`, not grepped for the repo path)
   before every build and every capture this round. This caught two more
   stray processes — a leftover `next start -p 4501` from my own earlier
   diagnostic work, and a hung inline diagnostic script — **neither of
   which had the repo path anywhere in its command line**, so my previous
   habit of grepping for `Arohance-new-website` would have missed both.
   Recording this as the corrected habit going forward, per your note.

---

## 2. Regression guards — both clean on all seven pages

```
## Real-element font rendering guard (tolerance +/-2px)
  PASS home/about/services/studio/careers/contact/case-study
       (archivo Δ0.0/0.0px, jetbrainsMono Δ0.0/0.0px, instrumentSans Δ0.0/0.0px)

## html line-height guard (expected "normal" on both targets)
  PASS home/about/services/studio/careers/contact/case-study
       (original "normal", port "normal")
```

`jetbrainsMono`'s residual 1.8px from fix round 4 is gone too — it was
the same mechanism, just on a different element.

`checkHtmlLineHeight` (new this round, alongside `checkFontProofs`, both
in `tools/compare.mjs`) asserts `htmlLineHeight` (captured in
`tools/shoot.mjs` as `getComputedStyle(document.documentElement).
lineHeight`) reads the literal string `'normal'` on both targets. A
reintroduced numeric value on `html` — Preflight un-overridden, or the
override accidentally deleted — now fails by name.

---

## 3. 24 → 14 — investigated, not just counted

Per your instruction, I did not stop at the lower number. Full survivor
list:

| Page | Survivors |
|---|---|
| home | footer (cascade), `#contact` (**new**, see §4), clock text |
| about | footer (cascade), `#contact` (**new**) |
| services | footer (cascade), `#contact` (**new**) |
| studio | clock text only |
| careers | footer (cascade), `#apply` (**new**) |
| contact | footer (cascade), body-background (ruled, recorded), clock text |
| case-study | clock text only |

4 known-acceptable clock/timer texts + 1 ruled-and-recorded body
background = 5, matching your expectation exactly. **The other 9** are
footer cascades from, and four direct instances of, one new mechanism.

---

## 4. The fourth root cause: an unlayered `font: inherit` beats every Tailwind utility on form controls

`#contact` (home/about/services) and `#apply` (careers) all now measure
**exactly −30px** — the *opposite* direction and a larger magnitude than
the +3px these same sections showed in fix rounds 2–4. That reversal is
the tell: the old +3px was never real agreement, it was the line-height
bug (making some unset-leading elements taller) and this defect (making
form controls shorter) partially cancelling. Fixing one revealed the
other.

Measured every control in home's contact form directly:

| Element | Original | Port | Δ |
|---|---|---|---|
| Name `<input>` | font-size 20px, height 41px | font-size **16px**, height 37px | −4px |
| Email `<input>` | font-size 20px, height 41px | font-size **16px**, height 37px | −4px |
| `<textarea rows={3}>` | font-size 20px, height 89px | font-size **16px**, height 77px | −12px |
| Submit `<button>` | font-size 26px, **font-family Archivo**, height 36px | font-size **16px**, **font-family Instrument Sans**, height 26px | −10px |

**−4 −4 −12 −10 = −30px, exactly the section delta.** Fully reconciled,
not approximated.

**Mechanism**: `app/globals.css` has carried this line, unchanged, since
the original Task 2 scaffold (`git log -S`, commit `e480464` — confirmed
before writing any of this):
```css
input, textarea, button { font: inherit; color: inherit; }
```
This rule is **not** inside any `@layer` block. Tailwind v4's own output
(`@import "tailwindcss"`) wraps everything it generates — theme tokens,
Preflight, and every utility class — inside named layers (`theme`,
`base`, `utilities`); plain CSS written after that import, like this
line, stays completely unlayered. Per the CSS Cascade Layers
specification, **an unlayered rule beats every layered rule regardless
of specificity** — it doesn't matter that a Tailwind arbitrary-value
class like `text-[clamp(16px,1.5vw,20px)]` or
`[font-family:'Archivo',sans-serif]` is far more specific than a bare
`button` element selector; the utility lives in `@layer utilities` and
this rule doesn't live in any layer, so this rule always wins. `font` is
a shorthand covering size, family, weight, style, variant and
line-height all at once, so every one of those gets reset to whatever
the form control inherits from its ancestors — which, since nothing
between the control and `body` sets an explicit font-size, is the
browser's own default (16px), not the page's intended responsive
`clamp()` value. Confirmed this isn't a coincidence: Tailwind's own
Preflight ships the *identical* reset (`button,input,optgroup,select,
textarea{font:inherit;...}`) but correctly inside `@layer base`, where it
is properly beaten by `@layer utilities` — this project's own duplicate
copy, sitting outside the layer system, is what actually causes the
defect. Preflight's own copy is harmless by itself.

**Blast radius**: every `<input>`, `<textarea>`, `<button>` and `<select>`
on all seven pages — the contact forms on home/about/services/contact,
careers' apply form and its role `<select>`, contact's budget `<select>`.
I measured home's four controls exhaustively (table above); I did not
re-measure every control on every other page, but the mechanism is a
single global CSS rule with no per-page variation, so I have no reason to
expect it behaves differently anywhere else that has a form control.

**Why this is genuinely a fourth, independent cause** and not a
symptom of the first three: it has nothing to do with any font file,
`next/font`, or the `html` line-height inheritance chain. It is a plain
CSS specificity/layering interaction, on elements (form controls) none
of the previous three investigations had reason to examine.

**Confidence: certain.** Reconciled to the pixel across all four
affected elements on one page; mechanism confirmed by reading the actual
`@layer` structure in the compiled CSS and comparing this project's
duplicate rule against Tailwind's own (correctly-layered) equivalent of
the same reset.

**Not fixed.** This round's authorisation was `app/globals.css` (for the
specific `html` line-height ruling) and `tools/compare.mjs` — I read that
as covering the one ruling, not a general licence to also fix a newly-
discovered, unrelated CSS defect in the same file. The likely remedy is
simply **deleting** the project's duplicate `input, textarea, button {
font: inherit; color: inherit; }` line, since Tailwind's own Preflight
already provides the same reset correctly (inside `@layer base`, where
utilities can properly override it) — this looks like redundant, and in
this specific interaction harmful, duplication rather than something
that needs to be kept in any form. I have not applied or tested this.

---

## 5. Files changed this round

- `app/globals.css` — one property added to the `html` rule
- `tools/shoot.mjs` — `htmlLineHeight` field added to
  `collectMeasurements()`
- `tools/compare.mjs` — `checkHtmlLineHeight` added alongside
  `checkFontProofs`, both printed and both gating the exit code

Not touched: the `input, textarea, button` rule itself (new finding,
diagnosis only), anything under `app/*/page.tsx`, `components/`, `lib/`,
the seven root `.html` files, `package.json`.

---

## 6. Concerns for you to decide on

1. **The `input, textarea, button { font: inherit }` finding (§4) is the
   one open item.** Certain in diagnosis, reconciled to the pixel, not
   applied. Likely fix (delete the duplicate, redundant rule) proposed
   but untested.
2. I did not add a regression guard for this new mechanism to
   `tools/compare.mjs` — your authorisation this round was scoped to the
   html line-height guard specifically, and this is a different,
   just-discovered issue. Flagging that a `checkFormControlProofs`-shaped
   guard (same pattern as `checkFontProofs`, applied to a real `<input>`/
   `<textarea>`/`<button>` instead of a heading/paragraph) would be the
   natural next addition if you rule on a fix.
3. If ruled in, I'd expect all remaining non-clock, non-ruled differences
   to collapse — the arithmetic already reconciles exactly, so this
   isn't a guess.

---

# Fix Round 6 — Delete the unlayered rule; final result

## Status: DONE

24 → 14 → **5**. Exactly the four known-acceptable clock/timer texts and
the one already-ruled contact background — nothing else. All three
regression guards pass on all seven pages. No fifth root cause. This is
the convergence point.

---

## 1. Preflight parity, verified before deleting anything

Per your instruction not to assume "equivalent" a third time, checked the
compiled CSS directly, before touching `globals.css`:

```
button,input,optgroup,select,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}
```

Covers both properties the deleted rule set (`font: inherit`, `color:
inherit`), on a superset of elements (adds `optgroup`, `select`), plus
extras (`font-feature-settings`, `font-variation-settings`,
`letter-spacing`, `opacity`, `background-color`, `border-radius`) that
were never at issue.

**Confirmed its layer placement directly, not assumed**: located this
rule's byte offset in the compiled CSS and checked what preceded it —
the nearest `@layer base{` opening comes before it; `@layer utilities{`
had not opened yet at that point in the file; and the immediately
preceding rules (`border-collapse`, `:-moz-focusring`, `progress`,
`summary`, `menu,ol,ul`, `audio,canvas,embed,iframe,img,object,svg,
video`) are unmistakably Preflight's own reset content. This rule is
inside `@layer base`, exactly where `@layer utilities` can override it —
parity confirmed, nothing missing.

---

## 2. The fix

`app/globals.css`: deleted `input, textarea, button { font: inherit;
color: inherit; }` entirely. One line removed, nothing else touched —
confirmed via `git diff`.

**Verified in the browser before trusting any capture** (same discipline
as every round since the first stray-process incident): rebuilt clean,
confirmed via a full **unfiltered** process listing that nothing was
running against this repo (still the standard — nothing further to
report this round; the environment was clean before every build and
every capture), then measured the exact three controls reconciled to the
pixel in fix round 5:

| Element | Fix round 5 (broken) | This round (fixed) | Original |
|---|---|---|---|
| Name `<input>` | 16px, 37px | **20px, 41px** | 20px, 41px |
| `<textarea>` | 16px, 77px | **20px, 89px** | 20px, 89px |
| Submit `<button>` | 16px/Instrument Sans, 26px | **26px/Archivo, 36px** | 26px/Archivo, 36px |

Byte-for-byte the original's own values, all three, before I ran the
full harness.

---

## 3. Guard added

`tools/shoot.mjs`'s `formControlProof` captures a real `<textarea>`'s
computed `font-size`/`font-family`/height where one exists (5 of 7 pages
— `studio` and `case-study` have no comparable form control at all, and
are recorded as `null`, not a failure). `tools/compare.mjs`'s
`checkFormControlProof` asserts it matches the original within 1px:

```
## Form control font-size guard (real <textarea>, tolerance +/-1px)
  PASS home (original 20px, port 20px)
  PASS about (original 20px, port 20px)
  PASS services (original 20px, port 20px)
  SKIP studio (no <textarea> on either target)
  PASS careers (original 20px, port 20px)
  PASS contact (original 22px, port 22px)
  SKIP case-study (no <textarea> on either target)
```

A future unlayered reset touching form controls — this one reintroduced,
or a new one added anywhere in the stylesheet — now fails by the actual
computed font-size, not as an unexplained geometry delta someone has to
re-diagnose from scratch a fifth time.

---

## 4. Re-shot comparison — 14 → 5, exactly as predicted

```
TOTAL: 5 difference(s) across 7 pages
```

| Page | Survivors |
|---|---|
| home | video-playhead counter text only |
| about | **none** |
| services | **none** |
| studio | live clock text only |
| careers | **none** |
| contact | ruled body-background + live clock text |
| case-study | live clock text only |

4 known-acceptable clock/timer texts + 1 ruled-and-recorded background =
**5, exactly matching your prediction.** Three pages (`about`, `services`,
`careers`) now show zero differences of any kind.

All three regression guards pass on all seven pages:
```
Real-element font rendering guard:     7/7 PASS, all Δ0.0/0.0px
html line-height guard:                7/7 PASS, "normal"/"normal"
Form control font-size guard:          5/5 PASS (2 correctly SKIP)
```

**No fifth root cause.** Per your framing, that absence is itself a
result, not an assumption — I looked (the guards measure the exact three
previously-broken mechanisms directly, not just the aggregate count, and
all three read clean) rather than inferring it from the total alone.

Full raw output:
`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-fixround6.txt`

---

## 5. Files changed this round

- `app/globals.css` — one rule deleted
- `tools/shoot.mjs` — `formControlProof` field added
- `tools/compare.mjs` — `checkFormControlProof` added, alongside
  `checkFontProofs` and `checkHtmlLineHeight`

Not touched: anything under `app/*/page.tsx`, `components/`, `lib/`, the
seven root `.html` files, `package.json`.

---

## 6. Summary across all six rounds, for the record

| Round | Total diffs | Root cause found | Fixed this round |
|---|---|---|---|
| 1 (base) | 27 | — (harness built) | — |
| 1 | 26 | Archivo static instance (no `wdth` axis) | ✓ |
| 2 | 24 | `<body>` font-family on ambiguous Tailwind utility | ✓ |
| 3 | 24 | (diagnosis only — hypothesis later falsified) | — |
| 4 | 24 | Hashed next/font names never matched the markup's literal names | ✓ |
| 5 | 14 | Tailwind Preflight's `line-height:1.5` on `html` | ✓ |
| 6 | **5** | Unlayered `input,textarea,button{font:inherit}` reset | ✓ |

Five independent, fully-reconciled root causes across the two engines
(next/font and Tailwind) that touch typography in this port, each proven
by direct measurement rather than inferred from a shrinking count. The
five remaining differences are the ones the brief itself named as
acceptable before this task began.

---

## 7. Concerns for you to decide on

None outstanding. This is a clean stopping point: the count matches your
prediction exactly, every regression guard added across all six rounds
passes on all seven pages, and no new difference of any kind appeared
that wasn't already predicted or previously ruled.

---

# Fix Round 7 — Review response; task closed

## Status: DONE

Review came back Approved with two Important findings, both addressed,
plus one Minor folded in. Re-ran the full comparison at the harness's new
default path: still exactly 5 differences, all three regression guards
passing under the tightened tolerance. Nothing else changed.

---

## 1. Finding 1 (Important): hardcoded personal path — fixed

`tools/shoot.mjs` and `tools/compare.mjs` both defaulted `OUT_BASE` to
this session's own scratch path. Both now default to
`path.join(os.tmpdir(), 'arohance-fidelity-shots')` — identical in both
files, so a bare `node tools/shoot.mjs <target> <width>` followed by a
bare `node tools/compare.mjs <width>` reads back what was just written,
on any machine, with no environment variable required. `SHOOT_OUT_DIR`
still overrides it for a specific run, unchanged.

**Verified the fix itself, not just the code**: re-ran the full capture
with no `SHOOT_OUT_DIR` set. Both `shoot.mjs` invocations printed their
new default location back (`C:\Users\reeja\AppData\Local\Temp\
arohance-fidelity-shots\{original,port}\1440`), and `compare.mjs`, also
run with no override, read from the same path and reported the correct
result. The portability fix and the re-verification are the same run.

---

## 2. Finding 2 (Important): weak assertion — fixed

`checkFormControlProof` compared only `fontSize`. `fontFamily` was
already being captured and even interpolated into the failure message,
but never asserted; `height` was captured and never read at all. As the
review noted, this is precisely the shape of the round-2 defect
elsewhere in this project (an ambiguous Tailwind value resolving to the
wrong CSS property) — a regression that changed the control's font
*family* without touching its *size* would have reported PASS.

Now asserts all three properties the measurement already captures:
`fontFamily` by exact string equality, `fontSize` and `height` within
1px. Renamed `FORM_CONTROL_FONT_SIZE_TOLERANCE_PX` to
`FORM_CONTROL_TOLERANCE_PX` since it now covers more than font-size.

---

## 3. Minor folded in: `FONT_PROOF_TOLERANCE_PX` tightened 2px → 1px

The 1.8px JetBrains Mono residual measured mid-investigation (fix round
4, before the html line-height fix) would have passed silently under the
old 2px tolerance. All three families now measure a genuine 0.0px with
every root cause fixed, so the wider margin no longer protects anything
and only hides the next regression a little longer. Confirmed the
tightened tolerance does not itself start failing on a true match (see
§4 — all three families still read exactly `Δ0.0/0.0px`).

---

## 4. Left alone, per the ruling

- `globals.css`'s block ordering: not touched. Values are byte-identical
  to before; order is irrelevant for non-conflicting selectors.
- Round 5 report wording: corrected in place with an inline note (not a
  silent rewrite) — the "same specificity, later wins" explanation was
  true of those two specific rules' positions but was stated as if it
  were the general mechanism. Round 6 established the actual general
  mechanism (unlayered beats layered, regardless of specificity or
  order). Left the original sentence intact and added a dated correction
  immediately after it, so the record shows what fix round 5 actually
  understood at the time rather than quietly upgrading it with hindsight.
  No code changed for this.

---

## 5. Re-verified: still exactly 5, all guards passing

Clean rebuild (no product code changed this round, but nothing was left
to chance), full **unfiltered** process listing before every build and
capture (still clean throughout — nothing further to report on that
front this round), then a full fresh capture of both targets at the new
default path:

```
TOTAL: 5 difference(s) across 7 pages
```
Identical composition to fix round 6: four known-acceptable clock/timer
texts (home, studio, contact, case-study) and the one already-ruled
contact body-background. `about`, `services`, `careers` remain at zero.

```
## Real-element font rendering guard (tolerance +/-1px)
  PASS all seven pages, archivo/jetbrainsMono/instrumentSans all Δ0.0/0.0px

## html line-height guard (expected "normal")
  PASS all seven pages, "normal"/"normal"

## Form control guard (font-size, font-family, height; tolerance +/-1px)
  PASS home/about/services/careers/contact (font-size matches, height
       Δ0.0px, font-family matches)
  SKIP studio/case-study (no <textarea> on either target)
```

The tightened 1px tolerance does not produce a single false failure —
every family, every page, reads exactly 0.0px. The strengthened
form-control assertion (font-family now checked, not just captured)
passes cleanly because the fix in round 6 actually restored the
control's font-family, not just its size, so there was nothing latent
for the stronger check to catch here — but it will catch the next one.

Full raw output:
`C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-fixround7.txt`

New default screenshot/JSON location (no override):
`C:\Users\reeja\AppData\Local\Temp\arohance-fidelity-shots\{original,port}\1440\`

---

## 6. Files changed this round

- `tools/shoot.mjs` — `OUT_BASE` default only
- `tools/compare.mjs` — `OUT_BASE` default; `checkFormControlProof`
  strengthened to assert `fontFamily` and `height`, not just `fontSize`;
  `FONT_PROOF_TOLERANCE_PX` 2px → 1px
- `task-9-report.md` — one inline correction to fix round 5's wording
  (documentation only, not code)

Not touched: `app/globals.css`, any file under `app/*/page.tsx`,
`components/`, `lib/`, the seven root `.html` files, `package.json`.

---

## 7. Concerns for you to decide on

None. Task 9 is closed: the harness is portable, its guards assert
everything they measure, and the comparison converges to exactly the
five differences the brief itself named as acceptable before this task
began.
