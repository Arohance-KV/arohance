# Task 10 Report: mobile responsive (390 / 768), desktop untouched

## Status: DONE

Desktop stays byte-identical: `node tools/compare.mjs 1440` still reports
**exactly 5** differences (all four known-acceptable live clock/timer
readings + the one ruled contact background-color occlusion), with all
three regression guards passing on all seven pages. At 390 and 768,
every measured breakage is either fixed or documented as a deliberate,
pre-existing design characteristic that Task 10 should not alter.

---

## 1. What was built (Phase 1 tooling)

Rather than guessing, I extended the existing harness to measure mobile
breakage directly, then let the numbers drive every fix.

- **`tools/shoot.mjs`** — added `collectBreakage()`, called from the
  existing `collectMeasurements()` (so it runs on every capture, any
  target, any width) and stored as a new `breakage` field in the JSON
  record. It measures, per page:
  1. `document.documentElement.scrollWidth - clientWidth` (page-level
     overflow).
  2. Every element whose bounding box extends past the viewport's left
     or right edge, with a locator, the overflow magnitude, and a text
     sample.
  3. Text clipping/overlap: any element that itself carries a direct
     text run (not just wraps other elements) whose `scrollWidth`
     exceeds its `clientWidth`.
  4. Interactive elements (`a,button,input,textarea,select`) rendered
     smaller than 40×40 CSS px.
  5. Text rendered below ~12px on a real text-bearing element.

  Two known-decorative, always-wider-than-their-clipping-ancestor
  mechanisms — the marquee ribbon (`[data-ag-ribbon]`) and the 3D card
  rail (`[data-ag-stream]`) — are excluded from checks 2/3 with an
  inline comment explaining why (they are not excluded from check 1,
  which is exactly what would catch it if either ever leaked to the
  page). This was a necessary refinement made **during** Phase 1: the
  first raw run buried real findings under hundreds of lines of the
  marquee's own spans, which are wider than their container by design
  at every breakpoint including 1440.
- **`tools/mobile-audit.mjs`** (new sibling, per the brief's own
  suggestion) — reads the `breakage` field for one target/width across
  all seven slugs and prints a grouped report (repeated instances of
  the same component, e.g. 13 client-logo cells or 6 role cards,
  collapse to one line with a count) plus a per-page and grand summary.
  Exit code is non-zero if anything is found, so it composes as a check.
