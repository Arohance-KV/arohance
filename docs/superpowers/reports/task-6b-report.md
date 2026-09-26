# Task 6b Report — shell behaviour module and ContactPill component

## What I implemented

1. `lib/behaviors/shell.ts` — the nav burger / overlay-menu behaviour, ported from `initShell` in the homepage script, with Ruling 2 applied (news panel and news button are optional; only the overlay and the menu panel are required).
2. A strengthened scroll-lock regression test appended to `lib/behaviors/ssr.test.mjs`, replacing the brief's vacuous `lastIndexOf`-based draft with one that checks *every* disposer `shell.ts` returns, independently.
3. `shell` added to `SHARED` in `lib/behaviors/index.ts`, positioned after `nav`, per explicit instruction.
4. `components/ContactPill.tsx` — a `'use client'` port of `.source/vendor/contact-pill.js`, with the `.dc.html` href logic replaced by the real route `/contact` (Ruling 3), and full mount/unmount lifecycle management added (the original never tore itself down).

No `Nav.tsx`, `MenuOverlay.tsx`, or `Footer.tsx` were created (Ruling 1). No new dependencies. `lib/liquid-ether.ts`, `lib/stroke-text.ts`, `lib/effects.test.mjs`, and everything under `tools/` are untouched (verified via `git status` — clean on all of them).

---

## Careers vs. home `initShell` comparison (Ruling 2 verification)

Read directly from source: home's `initShell` is `.source/templates/home.html:965-1010`; careers' is `.source/templates/careers.html:659-699`. I also confirmed via `grep -c "data-ag-news" .source/templates/careers.html` → `0`: careers' *markup* has no news-panel/news-button elements at all, not just an unused query in its script.

Differences found, and disposition of each:

