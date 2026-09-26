# Task 13 Report: Convert Studio, Case Study and Contact

## Summary

The brief was wrong on both headline claims (Ruling 1: nav is not shared with
`nav.ts`; Ruling 3: these pages inline everything, no `initX()` methods to
lift) and I built from the source templates directly rather than the brief.
All three pages are converted, gated clean (`node --test` 50/50, `tsc
--noEmit` clean, `npm run build` succeeds, three.js confirmed absent from all
three route graphs), and committed.

Five new page-specific/shared-across-pair behaviour modules were added
(`shellMinimal`, `navOnDark`, `navPad`, `hoverLift`, `formWorkingDay`);
seven existing shared modules were reused after individually verifying
equivalence against source (`applyTheme`, `reveal`, `parallax`, `cursor`,
`clock`, `form`, and — not applicable here but checked — `nav`/`hovers`/
`shell` were each explicitly rejected as non-equivalent, see below).

## What I implemented

- `lib/behaviors/shellMinimal.ts` — burger/overlay shell without the
  close-on-link-click wiring `shell.ts` has. Used by Studio, Case Study,
  Contact.
- `lib/behaviors/navOnDark.ts` — nav color/padding/logo-height plus live
  `onDark` button recolouring. Used by Studio, Case Study.
- `lib/behaviors/navPad.ts` — nav padding/logo-height only, scroll-only,
  no button/CTA logic. Used by Contact.
- `lib/behaviors/hoverLift.ts` — `[data-hover-group]` image-scale +
  12px title-shift interaction. Used by Studio, Case Study.
- `lib/behaviors/formWorkingDay.ts` — form submit handler with the
  "a working day" message. Used by Contact.
- `lib/behaviors/index.ts` — additive edit, exports the five modules above.
  Nothing else in the file was touched.
- `app/studio/{page.tsx,modules.ts,studio-runtime.tsx}`
- `app/case-study/{page.tsx,modules.ts,case-study-runtime.tsx}`
- `app/contact/{page.tsx,modules.ts,contact-runtime.tsx}`

`node tools/unbundle.mjs` and `node tools/convert.mjs {studio,case-study,contact}`
were run first (regenerating `.source/`); the converter's completeness guard
did not fire for any of the three — no unknown constructs, no unmapped
links/assets.

## Per-page block inventory

I read each page's own `componentDidMount` directly from
`.source/templates/<slug>.html` (not from the brief, which was wrong about
all three) and identified every logical block. Studio and Case Study inline
everything except `applyTheme`/`shell` (kept as separate methods, same as
every other page); Contact does the same. None of the three has a single
`initX()` method beyond those two.

A direct `diff` of Studio's whole `componentDidMount`+`shell()` text
(`.source/templates/studio.html:524-667`) against Case Study's
(`case-study.html:451-605`) came back **byte-identical except for one
addition**: Case Study's block ends with a `data-ag-form` submit-handler
block Studio's does not have. Every other block — reveal, the fused
parallax+nav handler (including the `onDark` computation), the hover-group
loop, the cursor block, the clock block, and all of `shell()` — is
character-for-character the same between the two pages.

### Studio (`.source/templates/studio.html:524-667`)