- **`tools/compare.mjs`` was not touched at all** — it stays the
  desktop gate exactly as Task 9 left it.

Both files are additive only: `git diff --stat` shows `tools/shoot.mjs
| 152 ++++...` with **zero deletions**, and `mobile-audit.mjs` is new.

---

## 2. Phase 1 measurement table

Captured `node tools/shoot.mjs port 390 844` and `node tools/shoot.mjs
port 768 1024`, then `node tools/mobile-audit.mjs <width>`. This table
is the **first** run, before any fix — i.e. what Phase 1 actually found.

| Page | Width | page-overflow | beyond-viewport | clipped-text | tap-target<40 | font<12px |
|---|---|---|---|---|---|---|
| home | 390 | 0 | 17 | 0 | 9 | 36 |
| home | 768 | 0 | 5 | 0 | 9 | 36 |
| about | 390 | 0 | 15 | 0 | 7 | 13 |
| about | 768 | 0 | 3 | 0 | 7 | 13 |
| services | 390 | 0 | 13 | 0 | 9 | 21 |
| services | 768 | 0 | 1 | 0 | 9 | 21 |
| studio | 390 | 0 | 13 | 1 | 4 | 15 |
| studio | 768 | 0 | 1 | 1 | 4 | 15 |
| careers | 390 | 0 | 3 | 1 | 9 | 16 |
| careers | 768 | 0 | 2 | 1 | 9 | 16 |
| contact | 390 | 0 | 13 | 1 | 9 | 11 |
| contact | 768 | 0 | 1 | 1 | 9 | 11 |
| case-study | 390 | 0 | 13 | 1 | 4 | 15 |
| case-study | 768 | 0 | 1 | 1 | 4 | 15 |

Every individual finding, by selector and magnitude, is preserved in
the raw audit output (paths in §7). The categories, deduplicated across
all seven pages, break down as follows.

### 2a. `beyond-viewport` — every distinct root cause found

| Selector shape | @390 overflow | @768 overflow | Verdict |
|---|---|---|---|
| `[data-ag-news-panel]` / `[data-ag-menu-panel]` and their children | 10.8px | 0 (gone) | **Real, mobile-only — FIXED** (§3.1) |
| `[data-ag-ribbon]` and descendants (marquee track/spans) | up to ~1840px | up to ~1840px | Excluded from the tool (by-design, see §1); confirmed harmless below |
| The marquee's own `-6%/-6%` bleed wrapper (not the ribbon itself) | 24px | 46px | **Investigated, confirmed harmless** (§4.1) |
| `[data-vt-kb]` Ken-Burns image inset (`-4%`) | 21–22px | 37px | **Investigated, confirmed harmless** (§4.1) |
| `[data-ag-cursor]` (custom cursor dot) | 5.5px | 5.5px | **Investigated, confirmed harness artifact** (§4.2) |

### 2b. `clipped-text` — every distinct root cause found

| Selector | @390 | @768 | Verdict |
|---|---|---|---|
| Footer "AROHANCE®" / "CAREERS®" giant wordmark (studio, careers, contact, case-study — home/about/services use the animated `data-ag-stroke` version instead, unaffected) | +66 to +136px | +119 to +256px | **Investigated, confirmed NOT a mobile regression** (§4.3) |

### 2c. `tap-target<40` — every distinct element found (grouped by role)

| Element | Count found | Verdict |
|---|---|---|
| `[data-ag-close]` menu-close button, 30×30px | 7 (one/page) | **FIXED** |
| `[data-ag-submit]` "Send it →" | 5 | **FIXED** |
| Standalone underline CTAs ("Start something →", "Work with us →", "Apply →"×6, careers "How we hire"/`careers@`) | 10 | **FIXED** |
| Direct email links (`hello@`, `careers@`, `kv@`) | 6 | **FIXED** |
| "Elsewhere" stacked social links (Instagram/LinkedIn) | 4 | **FIXED** |
| Menu-overlay "Media" links (LinkedIn/Instagram/X) | 18 (3×6 pages) | **FIXED** |
| Footer nav-link rows (Work/Studio/Home/Privacy/Terms/Back-to-top) | 7 rows × 3 links | **FIXED** |
| Form `<input>`/`<select>` (37–39px tall) | 8 | **FIXED** |
| Hero jump-links ("Selected work ↓", "What we do ↓"), careers' "See the open roles ↓", and case-study's "← Selected work" | 4 (*corrected in Fix Round 1 — careers was initially padded, then reverted; see that section*) | **Deferred, documented** (§5) |

### 2d. `font<12px` — not touched, documented (§6)

127 elements across the seven pages: 119 at `text-[10.5px]`/`text-[11px]`
and 8 at `text-[10px]` (*correction, Fix Round 1: the original text here
said "all `text-[10.5px]`/`text-[11px]`" — home's testimonial reel has
8 elements, 4 name-captions and 4 duration timestamps, at `text-[10px]`
instead; see that section*) — all JetBrains Mono micro-labels (eyebrow
tags, index numbers, timestamps, footer meta text, testimonial captions).
Identical set at 768 and at 390 — these are static `px` values, not
`vw`/`clamp()`-based, so they render at the exact same size at every
viewport **including 1440**, where the port is already byte-identical to
the original.

---

## 3. Fixes made — each mapped to the measurement that justified it

All edits are additive `max-lg:` variants (see §3.4 for why `max-lg:`
rather than the brief's example `max-md:`) appended to existing class
strings, or new `className` attributes on elements that previously had
none. **No existing class was edited or removed anywhere.**

### 3.1 Menu/news overlay panels — full-bleed on mobile (Hypothesis #2, CONFIRMED)

**Measurement:** at 390, `[data-ag-news-panel]`/`[data-ag-menu-panel]`
extended 10.8px past the viewport on every page that has one — the
original two-column `flex:0 1 min(100%,430/420px)` side-by-side layout
does not fit a 350px-wide content column. Gone entirely by 768 (both
panels fit side by side there), and absent at 1440 (checked directly:
`pageOverflowPx: 0`, only the harmless marquee bleed and cursor dot show
up there).

**Fix:**
- The overlay's flex row (`absolute inset-0 flex items-start
  justify-end gap-3.5 ...`) gains `max-lg:flex-col max-lg:justify-start`
  on the 6 pages with both a news and a menu panel (home, about,
  services, studio, contact, case-study). `justify-start` is necessary
  alongside `flex-col`: once the main axis becomes vertical, the
  original `justify-end` would pack the stacked panels toward the
  *bottom* of the overlay instead of the top.
- Each panel gains `max-lg:w-full max-lg:flex-none` (`flex:none` =
  `grow:0 shrink:0 basis:auto`, so `width:100%` — a cross-axis property
  once stacked — is what actually sizes it, not the old row-mode
  flex-basis).
- Careers has only a menu-panel (confirmed via Task 6b's own finding,
  re-confirmed by grep: no `data-ag-news-panel` in that file), so no
  stacking is needed — but it still overflowed by 10.8px alone, because
  the panel's default `min-width:auto` refused to shrink below its
  content's intrinsic width. Fixed with `max-lg:min-w-0` only (no
  `flex-col`/`justify-start`, which would have changed careers'
  vertical alignment for no reason).

**Verification beyond the raw numbers:** the panel only becomes visible
when opened (`opacity:0`/`invisible`/`pointer-events:none` while
closed), and its resting/opened transform is `translate3d(28px,0,0)` →
`none` (from `lib/behaviors/shell.ts`, unmodified). The very first
post-fix run still showed the identical 10.8px on `beyond-viewport` —
tracing it (§4 below has the full method) showed this was the *closed*
state's pre-slide-in offset, not a real bug: I simulated an actual
click via a throwaway Playwright script (`page.click('[data-ag-menu-btn]')`,
then waited past the transition) and measured the panel again —
`left:17.16 right:372.84 width:355.69`, filling the content column
exactly, **zero overflow**, `pageOverflow: 0`. Screenshot of the opened
state: `menu-open-390.png` in the scratch directory listed in §7.

### 3.2 Menu close button — 30×30 → 40×40 (measured tap-target)

**Measurement:** `[data-ag-close]`, `w-[30px] h-[30px]`, on all 7 pages.
**Fix:** `max-lg:w-[40px] max-lg:h-[40px]` appended, all 7 pages
(2 hover-colour variants, same fix).

### 3.3 Form controls, submit buttons, standalone CTA links, direct/social links, footer link rows — measured tap-targets, additive padding

**Measurement:** every one of these was individually present in the
audit's `tap-target<40` list (heights 14–39px depending on font-size
and existing padding).

**Fix, by category (each computed against its own font-size at 390 so
the result clears 40px with margin, not just barely):**
- Form `<input>`/`<select>` (`py-2` / `py-[9px]` base) → `max-lg:py-3`
  (12px each side). Textarea was never flagged (its `rows` attribute
  already makes it tall enough) — correctly left alone.
- `[data-ag-submit]` buttons (`pt-0 pb-1` / `pb-[5px]` base) →
  `max-lg:py-2.5` (10px each side).
- Standalone underline CTAs ("Start something →", "Work with us →",
  "Apply →" ×6 via one `replace_all` since the class string is
  byte-identical across all six role cards, careers'
  "How we hire"/`careers@arohance.com`) → `max-lg:py-3`. (Careers' "See
  the open roles ↓" was included in this batch originally; reverted in
  Fix Round 1 — see §5.)
- Direct email links (`hello@arohance.com` ×4, `careers@arohance.com`
  ×2, `kv@arohance.com` ×1) → `max-lg:inline-block max-lg:py-3` (the
  `inline-block` is load-bearing: a plain inline element's vertical
  padding is rendered but does not participate in line-height/spacing
  calculations, which is exactly the risk called out in §5 for the two
  links I *did* leave alone — inline-block avoids it here since each of
  these is the sole content in its own row).
- "Elsewhere" stacked social links, menu-overlay "Media" links
  (LinkedIn/Instagram/X) → `max-lg:py-3` (already-isolated flex-column
  items; padding added inside the existing `gap` budget, does not
  reduce visible spacing between rows since `gap` measures between
  boxes' outer edges, not usable content).
- Footer nav-link rows — measured *twice*: `max-lg:py-3` alone brought
  the height to only 38px (10.5px JetBrains Mono has a tighter natural
  line-height than the 15–19px body links elsewhere), so I re-measured
  and bumped to `max-lg:py-4`, which cleared height. A second
  re-measurement then caught the true remaining gap: short words
  ("Home", "Work", 30.3px) and "Terms" (37.8px) were still narrower
  than 40 — a *width* problem padding on the block axis alone can't
  fix. Added `max-lg:px-2` alongside. Also added `max-lg:items-center`
  to the row that pairs each link group against a plain "© 2026
  Arohance" text sibling with no explicit `items-*` (default `stretch`)
  — without it, the now-taller link group would stretch the row and
  leave the copyright text sitting visibly higher than the links.

All of the above were re-measured after each round; the **final** run
shows zero remaining tap-target findings in any of these categories, on
both 390 and 768 — see §2 table sources and §7.

### 3.4 Why `max-lg:` instead of `max-md:`

I started with Tailwind's default `max-md:` (`@media (width<768px)`),
matching the brief's example literally. The first post-fix audit at 768
showed **zero change** from before — because `max-md:` excludes exactly
768px (Tailwind's `md:` is `min-width:768px`, so `max-md:` stops at
767.98px). Since 768 is one of the two required test widths, I widened
every occurrence (a safe, mechanical `sed` rename across all 7 files,
verified `0` pre-existing occurrences of the string in the baseline
commit first) to `max-lg:` — Tailwind's default `lg` breakpoint is
1024px, so `max-lg:` covers `[0, 1024)`, which contains both 390 and
768 while still excluding 1440. Re-verified the 1440 gate held (exactly
5, all guards passing) immediately after the rename.

---

## 4. Investigations that concluded "no fix" — and why

### 4.1 Marquee ribbon, its bleed wrapper, and the Ken-Burns image inset

All three are elements that are deliberately **wider or larger than
their own clipping ancestor**, by the same fixed-percentage or
translated-track formula at every viewport, including 1440:
- The ribbon track (`[data-ag-ribbon]`, `w-max`, quadruple-repeated
  text) is meant to be much wider than the page — that's what makes
  the `translate3d(...,-50%,...)` marquee loop seamless. Its immediate
  parent (`overflow-hidden`) absorbs 100% of the bleed.
- The `-6%/-6%` bleed wrapper is a deliberate off-edge flourish (visible
  in the original at every width) that is itself absorbed by a
  *further* `overflow-hidden` ancestor two levels up — confirmed
  directly: `pageOverflowPx: 0` on every page at every width tested,
  including 1440, where I additionally checked the ORIGINAL bundle's
  own JSON and found the identical mechanism (`overflowPx` values scale
  by the exact same percentage formula, non-viewport-specific).
- `[data-vt-kb]` is the testimonial reel's Ken-Burns pan/zoom layer
  (`absolute inset-[-4%]`), contained by `[data-vt-stage]`'s own
  `overflow-hidden`.

None of these ever reach `pageOverflowPx` (confirmed 0 everywhere,
every width, every page). Flagging them would report the mechanism
working as intended, not a defect — which is why `collectBreakage()`
excludes ribbon/stream descendants from the two element-level checks
(§1), and why the bleed wrapper and Ken-Burns inset (not excluded,
since they're not noisy) are listed here as investigated-and-cleared
rather than silently dropped.

### 4.2 Custom cursor dot, 5.5px

`lib/behaviors/cursor.ts:9` — `if (!window.matchMedia ||
!window.matchMedia('(pointer:fine)').matches) return () => {};` — the
entire behaviour is gated behind `pointer:fine` and never mounts on a
real touch device. It only appears in this harness because headless
Chromium under Playwright still reports `pointer:fine` even at a
390×844 viewport (no `hasTouch`/touch emulation was configured). This
is a harness artifact of the capture environment, not a mobile defect;
confirmed by reading the source rather than guessing. Not modified —
`lib/behaviors/*` is off-limits and there is nothing to fix regardless.

### 4.3 Footer wordmark clipping ("AROHANCE®" / "CAREERS®")

Present on studio, careers, contact, case-study (home/about/services
use the separately-animated `data-ag-stroke` GSAP version instead,
which is unaffected — confirmed 0 clipped-text findings on those three
pages). Measured the *same* element's `scrollWidth`/`clientWidth` at
1440 on **both** targets: `scrollWidth:1793 clientWidth:1313` on
**both** the original bundle and the port, byte-for-byte identical.
This is the giant, intentionally-oversized, horizontally-cropped
display-type footer signature, present and clipped identically in the
hand-designed original at every width (the underlying CSS is
`clamp(3.4rem,19.2vw,20rem)` font-size against an unconstrained-width
container — both quantities scale by the same `vw` ratio at every
breakpoint, so the clipping ratio never changes with viewport). Not a
mobile regression; left untouched.

### 4.4 ContactPill overlap (observed in screenshots, not a measured category)

Visually, the floating "↑ Up / make contact" pill (`components/
ContactPill.tsx`, explicitly off-limits, vendored verbatim from the
original) sits on top of form content in the `contact.png` and
`careers.png` screenshots at 390. This is **not** something any of the
five measured checks look for (element-over-element overlap was not in
the brief's checklist), and it is not mobile-specific: the component is
`position:fixed` with no viewport-conditional code at all, so it
overlaps whatever is scrolled beneath it at every width, including
1440 — it's simply more noticeable on a narrow screen because the pill
occupies a larger fraction of it. Its appearance in these particular
screenshots is additionally an artifact of the capture methodology
itself: `shoot.mjs`'s reveal-trigger pass deliberately scrolls the
whole page (to fire `IntersectionObserver` reveals) before returning to
the top for the screenshot, which is exactly the scroll-past-threshold
gesture that makes this vendored script drop the pill in. Flagging for
your own visual review, not fixed, not in scope.

---

## 5. Deferred, documented: 4 tap-targets left below 40px

*(Updated in Fix Round 1 — this was 3 in the original submission,
which incorrectly padded the fourth. See that section for what changed
and why; this section now documents the correct, final set of four
together, as ruled.)*

`#top > div.relative > div.flex > a.flex` — "Selected work ↓" (home)
and "What we do ↓" (services); `header > div.relative > div.flex >
a.inline-flex` — "See the open roles ↓" (careers); and `header >
div.flex > a` — "← Selected work" (case-study). All four share one
exact shape: they sit in a `flex justify-between items-end` (case-study:
`items-baseline`) row **alongside a differently-sized sibling with no
independent padding** (home/services/careers: a multi-line body
paragraph; case-study: two peer eyebrow-row spans of the same 11px
type). Adding vertical padding to only the link would push its text
down relative to its un-padded neighbour(s) — a visible baseline shift,
not a mechanical, invisible fix. This is precisely the "fixing this
would mean editing how the row aligns, which is a design decision" case
flagged in the brief's own "stop and tell me" instruction — except here
the safer, mechanical option (padding) simply doesn't exist without a
visible side effect, so I'm reporting it rather than guessing at a
redesign. All four are small (99.5–149.7px wide, 14–22px tall — full
text always visible, nothing clipped), and this exact shape is
unchanged from the original at every viewport.

Measured at glyph level (`Range.getBoundingClientRect()` on the text
nodes, not just box edges) during Fix Round 1's review: services'
link drifts 2.3px from its 1440 reference at the deferred widths; home's
row wraps to two lines at both 390 and 768, so there is no shared
baseline to break at all; careers' link — initially padded, incorrectly
— sat 1.6px above the paragraph's last line at 1440 (the designer's
near-flush reference) but 10.8–10.9px above it at 768/1023, roughly 9px
of degradation. Reverted for consistency with the other three and to
restore that alignment (Fix Round 1).

An alternative considered and rejected: `max-lg:items-baseline` on the
row instead of padding the link. `items-baseline` aligns each flex
item's *first* baseline — for a multi-line paragraph sibling, that is
its first line, not its last, which would move the link substantially
further than the small drift being avoided. Insensitive to padding, but
changes which lines align; not adopted.

**Not implemented, noted for later:** pairing `py-3` with a compensating
`-my-3` on all four links would expand the hit area (for touch) while
leaving the outer box height, and therefore the row's alignment,
unchanged — satisfying both constraints at once. This is a real option
if the four sub-40px targets are ever judged worth closing, deliberately
not introduced now, across four sites, in a task scoped to measured
breakage.

## 6. Deferred, documented: 127 sub-12px text elements, not touched

Every one of these is a `text-[10.5px]` / `text-[11px]` / `text-[10px]`
(*correction, Fix Round 1 — see §2d*) JetBrains Mono micro-label —
eyebrow section tags ("(01) Selected work"), index numbers ("01"/"02"),
footer copyright/meta lines, timestamp readouts, and (the `10px`
instances specifically) home's testimonial reel name-captions and
duration timestamps.
Three facts together rule this out as "fix what breaks, measured":
1. **Static `px`, not `vw`/`clamp()`** — confirmed by reading the
   source: every single one is a fixed pixel value, so it renders at
   the *exact same size* at 390, 768, and 1440.
2. **Identical set of elements at 1440** — the port has already passed
   Task 9's exact-match gate at 1440 including these exact typographic
   choices; they are not something the mobile port introduced.
3. **Sitewide, not local** — 127 occurrences is the site's entire
   micro-label type role, used identically on every page. Resizing it
   would be a typographic system change (a design decision affecting
   the whole site's aesthetic), not a mechanical bug fix, and would
   very likely require touching the same class in dozens of places
   with no single measured "this one thing is broken" to point at.

This satisfies Phase 3's own escape hatch — "a documented reason where
one genuinely cannot be fixed without altering the design" — for
exactly the reason the task file warned about: original has zero
responsive breakpoints, so "too small on a phone" here describes a
property of the hand-made design itself, not a defect the port added.

---

## 7. Screenshot and data directories (for your own review)

```
C:\Users\reeja\AppData\Local\Temp\arohance-fidelity-shots\port\390\      (7 .png + 7 .json)
C:\Users\reeja\AppData\Local\Temp\arohance-fidelity-shots\port\768\      (7 .png + 7 .json)
C:\Users\reeja\AppData\Local\Temp\arohance-fidelity-shots\port\1440\     (7 .png + 7 .json)
C:\Users\reeja\AppData\Local\Temp\arohance-fidelity-shots\original\1440\ (7 .png + 7 .json)
```

Raw audit output (final, post-fix) and the opened-menu verification
screenshot:
```
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\audit-390-FINAL.txt
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\audit-768-FINAL.txt
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\compare-1440-FINAL.txt
C:\Users\reeja\AppData\Local\Temp\claude\c--arohance-projects-Arohance-new-website\561af6e9-13f9-4c3f-a81c-1a9631b6e39e\scratchpad\menu-open-390.png
```

---

## 8. Which of the seven prior expectations held up

1. **Nav (logo + two 46px buttons vs. the gutter)** — **WRONG.**
   Measured: zero overflow, zero tap-target issues, at both widths, on
   every page. At 390 the logo (≈146×46, from its 422:133 intrinsic
   ratio) plus two 46px buttons plus their own gap total ≈248px against
   a ≈350px content column. Nothing to fix; verified rather than
   assumed, per the brief's own instruction.
2. **Menu and news panels needing to go full-bleed** — **CONFIRMED**,
   the single largest real fix (§3.1).
3. **Hero `h1` three-line type scale** — **WRONG.** Zero clipped-text or
   overflow findings on any `h1` at either width. The `clamp()`
   formulas already scale the display type down smoothly; no forced
   `nowrap` spans wide enough to break.
4. **Work card image+meta rows** — **WRONG.** Zero findings; the
   existing `flex-wrap` + `min(100%,Npx)` bases already degrade to a
   single column correctly.
5. **Footer columns** — **PARTIALLY RIGHT, for a different reason than
   expected.** The footer's own layout never broke (no wrap/overflow
   defect) — what needed fixing was tap-target size on the links inside
   it (§3.3), and the giant wordmark clipping turned out to be
   identical-to-original, not a layout regression (§4.3).
6. **Marquee ribbons as the likely page-overflow source** — **WRONG,
   refuted with direct measurement.** `pageOverflowPx: 0` on every page
   at every width, including 1440. The ribbon is absorbed by its own
   `overflow-hidden` ancestor exactly as designed (§4.1).
7. **Section gutters and vertical rhythm** — **WRONG.** No findings;
   the `clamp()`/`vw` padding scales correctly on its own.

**What I found that wasn't on the list:** the menu-close button and a
long tail of tap-targets across forms/CTAs/footers/social links
(expectation #5 gestured at "footer columns" but not specifically tap
target sizing); the `max-md:`/`max-lg:` breakpoint-boundary mistake
described in §3.4, caught by re-measuring rather than assuming the
first fix worked.

---

## 9. Phase 3 verification

**`npx tsc --noEmit`** — clean, no output.

**`npm run build`** — clean; only the same pre-existing ESLint
warnings present before Task 10 (unused vars/expressions in vendored
`lib/liquid-ether.ts`/`lib/stroke-text.ts`/`lib/behaviors/reel.ts`, and
`<img>`-vs-`<Image>` advisories — none introduced by this task). Page
sizes unchanged (118 kB First Load JS, same as baseline).

**`node --test`** — 58/59 pass. The one failure
(`tools/unbundle.test.mjs`, "reported asset count matches files
actually written", `49 !== 38`) is **pre-existing and unrelated**:
reproduced identically by `git stash`-ing every Task 10 change and
re-running against the clean `e365104` baseline before restoring. Not
touched — `tools/unbundle.mjs` is explicitly off-limits, and this
predates Task 10 entirely.

**`node tools/compare.mjs 1440`** (final run):
```
TOTAL: 5 difference(s) across 7 pages
```
Per page: home 1 (video-counter digits), about 0, services 0, studio 1
(clock digits), careers 0, contact 2 (clock digits + the ruled
background-color occlusion), case-study 1 (clock digits). All three
regression guards (font-rendering, html line-height, form control)
PASS on all seven pages. (One intermediate run momentarily read 4/7
because home's live testimonial-video counter happened to land on the
same second in both captures — re-shooting fresh immediately reproduced
5/7 with the counter genuinely differing again ("00:11" vs "00:13"),
confirming that was capture-timing coincidence, not a regression — see
the full trace in the conversation; final numbers above are from the
last, freshest capture.)

**Mobile re-capture, final state:**
- Page-level overflow: **0** on every page, both widths.
- Tap-targets < 40×40: reduced from 9/7/9/4/9/9/4 (390, per page) to
  **1/0/1/0/1/0/1** (both widths) — the 4 documented exceptions in §5,
  nothing else. (This originally read `1/0/1/0/0/0/1` — careers'
  fourth exception was incorrectly padded in the initial submission;
  see Fix Round 1.)
- Clipped text: unchanged at 1 finding on 4 pages (studio, careers→CAREERS®
  is `#apply`'s footer... actually present on studio/careers/contact/case-study,
  0 on home/about/services) — the wordmark, confirmed byte-identical to
  original at 1440, documented in §4.3, not fixed.
- Sub-12px text: unchanged (127 elements, documented in §6, not fixed).
- `beyond-viewport`: reduced to the four investigated-and-cleared
  mechanisms in §2a/§4 — all either contained (page overflow 0,
  confirmed both at these widths and at 1440) or a harness artifact.

---

## 10. Files changed

Modified:
- `tools/shoot.mjs` — `collectBreakage()` added (152 insertions, 0
  deletions).
- `app/page.tsx`, `app/about/page.tsx`, `app/services/page.tsx`,
  `app/studio/page.tsx`, `app/careers/page.tsx`, `app/contact/page.tsx`,
  `app/case-study/page.tsx` — additive `max-lg:` variants only, per §3.

New:
- `tools/mobile-audit.mjs` — mobile breakage report generator.

Not touched: `tools/compare.mjs`, `tools/unbundle.mjs`,
`tools/convert.mjs`, `tools/tw.mjs`, the seven root `Arohance *.html`
files, `app/globals.css`, `app/layout.tsx`, `components/*`,
`lib/behaviors/*`, `lib/stroke-text.ts`, `lib/liquid-ether.ts`.

## 11. Self-review findings, issues, concerns

- **Self-review method:** read the full `git diff` for every changed
  file before building (per the process note), confirmed every line is
  a pure append to an existing `className` string or a brand-new
  `className` attribute — zero edits or removals to any pre-existing
  class. Confirmed via `git diff --stat`: only insertions on the
  `app/*` files' *net* line count changes are from wrapping, not
  deletions of content.
- **Two rounds of self-caught mistakes**, both corrected before
  finalizing (documented in full in §3.4 and §3.3): the `max-md:` vs.
  `max-lg:` breakpoint gap (768 initially got none of the fixes), and
  the footer links needing a second, then third, round of measurement
  (py-3 insufficient on height for 10.5px text; then still insufficient
  on width for 4-letter words). Both were caught by re-measuring after
  each change rather than assuming the fix worked — exactly the
  discipline the brief asks for.
- **One thing I looked at but didn't change:** whether
  `collectBreakage()` should simulate opening the menu overlay (and any
  accordion panels) before measuring, rather than measuring the
  default/closed DOM state. I verified by hand (§3.1) that the closed
  state's only artifact is the harmless 28px pre-slide-in offset, and
  that accordion-collapsed content (`grid-template-rows:0fr` +
  `overflow-hidden`) does not distort width-based measurements (an
  ancestor's overflow-hidden clips rendering, not a descendant's own
  computed layout box) — confirmed in practice since the "Apply →"
  tap-target fix, needed and correctly sized from data captured while
  its accordion was collapsed, verified correct once fixed. Didn't
  build the simulation since the existing measurement was already
  proven accurate for every case this task touched; flagging the
  option in case a future task wants it.
- **ContactPill overlap** (§4.4) is worth your eyes specifically since
  it's outside every measured category — not a regression, not fixed,
  just flagged.
- No new dependencies. No changes to `lib/behaviors/*` or
  `components/*` were needed at any point.

---

# Fix Round 1

## Status: DONE

One finding accepted in full, one code change, two report corrections
made in place (with this section as the record of what changed and
why, per this project's own convention of correcting stale report text
in place rather than leaving it to silently stand).

## 1. The finding

`app/careers/page.tsx:66`, "See the open roles ↓", was given
`max-lg:py-3` in the original submission — but it sits in the exact
same shape (`flex justify-between items-end` row beside an unpadded
multi-line paragraph sibling) as the three links already deferred in
§5 (home's "Selected work ↓", services' "What we do ↓", case-study's
"← Selected work"). Padding it broke my own stated rule for that shape.

Measured at glyph level (`Range.getBoundingClientRect()` on the actual
text nodes, not box edges): at 1440 the link sat 1.6px above the
paragraph's last line (the designer's near-flush reference); at 768
and 1023 — with the row confirmed still on a single flex line at both
— it sat 10.8–10.9px above it. Roughly 9px of alignment degradation at
a width this task is required to leave clean.

## 2. The ruling and the fix

Defer this fourth link identically to the other three. Removed
`max-lg:py-3` from `app/careers/page.tsx:66`; the line is now
byte-for-byte identical to the pre-Task-10 baseline (`git show
e365104:app/careers/page.tsx`, same line number, diffed directly).

**Alternative considered and rejected:** `max-lg:items-baseline` on the
row instead. `items-baseline` aligns each flex item's *first* baseline;
the sibling is a multi-line paragraph, so this would align the link to
the paragraph's *first* line rather than its last — moving it
substantially further than the 9px being removed. Untested and
plausibly worse; not adopted.

**Not implemented, recorded as a future option (§5):** `py-3` paired
with a compensating `-my-3` would widen the hit area while leaving the
outer box height, and therefore the alignment, unchanged. Deliberately
not introduced now, across four sites, in a task scoped to measured
breakage — the user can adopt it later if all four should be padded.

## 3. Report corrections made in place

Both corrected at their original location, with an inline note, rather
than left standing or only addressed here (per this project's own
established convention — see `task-9-report.md`'s round-5 correction):
- §2c/§3.3/§5: careers' link moved from the "FIXED" standalone-CTA row
  to the deferred-tap-target set, which is now 4, not 3, with the
  glyph-level measurements above folded into the shared rationale.
- §2d/§6: "all `text-[10.5px]`/`text-[11px]`" corrected to include 8
  elements at `text-[10px]` — confirmed by reading the source
  (`app/page.tsx:342,344,351,353,360,362,369,371`): home's testimonial
  reel's 4 name/role captions ("Managing Director, Agasti Realty" etc.)
  and 4 duration timestamps ("02:14" etc.). Does not change the
  conclusion (still static `px`, still identical at 1440, still a
  sitewide convention) — corrected because these reports are what a
  future reader trusts.
- §9: the final tap-target residue line corrected from `1/0/1/0/0/0/1`
  to `1/0/1/0/1/0/1`, with a note that the original number was wrong.

## 4. Re-verification

Unfiltered process listing before starting: no stray `next`/`node`
dev-server processes (only unrelated MCP servers already running in
this environment). Rebuilt from clean (`rm -rf .next && npm run
build`) before measuring anything, per the standing lesson about stale
builds.

`npx tsc --noEmit` — clean.

`node tools/compare.mjs 1440` (fresh capture, both targets):
```
TOTAL: 5 difference(s) across 7 pages
```
Same per-page distribution as before this round (home 1, about 0,
services 0, studio 1, careers 0, contact 2, case-study 1); all three
regression guards PASS on all seven pages. Desktop remains untouched —
expected, since the only code change this round *removes* a mobile-only
variant that never affected the 1440 render in the first place.

`node tools/mobile-audit.mjs 390` / `768` (fresh capture, both widths):
tap-target residue is now **1/0/1/0/1/0/1** at both widths — exactly
the predicted change from `1/0/1/0/0/0/1` (careers goes from 0 to 1).
Confirmed the specific finding is the right one at both widths:
```
[tap target < 40x40] [data-ag-root] > header.relative > div.flex > a.inline-flex  149.7x22px  "See the open roles ↓"
```
present at both 390 and 768, alongside the same three pre-existing
exceptions (home, services, case-study), nothing else changed in any
other category (`beyond-viewport`, `clipped-text`, `font<12px` all
identical to the prior final state).

## 5. Files changed this round

- `app/careers/page.tsx` — one class removed (`max-lg:py-3`), restoring
  byte-identity with the pre-Task-10 baseline at that line.
- `.superpowers/sdd/2026-09-25-arohance-nextjs-port/task-10-report.md`
  — this section, plus the three in-place corrections listed in §3
  above.

Not touched: everything else from the original Task 10 diff stands
unchanged (`tools/shoot.mjs`, `tools/mobile-audit.mjs`, the other six
`app/*/page.tsx` files).