| # | Difference | Verdict |
|---|---|---|
| 1 | Careers never queries `[data-ag-news-panel]` / `[data-ag-news-btn]`; `news`/`nBtn` don't exist as concepts in its script. | **Confirms Ruling 2's premise exactly.** No news panel, full stop. |
| 2 | Careers' guard is `if (!ov || !menu) return;` — already only requiring overlay+menu, never `news`. | **This is exactly the guard Ruling 2 asks for.** Careers' own hand-written guard is the proof the unified guard is correct. |
| 3 | Careers uses a boolean `open` flag; home uses a tri-state `state: 'news'\|'menu'\|null`. | Cosmetic. Under the unified tri-state implementation, `state` can only ever reach `'menu'` or `null` on careers (nothing ever calls `set('news')`, since `on(nBtn, …)` no-ops when `nBtn` is null) — the tri-state degenerates to careers' boolean exactly. |
| 4 | Careers' `paint()` touches only `menu` (opacity/transform/pointerEvents) and **never sets `transitionDelay` on it at all** — home's stagers both panels with `i * 70 + 'ms'`. | **Handled by construction, not papered over.** My unified `paint()` builds a `panels` array that includes `news` only when it exists; when it doesn't, `menu` is index `0`, so the *same* `i * 70` formula yields `0ms` — indistinguishable from "never touched." I confirmed the menu panel's own CSS (`.source/templates/careers.html:249`) declares no `transition-delay` at all, so JS-writing `'0ms'` is a no-op against that default. Verified, not assumed. |
| 5 | Careers' background-click test is `e.target === ov` only; home's is `e.target === ov \|\| e.currentTarget === e.target`. | **Semantically identical, not a real difference.** `ov.addEventListener('click', bg)` means `e.currentTarget` is always `ov` when `bg` runs, so the second disjunct is a tautological restatement of the first. The brief's draft (and my file) already use the simplified single-condition form. |
| 6 | Careers' Escape handler fires unconditionally (`if (e.key==='Escape') shut()`); home's guards on `state` truthiness. | Cosmetic. An unconditional `shut()` when already closed just repaints identical values — no visible effect. The unified version uses home's guarded form for every page, as Ruling 2 specifies ("Escape handling … stays exactly as the brief specifies"). |
| 7 | Careers attaches `mBtn`/`close` listeners with bare `if (el) el.addEventListener(...)`, no generic `on()` helper. | Cosmetic code shape only; net effect (attach + eventual removal) identical. |
| 8 | **Careers' original never removes its per-link click listeners** (`Array.from(ov.querySelectorAll('a')).forEach(a => a.addEventListener('click', shut))` — no matching `removeEventListener` anywhere in its cleanup block). | A genuine, pre-existing minor leak in careers' *original* vanilla script. The unified `shell.ts` (following home's more careful pattern, which Ruling 2 says to keep: "link-click closing … stays exactly as the brief specifies") fixes this for careers too, for free. This is a one-directional improvement (invisible to users, just correct listener hygiene) — flagging per "stop and tell me rather than papering over it," but it is not a blocker and Ruling 2's own text already mandates keeping this behaviour. |

**Conclusion: Ruling 2 is sufficient.** "Home's shell minus the news panel," with the guard loosened to `!ov || !menu` and the panels array built conditionally, reproduces every user-visible and functional aspect of careers' own hand-written `initShell`. All differences are either (a) already dictated by Ruling 2's own text, (b) semantically-inert cosmetic/code-shape differences, or (c) a pre-existing minor omission in careers' original that unifying fixes as a side effect. I did not find anything to stop and escalate on.

**Trace: does `shell.ts` work on careers?** `root.querySelector('[data-ag-overlay]')` → found. `[data-ag-menu-panel]` → found. `[data-ag-news-panel]` → `null`. Guard `!ov || !menu` → both present → does not return early. `nBtn` → `null`, so `on(nBtn, () => set('news'))` no-ops (the `on` helper's own `if (!el) return;`). `paint()`'s `panels` ternary takes the `: [[menu, state === 'menu']]` branch since `news` is falsy. Clicking `mBtn` calls `set('menu')`, which toggles `state` between `'menu'` and `null` — the menu opens/closes, overlay fades, burger bars form an X, body scroll locks/unlocks, Escape/background-click/link-click all close it. Everything careers needs is wired; nothing news-shaped is ever touched.

---

## Which templates load the contact-pill script

**All seven.** Verified via `.source/assets.json` (not assumed): seven distinct UUIDs map to `.source/vendor/contact-pill.js` (`d11cbf2d…`, `14557105…`, `ce6dc61c…`, `27f5278c…`, `03a1258e…`, `f7854dd2…`, `9504fd0f…`), and a `grep -l` for each UUID across `.source/templates/*.html` found exactly one hit each, one per template:

| UUID | Template |
|---|---|
| `03a1258e-3d21-4895-9608-3d3dd433f6f5` | home |
| `d11cbf2d-6725-4c01-9cc7-ebc435ac65ee` | about |
| `f7854dd2-841a-4586-8a8f-005164731db6` | services |
| `9504fd0f-192b-4cd8-ba85-adde146e9ff3` | studio |
| `14557105-fc82-45f4-892b-5c78cd39444f` | careers |
| `27f5278c-9e13-453c-b08e-5e0849e2998e` | contact |
| `ce6dc61c-4c09-4d6c-8430-29e7ef50dc91` | case-study |

Each appears as a `<script src="UUID">` tag in that template's `<head>`. This is universal — no page is exempt, so the assumption "all seven pages will mount `<ContactPill />`" holds for whoever wires up Tasks 7/11-13.

---

## Fidelity diff — `lib/behaviors/shell.ts` vs. home's `initShell` (46 source lines → 86 ported lines, incl. imports/JSDoc/blanks)

Substantive (behaviour-relevant) differences, everything else copied verbatim modulo TypeScript types:

1. **Signature** (mechanical, per Task 5's porting-rules table): `initShell() { const root = this.root(); if (!root) return; … }` → `export const shell: Behavior = (root) => { … }`. `this.` removed throughout; `this.cleanups.push(fn)` → `cleanups.push(fn)` against a local array (2 call sites: the `on()` helper, the per-link forEach).
2. **Guard — Ruling 2 + Fact 1** (line 25): `if (!ov || !news || !menu) return;` → `if (!ov || !menu) return () => { document.body.style.overflow = ''; };`. Drops the `news` requirement; adds a disposer to the early-return path per Fact 1's "every path, including the early return."
3. **Panel construction — Ruling 2** (lines 35-40): the original's single inline `[[news, …], [menu, …]].forEach(...)` becomes a `panels` array built conditionally on `news`'s presence, so the identical `i * 70` stagger formula degrades correctly to "no stagger" for careers' solo panel (see table row 4 above).
4. **Disposer restructuring — Fact 1 / Review Focus 4** (lines 82-85): home's version buries `document.body.style.overflow = ''` inside one specific pushed-cleanup entry (`this.cleanups.push(() => { …; document.body.style.overflow = ''; })`), alongside two `removeEventListener` calls. The port hoists the reset out to the disposer's own final statement, run unconditionally after `cleanups.forEach(...)`, so it's not contingent on that one array entry.

Everything else — `paint()`'s `ov` mutations, the burger-bar transform block, the `set`/`on` helper bodies, the `bg`/`esc` predicates' core logic (module the tautology drop, already in the brief's own draft), the per-link forEach body, and the final `paint()` call — is unchanged.

**Changed-line count:** ~13-15 of shell.ts's 86 lines carry a substantive difference from home's source (the guard + its comment, the panels-array block, the disposer-hoisting + its comment); the rest is either a mechanical porting-rule transform (signature, `this.` removal, TS generics/types — no behaviour change) or verbatim.

## Fidelity diff — `components/ContactPill.tsx` vs. `.source/vendor/contact-pill.js` (81 lines → 152 lines)

1. **Ruling 3's mandated fix** (1 line): `const contactHref = /Contact\.(dc\.)?html/.test(decodeURIComponent(location.pathname)) ? '#top' : 'Arohance%20Contact.html';` → `const contactHref = '/contact';`. This is the only sanctioned *behavioural* change.
2. **IIFE/global guard → component/module guard** (necessary React-lifecycle adaptation, documented in the file's header comment): `if (window.__agFloatNav) return; window.__agFloatNav = true;` → a module-level `let mounted` flag, reset to `false` in the effect's cleanup. Same purpose (block a concurrent double-inject) — original never needed to reset it because a static page never tore the script down; this port can be mounted/unmounted repeatedly across client-side navigation, so the flag must be resettable or a legitimate remount would permanently no-op.
3. **`document.readyState`/`DOMContentLoaded` gate removed entirely.** `useEffect` bodies never run before the DOM exists — there is no browser-script-loading race for a React effect to guard against.
4. **Anonymous inline handlers → named consts** (`onUpEnter`, `onUpLeave`, `onCtEnter`, `onCtLeave`, `onUpClick`, `onLoad`): required so they can be individually removed. The original never removes any listener it adds (a static page is never unmounted); this port can be, so a full `return () => {...}` cleanup block (13 lines, wholly new — no counterpart in source) removes every listener, clears both timers, and calls `wrap.remove()`.
5. **Two TypeScript-only adaptations, no behaviour change:**
   - `inner.querySelector('[data-ag-up]')` / `[data-ag-contact]` gain `as HTMLButtonElement` / `as HTMLAnchorElement` casts (guaranteed non-null — they're queried immediately after we set the exact `innerHTML` string that creates them).
   - `!!(window.matchMedia && matchMedia(...).matches)` → `typeof window.matchMedia === 'function' && matchMedia(...).matches`. This is **not stylistic** — `npx tsc --noEmit` hard-fails on the original form with `TS2774: This condition will always return true since this function is always defined` (confirmed by actually hitting this error on my first type-check run; the DOM lib types `Window.matchMedia` as always-present under this project's `strict: true`). `typeof x === 'function'` is the standard TS-safe feature-detection idiom and is behaviourally identical to `!!x` for every value `x` can take here.

Everything else — every `cssText` string, the injected button/svg/anchor markup, the `finish`/`open`/`check`/`threshold` functions, every Web Animations API keyframe list (including all `offset`/`easing` values), all three animation durations (1150ms/720ms/420ms), both timers (350ms restore-check, 200ms post-load check), and the `min(innerHeight*0.6, 520)` threshold formula — is copied character-for-character, just reformatted (long `+`-concatenated strings split across lines) for readability.

**Changed/added-with-justification line count:** ~39 of 152 lines are new-or-materially-different (JSDoc header ~14, module guard + comment ~6, `'use client'`/import/effect scaffolding ~4, the wholly-new cleanup block ~13, the href fix 1, the `reduce` TS rewrite 1); the remaining ~113 lines are verbatim content (CSS, markup, animation choreography), modulo cosmetic multi-line reformatting of the original's dense single-line string concatenations.

---

## Discrimination proof — scroll-lock test

The brief's Step 6 draft checks only `src.slice(src.lastIndexOf('return () => {'))` — whichever `return () => {` occurs **last** in the file. Since `shell.ts` returns a disposer from two places (the early-return guard, and the full teardown at the end, textually last), that check only ever inspects the *second* one. I proved this concretely rather than just reasoning about it:

```
node -e "… replace the early-return disposer with return () => {}; then run the brief's exact
lastIndexOf-based check against that mutated source …"
→ original vacuous-style check against the SAME bug -> PASS (bug slips through)
```

My replacement test (`lib/behaviors/ssr.test.mjs`) instead finds *every* `return () => {` occurrence, balanced-brace-extracts each one's own body, and asserts each independently resets `body.overflow`. I proved it discriminates by actually breaking and fixing the file and running the real test both times:

1. **Against the bug** — mutated `shell.ts`'s line 25 to `if (!ov || !menu) return () => {};` (early-return disposer emptied, exactly Fact 1's named risk) and ran `node --test lib/behaviors/ssr.test.mjs`:
   ```
   not ok 3 - shell resets the body scroll lock in every disposer it returns, including the early-return guard
     error: 'disposer starting at offset 1377 must reset body overflow, got: {}'
   # pass 2 / fail 1
   ```
2. **Restored** `shell.ts` from a verified-identical backup (`diff` confirmed byte-for-byte match against what I'd written) and re-ran:
   ```
   ok 3 - shell resets the body scroll lock in every disposer it returns, including the early-return guard
   # pass 3 / fail 0
   ```

Fails against the bug, passes against the fix, using the actual test runner both times — not simulated.

---

## Gate output

**1. `node --test lib/behaviors/ssr.test.mjs`**
```
ok 1 - no behaviour references window or document at module scope
ok 2 - AgRuntime is a client component
ok 3 - shell resets the body scroll lock in every disposer it returns, including the early-return guard
# tests 3 / pass 3 / fail 0
```

**2. `npx tsc --noEmit`** — exit code 0, no output.
(First run failed with `components/ContactPill.tsx(71,23): error TS2774: This condition will always return true since this function is always defined.` — fixed per fidelity-diff item 5 above; re-run clean.)

**3. `npm run build`** — succeeded:
```
✓ Compiled successfully in 15.0s
Linting and checking validity of types ...
./lib/liquid-ether.ts — 3 pre-existing warnings (unrelated, vendored, untouched)
./lib/stroke-text.ts — 1 pre-existing warning (unrelated, vendored, untouched)
✓ Generating static pages (4/4)
```
No warnings or errors in any file I touched.

---

## Files changed

- Created: `lib/behaviors/shell.ts`, `components/ContactPill.tsx`
- Modified: `lib/behaviors/index.ts` (added `shell` import/export, inserted into `SHARED` after `nav`), `lib/behaviors/ssr.test.mjs` (added the strengthened scroll-lock test)
- Confirmed untouched: `lib/liquid-ether.ts`, `lib/stroke-text.ts`, `lib/effects.test.mjs`, everything under `tools/`, `package.json`/`package-lock.json` (`git status`/`git diff --stat` all empty)
- Confirmed not created: `components/Nav.tsx`, `components/MenuOverlay.tsx`, `components/Footer.tsx`

## Self-review findings

- **Fidelity:** see diff sections above; every difference traces to a named porting rule, Ruling 2, Ruling 3's href fix, or a documented TypeScript-compile-error workaround. None are silent.
- **Scroll lock:** the disposer resets `body.overflow` on both paths shell.ts can return from — proved by breaking each and re-running the real test, not just by inspection.
- **Careers:** traced step-by-step above; works correctly with no news panel.
- **Discrimination:** proved above with actual `node --test` runs against both the broken and fixed file.
- **Discipline:** no Nav/MenuOverlay/Footer created; no new dependencies (`package.json` diff is empty); vendored effect files and `tools/` untouched (verified via `git status`).

## Issues or concerns (non-blocking)

- While verifying Ruling 1's "different button colours" claim against source, I noticed `lib/behaviors/nav.ts` (Task 5, already reviewed, outside this task's file list) hardcodes `#1A1815` for every nav button on every page. I traced this fully: it is **correct**, not a bug — home's own `initNav` forces every button to `#1A1815` via JS on every scroll tick (overriding its markup's static `#1F1E1C`), so `#1A1815` is the true rendered colour on every page regardless of each page's static default. I'm noting this only because I went looking; it needed no fix and I made none. One real, separate gap I did notice in passing: careers' own bespoke `initNav` also toggles a `data-ag-navcta` ("Open roles") button's `display` on scroll+viewport-width, and the current generic `nav.ts` has no such logic — that's pre-existing, already-reviewed Task 5 scope, not part of my file list (`shell.ts`/`ContactPill.tsx`), and I did not touch it. Flagging for whoever picks up careers' page assembly in a later task, since it may need page-specific handling the way Ruling 1 anticipates for the rest of the shell markup.
- `ContactPill`'s `window.addEventListener('load', onLoad)` will never fire on a page reached via client-side navigation (the browser's single `load` event has already fired earlier in the session) — the component still schedules the listener every mount for fidelity to the source shape, but the redundant post-load safety check it guards only ever fires on an actual hard page load, same as the original. The unconditional 350ms restore-check timer (present on every mount) still covers the "opened mid-scroll" case regardless. Judged not worth deviating from source over.