| # | Block (source lines) | Mapped to | Evidence |
|---|---|---|---|
| 1 | `this.applyTheme()` | `applyTheme` (reused) | Identical one-liner to `theme.ts`; frozen accent `#F2600C`. |
| 2 | `this.shell()` (627-667) | **`shellMinimal`** (new) | Byte-identical to Case Study's and Contact's own `shell()`. Differs from `shell.ts` (home-derived): no `ov.querySelectorAll('a')` close-on-click wiring. Grepped all 3 templates for that pattern — zero hits, vs. confirmed hits in home/about/services/careers. |
| 3 | reveal setup + IntersectionObserver (533-550) | `reveal` (reused) | Same rootMargin (`0px 0px -12% 0px`), threshold (0.08), 1600ms guard; frozen `P={y:46,d:1100,a:96}` matches `MOTION` exactly. |
| 4a | `px.forEach(...)` parallax half of fused frame() (556-564) | `parallax` (reused) | Identical transform formula `(p*amp*f).toFixed(2)`, same 0.3 fallback, same `-200`/`vh+200` clipping. |
| 4b | `if(nav){...}` nav half of same fused frame() (565-578) | **`navOnDark`** (new) | Reads live `darks`/`onDark` (`nav.getBoundingClientRect().height*0.6` probe); `nav.ts` hardcodes resting colour and drops this as dead code (correct only for home). Byte-identical to Case Study's own nav block. |
| 5 | `[data-hover-group]` loop (586-594) | **`hoverLift`** (new) | 12px title shift vs. `hovers.ts`'s verified 10px (home/about/services all grepped: 10px). Also plain `img.style.transition` assignment vs. `hovers.ts`'s append-with-leading-comma, and `'none'` vs `'translate3d(0,0,0)'` on leave (render-equivalent, recorded for completeness). |
| 6 | custom-cursor block (596-613) | `cursor` (reused) | Same guard, same 11px/84px dot, same enter/leave label logic. Textual diffs from `cursor.ts` (added `data-ag-cursor` marker, redundant initial `-50%,-50%` transform, implicit vs explicit `ease`) have no observable effect — verified, not assumed. |
| 7 | `[data-ag-clock]` interval (615-621) | `clock` (reused) | Identical `Intl.DateTimeFormat` options and `'IST'` suffix. |

No `data-ag-form` anywhere in `studio.html` — zero hits, neither call site nor
markup. `form`/`formWorkingDay` is not in Studio's list at all.

Also confirmed entirely absent (zero grep hits for the method name and its
target attribute): `initServices`/`data-svc`, `initMagnet`/`data-ag-magnet`,
`initEther`/`data-ag-ether`, `initStroke`/`data-ag-stroke`,
`initReel`/`data-vt-`, `initTrail`/`data-ag-trail`,
`initVideo`/`data-ag-lightbox`, `initFlags`, `FanPointer`/`data-ag-fan`,
`initRoles`/`data-role`.

### Case Study (`.source/templates/case-study.html:451-605`)

Identical block list to Studio, same order, same mappings, plus one more:

| # | Block (source lines) | Mapped to | Evidence |
|---|---|---|---|
| 8 | `[data-ag-form]` submit handler (550-559) | `form` (reused, dormant) | Text is byte-identical to `form.ts` ("Thanks — we reply within a day"). **But Case Study's markup has no `<form data-ag-form>` anywhere** — grepped `case-study.html` for `data-ag-form`: exactly one hit, the JS `querySelector` call itself, zero markup occurrences. So `root.querySelector('[data-ag-form]')` always resolves to `null` and the block never fires. Included anyway per Ruling 2's "derive from what componentDidMount actually calls" — the call site is real and textually matches `form.ts` exactly, and it is provably harmless (`form.ts`'s own `if (!el) return () => {}` guard no-ops it). Flagged here for the reviewer to override if a stricter "only what can possibly run" reading is preferred — omitting it would produce identical runtime behaviour. |

### Contact (`.source/templates/contact.html:424-497`)

| # | Block (source lines) | Mapped to | Evidence |
|---|---|---|---|
| 1 | `this.applyTheme()` | `applyTheme` (reused) | Same as above. |
| 2 | `this.shell()` (502-542) | **`shellMinimal`** (new, shared with Studio/Case Study) | Byte-identical `diff` against Studio's and Case Study's `shell()`. |
| 3 | reveal setup (433-450) | `reveal` (reused) | Frozen `P={y:46,d:1100}` — no `a` field at all (confirms no parallax anywhere on this page). |
| 4 | nav scroll handler (452-465) | **`navPad`** (new) | Padding + logo-height only. No button loop (buttons rest permanently at static classes). No `[data-ag-navcta]` (0 hits, unlike careers.html). Only a `scroll` listener — **no `resize`** (`navCareers.ts` adds both, so it was not reused either). |
| 5 | custom-cursor block (467-477) | `cursor` (reused) | Guard and dot identical to Studio/Case Study. Source's version **omits** the `[data-cursor]` mouseenter/mouseleave loop entirely — but the page also has zero `[data-cursor]` elements (grepped: 0 hits), so `cursor.ts` running that loop over an empty NodeList is provably a no-op, not merely assumed equivalent. |
| 6 | `[data-ag-clock]` interval (479-485) | `clock` (reused) | Identical. |
| 7 | `[data-ag-form]` submit handler (487-496) | **`formWorkingDay`** (new) | Message is "Thanks — we reply within a **working** day" — matches the page's own intro copy ("we'll come back within a working day"). `form.ts` hardcodes "a day" (no "working"), verified correct for Home/About/Services by direct grep. This form **is** wired to real markup (`data-ag-form` count = 2: one in markup, one in JS) — not dormant like Case Study's. |

No `data-parallax` anywhere in `contact.html` (0 hits) and no
`[data-hover-group]` (0 hits) — confirms no `parallax`/`hoverLift`/`hovers`
needed. Same "confirmed entirely absent" census as Studio/Case Study applies
(services/magnet/ether/stroke/reel/trail/video/flags/FanPointer/roles all
zero hits).

## Per-page module lists (module-level constants, order = source call order)

```ts
// app/studio/modules.ts
STUDIO_MODULES = [applyTheme, shellMinimal, reveal, parallax, navOnDark, hoverLift, cursor, clock]

// app/case-study/modules.ts
CASE_STUDY_MODULES = [applyTheme, shellMinimal, reveal, parallax, navOnDark, hoverLift, cursor, clock, form]

// app/contact/modules.ts
CONTACT_MODULES = [applyTheme, shellMinimal, reveal, navPad, cursor, clock, formWorkingDay]
```

Disagreement with the brief: total. The brief said all three pages need
"`SHARED` only" and "no new modules." None of the three lists spreads
`SHARED` (each would incorrectly pull in `nav` and, for Studio, `form` too);
each page's list was built from its own source, and every one needed at
least one new module.

## Fidelity diffs

### Pages: `page.tsx` vs `.source/jsx/<slug>.jsx`

Generated each `page.tsx` from the converter's own output file via a small
script (`fs.readFileSync` + exact-count string replacement that throws on
any mismatch, rather than hand-retyping ~300 lines) so every untouched
character is guaranteed byte-identical; the exact-match requirement means
every image swap was individually confirmed present exactly once (or twice,
for Case Study's two duplicated source files) before being written.

- **Studio**: 33 changed lines (of 296). 4 added import lines, 2 added
  function/return lines, 2 added closing lines, 10 `<img>`→`<Image>` swaps
  (`className` byte-identical on every one, only `width`/`height`/`priority`
  added), 2 lines inserting `<ContactPill />`/`<StudioRuntime />`. Zero other
  differences.
- **Case Study**: 26 changed lines (of 223). Same wrapper (8 lines), 8
  image swaps, 2 mount lines. Zero other differences.
- **Contact**: 11 changed lines (of 195). Same wrapper (8 lines), 1 image
  swap (the logo only — page has no other `<img>`), 2 mount lines. Zero
  other differences.

Full `diff` output for all three was reviewed line-by-line; every changed
line is accounted for above as wrapper, image swap, or mount. No hand-tuned
markup, no className edits.

### Behaviour ports vs source block

These are JS→TS ports (type annotations, `const`/arrow-function typing
added), so a raw line diff is dominated by syntax noise rather than logic
change; I verified each logic statement against source directly rather than
relying on a mechanical diff count. Approximate logic-body sizes:

| Module | Logic lines (TS) | Source block | Source lines |
|---|---|---|---|
| `shellMinimal.ts` | 61 | `studio.html:627-667` (identical in case-study/contact) | 41 |
| `navOnDark.ts` | 39 | `studio.html:565-578` (nav half; identical in case-study) | 14 |
| `navPad.ts` | 22 | `contact.html:452-465` | 14 |
| `hoverLift.ts` | 29 | `studio.html:586-594` (identical in case-study) | 9 |
| `formWorkingDay.ts` | 17 | `contact.html:487-496` | 10 |

Every statement in each new module corresponds 1:1 to a statement in its
source block (querySelector targets, style properties and values, listener
types, numeric constants) — verified individually during construction, not
after the fact. No statement was invented, dropped, or given a different
value than source.

## Reuse judgements — evidence for every shared-module reuse

- **`applyTheme`**: identical one-line body in all three sources
  (`document.documentElement.style.setProperty('--ag-accent', this.props.accentColor || '#F2600C')`)
  vs. `theme.ts`. Frozen prop, exact match.
- **`reveal`**: identical rootMargin/threshold/1600ms-guard/CSS values in
  all three; frozen `P` matches `MOTION.y`/`MOTION.dur` exactly (46/1100).
- **`parallax`** (Studio, Case Study only): identical transform formula,
  identical 0.3 fallback, identical off-screen clipping bounds.
- **`cursor`** (all three): identical guard, dot CSS, 11px/84px sizing,
  enter/leave label behaviour. Contact's own version omits the
  `[data-cursor]` loop, but Contact has zero such elements, so running that
  loop is provably a no-op — checked via grep, not assumed.
- **`clock`** (all three): identical `Intl.DateTimeFormat` options and
  `'IST'` suffix.
- **`form`** (Case Study only): identical message text ("Thanks — we reply
  within a day"); included despite the markup gap noted above.

Rejected reuses (would have silently changed behaviour):

- **`nav.ts`**: would hardcode `#1A1815`/resting colour and drop the live
  `onDark` computation Studio/Case Study genuinely read (Ruling 1). For
  Contact, would add a `resize` listener and a button-recolour loop the
  source never has.
- **`navCareers.ts`**: closest existing minimal-nav module, but still adds
  a `resize` listener and a (null-guarded but pointless) CTA branch Contact's
  source doesn't have.
- **`shell.ts`**: adds close-on-link-click wiring over every anchor in the
  overlay — confirmed absent from all three pages' own `shell()` by grep
  (zero `querySelectorAll('a')` hits, vs. confirmed hits in
  home/about/services/careers). The overlay here does contain real anchors
  (nav links, now `next/link`, plus 3 "Media" links), so this is not
  theoretical: with `shell.ts`, clicking any of them would animate the
  overlay closed immediately; with the real source behaviour, it doesn't
  (only the ✕ button, background click, or Escape close it).
- **`hovers.ts`**: 10px vs. Studio/Case Study's 12px title-shift — a real,
  visible constant difference, confirmed by grepping every template
  (home/about/services all use 10px; only studio/case-study use 12px).

## Nav: is Studio's really byte-identical to Case Study's?

Yes, confirmed by direct `diff` of the raw source (not by inspection alone):
`diff` of the exact nav-recolouring lines
(`studio.html:565-578` vs `case-study.html:492-505`) returns zero
differences. The wider `diff` of each page's entire
`componentDidMount`+`shell()` (144 vs 155 lines) shows exactly one
difference: Case Study's trailing, markup-less `data-ag-form` block. The nav
logic — `stuck`, `probe`, `onDark`, the button-recolour loop, all of it — is
character-for-character the same.

Contact's nav is not part of that pair: it never sets `nav.style.color`,
never touches `<button>`, never computes `onDark`, and attaches only a
`scroll` listener (confirmed by direct reading of `contact.html:452-465`,
separately from the diff above).

## Images converted (measured via `image-size`, not guessed)

| File | Width×Height | Used on | `priority`? |
|---|---|---|---|
| `93c7aab596.png` (logo) | 422×133 | all three | yes, on all three (the logo) |
| `b7afa59dc4.jpg` | 950×535 | Studio (hero), Case Study (detail) | yes on Studio (first large image); no on Case Study |
| `df2ee54140.jpg` | 950×678 | Studio, Case Study (hero + detail) | yes on Case Study (first large image); no elsewhere |
| `3143905490.jpg` | 900×600 | Studio, Case Study | no |
| `ce6c217cd9.jpg` | 900×506 | Case Study (×2) | no |
| `38e05568d7.jpg` | 700×900 | Studio | no |
| `e268c52122.jpg` | 700×900 | Studio | no |
| `70cc6c9b51.jpg` | 700×900 | Studio | no |
| `987a91d473.jpg` | 700×900 | Studio | no |
| `1d4dca23b7.jpg` | 700×900 | Studio | no |
| `4f6262c929.jpg` | 700×900 | Studio | no |

Contact has no body images at all — only the nav logo (confirmed: zero
`<img>` tags anywhere else in `contact.html`/`contact.jsx`). `priority` is
therefore on the logo only for Contact, matching "priority only on the logo
and first large image" (there is no first large image to give it to).

Every `<img>` in all three converted pages was replaced with `next/image`;
`className` is byte-identical on every one (verified by the diffs above).

## `npm run build` route-size table

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      329 B         118 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 326 B         118 kB
├ ○ /careers                               305 B         118 kB
├ ○ /case-study                            317 B         118 kB
├ ○ /contact                               311 B         118 kB
├ ○ /services                              331 B         118 kB
└ ○ /studio                                312 B         118 kB
+ First Load JS shared by all             103 kB
```

All 8 app routes prerendered as static content (○). Studio/Case
Study/Contact (312 B / 317 B / 311 B) sit in the same range as every other
page — no bloat.

**three.js confirmed absent from all three route graphs**, checked two ways,
not just inferred from the module lists:
1. Source: `ether`/`stroke` (the only two behaviours that dynamically
   `import()` `liquid-ether`/`three`) do not appear anywhere in
   `app/{studio,case-study,contact}/modules.ts` except inside doc-comment
   prose explaining their exclusion.
2. Compiled output: `grep -c "liquid-ether\|from\"three\"\|require(\"three\")"`
   against `.next/server/app/{studio,case-study,contact}/page.js` returns
   `0` for all three.

Build warnings: `grep`-filtering the full build output for
`app/studio`, `app/case-study`, `app/contact` returns **zero matches** — no
warnings or errors on any of the three new pages. (The build does show
pre-existing `no-img-element` warnings on `app/about/page.tsx` and
`app/services/page.tsx`, and pre-existing `no-unused-vars`/
`no-unused-expressions` warnings in `lib/behaviors/reel.ts`,
`lib/liquid-ether.ts`, `lib/stroke-text.ts` — all untouched by this task,
confirmed by `git status --porcelain` showing no changes to any of those
files.)

## Gates

- `node --test`: **50/50 pass**, 0 fail (same suite as baseline — these
  tests cover tooling/behaviours, not per-page markup, so an unchanged count
  is expected).
- `npx tsc --noEmit`: **clean**, zero output.
- `npm run build`: **succeeds**, all 8 routes static, zero warnings on the
  three new pages (see above).

## Files changed

```
 M lib/behaviors/index.ts                     (additive only: 5 new imports/exports)
?? lib/behaviors/shellMinimal.ts               (new)
?? lib/behaviors/navOnDark.ts                  (new)
?? lib/behaviors/navPad.ts                     (new)
?? lib/behaviors/hoverLift.ts                  (new)
?? lib/behaviors/formWorkingDay.ts             (new)
?? app/studio/page.tsx
?? app/studio/modules.ts
?? app/studio/studio-runtime.tsx
?? app/case-study/page.tsx
?? app/case-study/modules.ts
?? app/case-study/case-study-runtime.tsx
?? app/contact/page.tsx
?? app/contact/modules.ts
?? app/contact/contact-runtime.tsx
```

No other file touched. `tools/`, `components/`, other pages, and every
pre-existing behaviour module (`nav.ts`, `shell.ts`, `hovers.ts`,
`navCareers.ts`, `form.ts`, etc.) are untouched — confirmed by
`git status --porcelain` before committing.

## Self-review findings

- Fidelity: clean on all three pages — every changed line vs. the
  converter's own output is wrapper, image swap, or mount (see diffs above).
- Nav: Studio's and Case Study's ports are verified byte-identical to their
  own source, including the live `onDark` computation. Contact's is verified
  against its own (different, minimal) source.
- Shell: caught a real discrepancy the brief and Ruling 1 didn't
  specifically flag — `shell.ts`'s close-on-link-click wiring is absent from
  all three of my pages' own `shell()`. This is the same category of bug
  Ruling 1 warns about for nav (inline style beating a hover rule; here it's
  "reused module adds a UX behaviour the source never had"), caught by
  applying the same "verify, don't assume" discipline to `shell` that the
  task explicitly asked me to apply to `nav`.
- Discipline: no shared shell components were introduced; no hand-tuned
  markup (every page-body change is scripted and exact-count-verified, not
  manually retyped); nothing outside the file list above was modified.

## Issues / concerns to flag

1. **Pre-existing bug in Careers, out of my scope, found while verifying
   `form.ts`'s text**: `careers.html`'s own `initForm()` says `'Thanks, we
   reply within a week'`, but `app/careers/modules.ts` composes the shared
   `form.ts`, which hardcodes `'Thanks — we reply within a day'`. Careers'
   shipped page currently shows the wrong confirmation message and wrong
   punctuation. I did not touch Careers, `form.ts`, or `navCareers.ts` — out
   of this task's file list — but flagging it since it's the same class of
   error this task was designed to catch, just one task early.
2. **Case Study's `form` inclusion is a judgement call, not a certainty**:
   I included the shared `form` module in `CASE_STUDY_MODULES` even though
   its target markup doesn't exist (dormant call, explained above). This is
   provably harmless either way — I'm flagging the judgement, not the
   safety.
3. No blockers. No converter failures. No markup that looked wrong (the
   only two pre-existing oddities noticed — the "Next project" link on Case
   Study pointing back to `/case-study` itself, and the social "LinkedIn/
   Instagram/X" menu links pointing at `/contact` — both come from
   `toRoute()` correctly resolving whatever the original template's href
   literally was; not converter bugs, ported verbatim as instructed).

---

## Fix round 1: `form.ts` parameterised, Careers and Contact corrected, Studio re-verified

### What changed

Per the coordinator's ruling: form-submit messages differ in **one string**, not in behaviour, so `lib/behaviors/form.ts` is now a factory rather than three near-duplicate modules.

- `lib/behaviors/form.ts`: now exports `makeForm(message: string): Behavior`, plus `export const form: Behavior = makeForm('Thanks — we reply within a day')` — the same stable reference every page that imports `form` (directly or via `SHARED`) already had, so home/about/services/case-study need zero changes.
- `lib/behaviors/index.ts`: exports `makeForm` alongside `form`; drops the `formWorkingDay` import/export.
- `lib/behaviors/formWorkingDay.ts`: **deleted**.
- `app/careers/modules.ts`: `form` → `makeForm('Thanks, we reply within a week')`. This is the actual fix — Careers was shipping the wrong message.
- `app/contact/modules.ts`: `formWorkingDay` → `makeForm('Thanks — we reply within a working day')`. Same rendered message as before, now via the factory instead of a dedicated module.
- `app/studio/modules.ts`, `app/case-study/modules.ts`: comments clarified only (see below); no code changes.
- `lib/behaviors/form.test.mjs`: new — pins each page's mounted message to its own template's, source-level.

### Per-page message table (verified against each page's own template, this round — not copied from the coordinator's table)

Re-grepped every one of the seven templates directly for its own `textContent = '...'` success-message assignment:

| Page | `.source/templates/<slug>.html` source bytes | Rendered message | Mounted via |
|---|---|---|---|
| home | `'Thanks — we reply within a day'` (line 1429) | Thanks — we reply within a day | `form` (default) |
| about | `'Thanks — we reply within a day'` (line 944) | Thanks — we reply within a day | `form` (default, via `SHARED`) |
| services | `'Thanks — we reply within a day'` (line 1158) | Thanks — we reply within a day | `form` (default, via `SHARED`) |
| careers | `'Thanks, we reply within a week'` (line 737) | Thanks, we reply within a week | `makeForm('Thanks, we reply within a week')` — **was `form`, now fixed** |
| studio | *(no match anywhere in the file)* | *(no form, no message)* | nothing — `form`/`makeForm` absent from `STUDIO_MODULES` |
| case-study | `'Thanks — we reply within a day'` (line 555) | Thanks — we reply within a day | `form` (default) — dormant, no matching markup, kept per prior instruction |
| contact | `'Thanks — we reply within a working day'` (line 492) | Thanks — we reply within a working day | `makeForm('Thanks — we reply within a working day')` — was `formWorkingDay`, same message, now via factory |

Confirms the coordinator's three-message picture exactly (day / week / working day), plus studio's genuine absence of a fourth.

The source stores the em dash as the `—` escape; `form.ts`/`modules.ts` use a literal `—` character. Same rendered string, different source bytes (Task 5) — the new test's `decodeJsString` normalises this before comparing, per instruction to match rendered characters, not escaping.

### Studio determination

Re-checked from scratch, independent of the original submission: grepped `studio.html` for `data-ag-form`, `data-ag-submit`, `<form`, and `submit` — **zero hits for all four**. Studio has no form element and no form-handling code anywhere in its source; there is no message to have gotten wrong.

`STUDIO_MODULES` was already `[applyTheme, shellMinimal, reveal, parallax, navOnDark, hoverLift, cursor, clock]` in the original Task 13 submission — **`form` was never in that list**. I re-read the array literal directly and grepped the whole `app/studio/` directory for the substring `form` to be certain (the only hits are inside doc-comment prose and unrelated words like "transform"/"formula"). So the coordinator's premise that "`app/studio/modules.ts` mounts the shared `form`" does not match the code as submitted — no drop was needed this round. I only clarified the comment (it referenced the now-deleted `formWorkingDay.ts` by name) and added the new test's own independent confirmation (`studio genuinely has no form: no message in source, no form behaviour mounted`, passing) so this isn't just a re-assertion of the original claim.

### Case Study's dormant `form`: kept, confirmed no-op

Per instruction, kept as-is: source's `componentDidMount` does call the `[data-ag-form]` block, and case-study's own message matches the default exactly, so there is nothing to parameterise. Confirmed the no-op directly by reading `makeForm`'s body (`lib/behaviors/form.ts`): `const el = root.querySelector<HTMLFormElement>('[data-ag-form]'); if (!el) return () => {};` — with no `<form data-ag-form>` in case-study's rendered markup (confirmed in the original submission and unchanged here), this guard fires immediately and no listener is ever attached. Not merely asserted — the new test's `case-study: mounted form message matches case-study.html's own source` subtest passes specifically because both sides resolve to the same default string, and the build/runtime behaviour is unaffected by whether the (unreachable) listener code exists.

### The test, and the mutation proof

Added `lib/behaviors/form.test.mjs`: for each of the seven pages, extracts the real success message from `.source/templates/<slug>.html` (anchored on the captured string starting with "Thanks" — an earlier, unanchored version of this regex matched the custom-cursor block's unrelated `dot.textContent = '';` reset instead, which appears in every one of these templates before the form's own assignment, and reported a false "no message" for every page; anchoring on "Thanks" fixed it, which is itself a small proof the test can catch a real extraction bug, not just a copy-paste one), and the message each page's own `modules.ts` actually mounts (reading the `_MODULES` array literal specifically, not the whole file, so a doc comment that quotes the same string in prose can't produce a false pass). 9 subtests: one confirming `form.ts`'s own default, one per page, and one dedicated Studio double-check.

Proved it discriminates, not just co-incidentally passes, before trusting it:
1. Ran it clean: 9/9 pass.
2. Mutated `app/careers/modules.ts`'s mounted message only, from `'Thanks, we reply within a week'` to `'Thanks, we reply within a month'`.
3. Re-ran: `careers: mounted form message matches careers.html's own source` **failed**, with `careers mounts "Thanks, we reply within a month" but its own template sets "Thanks, we reply within a week"`.
4. Restored the file from a pre-mutation backup, re-ran: 9/9 pass again.

### Confirmation: the four default-message pages are unchanged

Home, About, Services and Case Study all resolve to `form`'s default instance (`makeForm('Thanks — we reply within a day')`), the exact same message and the exact same stable function reference (created once, at `form.ts` module-evaluation time) they had before this refactor. `git diff` confirms `app/modules.ts`, `app/about/modules.ts` and `app/services/modules.ts` have zero changes this round; `app/case-study/modules.ts`'s only change is a doc-comment clarification, not to the `CASE_STUDY_MODULES` array itself.

### Gates, re-run

- `node --test`: **59/59 pass** (was 50; +9 from the new `form.test.mjs`).
- `npx tsc --noEmit`: **clean**.
- `npm run build`: **clean**, same 8 static routes, no new warnings (re-diffed the full warning list against the pre-fix-round run — the only warnings are the same pre-existing `no-img-element` ones on `app/page.tsx`/`app/about/page.tsx`/`app/services/page.tsx` and the same pre-existing `reel.ts`/`liquid-ether.ts`/`stroke-text.ts` lint warnings, none of which this round touched).

Route sizes (all still static, all still ~118 kB First Load JS, three.js still absent — this round changed a string literal, not a code path that could pull in a new dependency):

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      331 B         118 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 328 B         118 kB
├ ○ /careers                               336 B         118 kB
├ ○ /case-study                            319 B         118 kB
├ ○ /contact                               358 B         118 kB
├ ○ /services                              332 B         118 kB
└ ○ /studio                                315 B         118 kB
+ First Load JS shared by all             103 kB
```

(Sizes moved a few bytes on every route versus the original submission — expected: `makeForm('...')` is a slightly larger call expression than a bare `form` reference, and this shows up even on pages whose message didn't change, since `form.ts` itself changed shape.)

### Files changed this round

```
 M app/careers/modules.ts        (form -> makeForm('...week'); the actual fix)
 M app/case-study/modules.ts     (comment only)
 M app/contact/modules.ts        (formWorkingDay -> makeForm('...working day'))
 M app/studio/modules.ts         (comment only)
 M lib/behaviors/form.ts         (factory refactor)
 D lib/behaviors/formWorkingDay.ts
 M lib/behaviors/index.ts        (export makeForm, drop formWorkingDay)
?? lib/behaviors/form.test.mjs   (new)
```

No page.tsx touched, no other behaviour module touched, no other page's modules.ts touched — matches the coordinator's explicit authorisation (`form.ts`, `index.ts`, `app/careers/modules.ts`, delete `formWorkingDay`) plus the two additional edits the ruling itself required (`app/contact/modules.ts` to stop importing the deleted module, and the new test).
