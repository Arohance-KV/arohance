# Task 14 Report: whole-site verification and documentation

Branch `feat/nextjs-port`, starting commit `0b1e2d4`. Work done directly
(no subagents dispatched, per instruction). Two commits produced:
`273a909` (test fix) and `48441d8` (README).

## Part 1 — the `unbundle.test.mjs` regression

Confirmed the premise directly before touching anything: `public/images`
has 33 files, `.source/vendor` has 5, `public/fonts` has 11 (font
self-hosting, commit `880d98b`), and `.source/assets.json` has exactly 49
distinct mapped paths (`node -e "...new Set(Object.values(map)).size"` ->
`49`). `33 + 5 = 38 ≠ 49`; `33 + 5 + 11 = 49`. The test's invariant is
correct, it just never learned about the new output directory — exactly as
described, not "pre-existing and unrelated."

Fix (`tools/unbundle.test.mjs`, one assertion):

```diff
   const images = readdirSync('public/images').length;
   const vendor = readdirSync('.source/vendor').length;
-  assert.equal(paths.size, images + vendor,
+  const fonts = readdirSync('public/fonts').length;
+  assert.equal(paths.size, images + vendor + fonts,
     'assets.json distinct paths must equal files on disk');
```

No weakening — still an exact-equality assertion, just counting the right
set of output directories.

**`node --test`: 59/59 pass, 0 fail** (was 58/59; the one prior failure was
this test). Full tail of the run:

```
# Subtest: reported asset count matches files actually written
ok 58 - reported asset count matches files actually written
...
1..59
# tests 59
# pass 59
# fail 0
```

Committed as `273a909`.

## Part 2 — Review Focus items, verified in a real browser

Both verified with an ad-hoc Playwright script (not part of the repo;
written to the session scratchpad, temporarily copied into the repo root
so its bare `import 'playwright'` could resolve against the project's own
`node_modules`, run, then deleted — confirmed gone via `git status`
afterward). Server under test: `npx next start -p 3100` against a fresh
`npm run build` (see Part 4). Both checks ran at 1440x900 and 390x844, in
one script, with the same browser.

### A. WebGL context leak — homepage (ether) <-> Case Study (non-ether)

Ether pages (mount `lib/behaviors/ether.ts`): Home, About, Services.
Non-ether pages: Studio, Careers, Contact, Case Study. Confirmed from each
page's own `*_MODULES` array in `app/*/modules.ts` before choosing targets.

Method: starting from Home, clicked a real always-visible `next/link`
in the page body (`a[href="/case-study"]`, the "See all work" work-card
link) to Case Study, then the Case Study nav-logo `next/link`
(`a[href="/"]`) back to Home, 12 times (24 navigations), reading
`document.querySelectorAll('canvas').length` after each landing.

First raw run had one flaky click (trip 12 of 12 at 1440: the click on the
work-card link, which sits inside a `reveal`-animated section, landed
without navigating — `page.url()` stayed at `/`, so the "case-study"
reading that trip was actually still Home's own canvas, misreported as
`maxCaseStudyCanvases: 1`). Diagnosed by inspecting the recorded URL
alongside the count rather than trusting the count alone; ruled out
`cursor.ts`'s custom-cursor overlay as the cause (it sets
`pointer-events:none` explicitly). Hardened the script to click, then
`waitForURL` on the expected pathname with up to 4 attempts, retrying the
click on timeout, and re-ran twice more. Both hardened runs: **0 click
retries needed** at either width — the original flake doesn't reproduce
once the test properly waits out the reveal animation; it was a test-harness
timing issue, not app behaviour, and is called out here rather than quietly
smoothed over.

Results (hardened runs, reproduced twice):

| Width | Round trips | Canvas count while on Case Study (all 12) | Canvas count while on Home (all 12) | Final canvas count | Console WebGL warnings | Page errors | `<h1>` renders |
|---|---|---|---|---|---|---|---|
| 1440x900 | 12 | 0, every time | 1, every time | 1 | 0 | 0 | "WE MAKE\nYOU\nMAGNETIC." visible |
| 390x844 | 12 | 0, every time | 1, every time | 1 | 0 | 0 | "WE MAKE\nYOU\nMAGNETIC." visible |

Final canvas's own pixel size matched the viewport exactly at both widths
(1440x900 and 390x844 respectively — `canvas.width`/`.height` and
`.clientWidth`/`.clientHeight` all equal to the viewport), i.e. the fluid
sim actually (re)initialized correctly on the last landing, not just an
inert leftover element.

**Verdict: PASS.** The count never grew past 1 across 24 navigations per
width (48 total) — flat, not accumulating. `ether.ts`'s disposer
(`dead = true; dispose?.()`, guarding the async `import()` callback) and
`liquid-ether.ts`'s `renderer.domElement.remove(); renderer.dispose();
renderer.forceContextLoss();` are doing their job; no sign of the ~16-context
cap ever being approached, and zero "too many active WebGL contexts"
console warnings were seen at any point.

### B. Body scroll lock surviving navigation — Home -> Careers via a real menu click

Home mounts `shell` (full version, `SHARED`); Careers also mounts `shell`
(`app/careers/modules.ts`). Method: `[data-ag-menu-btn]` click to open the
menu, confirm the lock engaged, click the real `[data-ag-mlink][href="/careers"]`
menu link, land on Careers, check `document.body.style.overflow` and
actually scroll the destination page.

| Width | Overflow before open | Overflow while menu open | Landed on | Overflow on destination | Computed `overflow-y` on destination | Destination `scrollHeight` vs `innerHeight` | Scrolled to y=800 successfully |
|---|---|---|---|---|---|---|---|
| 1440x900 | `""` | `"hidden"` | `/careers` | `""` (not `"hidden"`) | `"auto"` | 5838 vs 900 | yes (`scrollY` = 800) |
| 390x844 | `""` | `"hidden"` | `/careers` | `""` (not `"hidden"`) | `"auto"` | 5173 vs 844 | yes (`scrollY` = 800) |

(One raw, pre-hardening run also hit the same class of click-timing flake
here — the menu-link click occasionally didn't register as a navigation on
the first try, at 1440 only. Same fix applied: click-and-confirm-URL with
retry. All re-runs after hardening needed 0 retries for both the menu-open
click and the menu-link click, at both widths.)

**Verdict: PASS** at both widths. The lock engages on open and is fully
released on the destination page, which scrolls normally.

**Worth flagging as a nuance, not a problem**: every one of the seven pages
mounts either `shell.ts` or `shellMinimal.ts`, and both call `paint()` once,
synchronously, at mount time with `state = null` — which unconditionally
sets `document.body.style.overflow = ''` regardless of what the *previous*
page did. So in this app's current architecture, the destination page's own
fresh mount would reset the lock even if the source page's disposer were
entirely broken — the disposer's "release unconditionally on unmount"
contract (the comment at `shell.ts:79-85`) and the next page's own initial
paint are two independent, redundant safety nets for the same user-facing
guarantee. I did not attempt to isolate a "disposer-only" failure mode
(e.g. by racing the check inside the same commit) because that's not what
was asked, and this app has no page that omits both mechanisms to test
against — but it means this is a genuinely low-risk area by construction,
doubly, not singly, guarded. No leak or stuck lock found; **not
escalating**, per the "only stop if a real leak/stuck lock is found" rule.

## Part 3 — cross-page navigation sweep

Crawled all seven routes with Playwright, collecting every `a[href]` on
each rendered page (`page.$$eval('a[href]', ...)`), then resolved every
distinct internal target with a real `page.goto()` and checked the response
status.

- **145 total `href` attributes** across the 7 rendered pages: **103
  internal route links**, 35 same-page anchors (`#top`, `#work`, `#contact`,
  `#apply`, `#roles`, `#services`, `#process`), 7 `mailto:` links.
- Cross-checked the 103 figure against a static grep of `app/**/*.tsx`
  (`grep -rho 'href="[^"]*"' app --include="*.tsx"`), which gives **exactly
  96** internal-route `href=` attributes in the converted page source —
  matching the task's stated "96 internal links the converter rewrote"
  exactly. The extra 7 (103 - 96 = 7, one per page) come from
  `components/ContactPill.tsx`'s own hand-authored, imperatively-injected
  `<a href="/contact" data-ag-contact>` (ported from
  `.source/vendor/contact-pill.js`, mounted on all seven pages, and
  explicitly not something `tools/convert.mjs` touches or emits — its own
  doc comment notes the href was hardcoded to the real `/contact` route
  during the port). So: 96 converter-rewritten links (confirmed) + 7
  ContactPill links (confirmed, and covered by the same route check, since
  they all target `/contact`) = 103 rendered link instances, all accounted
  for.
- The 103 internal links collapse to **7 unique route targets**: `/`,
  `/about`, `/services`, `/studio`, `/careers`, `/contact`, `/case-study`
  (including one `/#work` instance, hash stripped before resolving). Every
  one of the 7 returned **HTTP 200**.

**Dead links found: 0.**

Per-page rendered link counts: home 26, about 19, services 21, studio 18,
careers 23, contact 20, case-study 18.

Static prerendering: confirmed via the `npm run build` output (Part 4) —
all seven page routes plus `/_not-found` show `○ (Static)`.

## Part 4 — full gate sweep

**Pre-flight (per instruction, done before any measurement):** unfiltered
process listing (`Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"`
with full command lines) showed six `node.exe` processes, all pre-existing
MCP tool servers (`chrome-devtools-mcp` x3 pairs, `mcp-remote` to a Google
endpoint) — **zero** `next start`/`next dev` among them. Confirmed no
listener on ports 3000-3010 or 4500-4502 either. Removed `.next` entirely
and ran a fully clean `npm run build` before any gate or measurement.
Re-checked the unfiltered process list and the 3000-3010/4500-4502 ports
again after all harness runs completed: clean both times, no leftover
`next start`/`next dev`, no leftover listeners (my own scratch
`next start -p 3100`, used for Part 2/3, was explicitly stopped before the
official gate runs).

### `node --test`

**59/59 pass, 0 fail.**

### `npx tsc --noEmit`

**Clean. Zero output, exit 0.**

### `npm run build`

**Succeeds.** All seven page routes prerender static:

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

○  (Static)  prerendered as static content
```

Warnings: the same pre-existing set documented in `task-13-report.md` —
`no-img-element` on `app/page.tsx`, `app/about/page.tsx`,
`app/services/page.tsx` (intentional `<img>` usages, not `next/image`, for
reasons out of this task's scope), plus pre-existing
`no-unused-vars`/`no-unused-expressions` in `lib/behaviors/reel.ts`,
`lib/liquid-ether.ts`, `lib/stroke-text.ts`. Nothing new.

### `npm run lint`

**Exit 1: 315 problems (47 errors, 268 warnings).** Not clean, but the 47
errors are **100% confined to `.source/vendor/*.js`** — confirmed by
counting error-severity lines above vs. below the line where the file list
switches from `.source/vendor/{gsap,liquid-ether,stroke-text,three}.js` to
real project files; zero errors in `app/`, `lib/`, or `tools/`. The errors
themselves are exactly what you'd expect from running React/TypeScript
lint rules against vendored, non-React third-party bundles: dozens of
`react-hooks/rules-of-hooks` false positives on `three.js`'s own
`useMultisampledRTT` function (its name just happens to start with `use`),
several `@typescript-eslint/no-this-alias` hits on minified `this`-aliasing
patterns, and one config-level `Definition for rule 'compat/compat' was
not found` — none of these are real defects in this project's code.

**Root cause: `eslint.config.mjs`'s `ignores` list has `node_modules/**`,
`.next/**`, `out/**`, `build/**`, `next-env.d.ts` — but not `.source/**`.**
`.source/` is gitignored and entirely tool-generated (by
`tools/unbundle.mjs`), exactly like the directories that already are
ignored, but it was missed. This isn't new: it will reproduce on any clean
checkout the moment someone runs `tools/unbundle.mjs`, which is a
prerequisite for the rest of the toolchain. All warnings in real project
files are the same, already-known, pre-existing set from the build output
above. **I did not fix this** — it's a config change outside what Part 1
authorized, and per this task's own constraint ("report it rather than
fixing the symptom"), I'm reporting it rather than editing
`eslint.config.mjs` unasked. See Concerns below.

### `node tools/compare.mjs 1440`

**Exactly 5 differences, three regression guards all passing.**

```
## home — 1 difference(s)
  - text differs ... "REC · STUDIO A 00:17 / 02:02" vs "00:13 / 02:02" ...
## about — 0 difference(s)
## services — 0 difference(s)
## studio — 1 difference(s)
  - text differs ... "21:03:20 IST" vs "21:05:19 IST" ...
## careers — 0 difference(s)
## contact — 2 difference(s)
  - body background-color differs: original=rgb(19, 17, 16) port=rgb(12, 11, 10)
  - text differs ... "21:03:36 IST" vs "21:05:35 IST" ...
## case-study — 1 difference(s)
  - text differs ... "21:03:46 IST" vs "21:05:45 IST" ...

TOTAL: 5 difference(s) across 7 pages

## Real-element font rendering guard: PASS on all 7 (all deltas 0.0/0.0px)
## html line-height guard: PASS on all 7 ("normal"/"normal")
## Form control guard: PASS on home/about/services/careers/contact
   (font-size/height match exactly, font-family matches); SKIP on
   studio/case-study (no <textarea> on either target — a legitimate skip,
   not a failure)
```

Matches the task's own description exactly: 4 live clock/timer readings
(home's showreel video timer, plus a wall clock on studio/contact/case-study)
and 1 occluded `background-color` on Contact. `compare.mjs` exits 1 because
it flags any nonzero diff count by design — expected, not a real failure,
given the count and category match exactly what's documented as inherent.

### `node tools/mobile-audit.mjs` at 390 and 768

Both widths: **page-overflow = 0 on all seven pages** (the hard gate this
task asked me to confirm).

```
390px summary:
  home: 46 (page-overflow=0 ...)   about: 20 (page-overflow=0 ...)
  services: 27 (page-overflow=0 ...)   studio: 21 (page-overflow=0 ...)
  careers: 21 (page-overflow=0 ...)   contact: 17 (page-overflow=0 ...)
  case-study: 22 (page-overflow=0 ...)
  TOTAL distinct findings: 174

768px summary:
  home: 42 (page-overflow=0 ...)   about: 16 (page-overflow=0 ...)
  services: 23 (page-overflow=0 ...)   studio: 17 (page-overflow=0 ...)
  careers: 20 (page-overflow=0 ...)   contact: 13 (page-overflow=0 ...)
  case-study: 18 (page-overflow=0 ...)
  TOTAL distinct findings: 149
```

The nonzero totals are all in the softer categories the tool itself
distinguishes from page-level overflow: sub-40px tap targets, sub-12px
text, and elements extending slightly past the viewport edge (mostly the
menu/news overlay panels and the custom-cursor dot, which are
intentionally wider/positioned relative to viewport edges by design, not
new). These were already present as of the mobile-responsive task and are
outside what this task asked me to gate on ("zero page-level overflow"),
so I'm reporting them for completeness, not treating them as new failures.

## Part 5 — the README

Replaced (there was, in fact, no `README.md` in the repo at all — not even
the `create-next-app` boilerplate; confirmed via `git log --all -- README.md`,
zero history. The scaffold's own default was apparently discarded along
with the temporary `next-scaffold-tmp/` bootstrap directory `.gitignore`
mentions. Wrote the file the task describes regardless, since a developer
arriving cold needs it either way).

Contents (`README.md`, 124 lines):

1. **What this is** — a Next.js 15 + Tailwind v4 port of the seven root
   `Arohance *.html` files, named explicitly as the design reference that
   must stay byte-identical, with a "never edit them" callout.
2. **Running it** — `npm install`, `npm run dev`, `npm run build && npm run start`.
3. **The tooling** — `tools/unbundle.mjs` (extracts `.source/` + `public/images`
   + `public/fonts`), `tools/convert.mjs <slug>` (emits draft JSX to
   `.source/jsx/`, hand-merged into `app/<slug>/page.tsx`, does not write
   `app/` itself), and the `shoot.mjs`/`compare.mjs`/`mobile-audit.mjs`
   harness — explicitly called out as one-shot/verification, not part of
   `npm run build`/`npm run dev`.
4. **Verifying fidelity** — the exact desktop commands (`shoot.mjs original
   1440 900`, `shoot.mjs port 1440 900`, `compare.mjs 1440`) and mobile
   commands (`390 844` / `768 1024` pairs with `mobile-audit.mjs`), what
   "exactly 5 differences" means (4 live clock/timer readings + 1 occluded
   background-color on Contact) and why each is expected, and what the
   mobile hard gate is (zero page-level overflow) versus the softer,
   already-triaged findings the same report also lists.
5. **The three regression guards** — real-element font rendering guard,
   `html` line-height guard, form control guard — each described with what
   it measures and the specific defect class it exists to catch by name,
   framed by the "five typography defects shipped past code review" context
   the task specified.
6. **Fonts** — self-hosted WOFF2 in `public/fonts/` via `@font-face` in
   `app/globals.css`, with the one-line reason `next/font` was rejected
   (the converted markup references these families by their real CSS
   names everywhere, which only self-hosting under the real name can
   satisfy — confirmed against `app/layout.tsx`'s own code comment
   recording this as a deliberate Task 9 fix-round-4 reversal).

## Files changed

```
 M tools/unbundle.test.mjs   (Part 1 fix — committed 273a909)
?? README.md                 (Part 5 — committed 48441d8)
```

Nothing else touched. The seven root `Arohance *.html` files were never
opened for writing. No application markup, behaviour module, or config
file was changed to make any check pass.

## Issues / concerns to flag

1. **`npm run lint` is not clean** (47 errors), but every one of them is
   inside `.source/vendor/*.js` (vendored third-party bundles, gitignored,
   regenerated by `tools/unbundle.mjs`), not in any file this project
   owns. Root cause: `eslint.config.mjs`'s `ignores` list omits
   `.source/**`, unlike the other generated directories it already
   excludes (`node_modules/**`, `.next/**`, `out/**`, `build/**`). This
   will reproduce on any machine the moment `.source/` exists on disk.
   Recommend adding `.source/**` to that ignore list — a one-line,
   config-only change with no effect on application behaviour — but I did
   not make it myself since Part 4 only asked me to run and report the
   gates, and only Part 1 explicitly authorized a fix.
2. **Part 2's two checks both passed** — no leak, no stuck scroll lock.
   Per instruction I'm not escalating; flagging only the redundant-by-design
   observation above (every page's `shell`/`shellMinimal` resets the scroll
   lock on its own mount regardless of the previous page's disposer) as a
   nuance worth knowing, not a defect.
3. The link sweep surfaced a real, if minor, gap in the task's own "96"
   figure: it's accurate for what `tools/convert.mjs` rewrites, but 7 more
   live links exist via the hand-authored `ContactPill` component, all
   correctly resolving. Not a bug, just worth the coordinator knowing the
   full rendered count is 103, not 96, if that number gets used elsewhere.
4. Two Playwright click-timing flakes were hit and resolved during Part 2
   test *construction* (not app bugs — see Part 2 for the full account);
   the final, hardened script needed zero retries across multiple repeat
   runs at both widths.

---

## Fix round 1

Coordinator re-checked the lint claim, confirmed it was precise (their
own greps had conflated errors with warnings), and asked for two small
finishing touches plus a final gate re-confirmation.

### 1. `eslint.config.mjs`: added `.source/**` to the ignore list

```diff
       "out/**",
       "build/**",
       "next-env.d.ts",
+      // Gitignored, regenerated by `tools/unbundle.mjs` -- third-party
+      // bundles (gsap.js, three.js, ...) we neither wrote nor maintain.
+      // Same category as the generated dirs above; omitting it just
+      // meant React/TypeScript lint rules ran against vendored code that
+      // isn't ours, producing errors that mean nothing (see task-14).
+      ".source/**",
     ],
```

Same treatment as the other generated directories already in that list.
No rule was disabled, no file-specific override added — the vendor code
is simply no longer in scope for a linter that has no business grading
third-party bundles this project doesn't own.

**`npm run lint`: 315 problems (47 errors, 268 warnings) -> 67 problems
(0 errors, 67 warnings).** All 47 errors and 201 of the 268 warnings were
`.source/vendor/*.js` noise; the 67 remaining warnings are the same
pre-existing set documented in Part 4 originally (61
`@next/next/no-img-element` across `app/page.tsx` (41) /
`app/services/page.tsx` (19) / `app/about/page.tsx` (1); 3
`no-unused-vars` + 2 `no-unused-expressions` across
`lib/behaviors/reel.ts` / `lib/liquid-ether.ts` / `lib/stroke-text.ts`;
1 stale `eslint-disable` directive in `tools/shoot.mjs`) — confirmed
unchanged, not newly introduced.

### 2. README: documented the remaining warnings instead of suppressing them

Added a "Lint warnings you'll see" section (after "Fonts"): the
`no-img-element` warnings are deliberate (decorative/fill images —
client-logo grids, animated 3D rail cards — left as plain `<img>`, while
only measurable key visuals got `next/image` with real dimensions); the
rest are unused catch bindings and one dead computation inherited from
near-verbatim ports of the original page scripts, where matching source
exactly was chosen over tidying. Spot-checked a couple of the
`no-img-element` sites directly (`app/page.tsx:250-262`, a `<img
data-hover-img>` client-logo grid sized via `object-contain`/`max-h`, not
fixed dimensions; `app/page.tsx:568-580`, `[data-ag-card]` fill images
inside an animated 3D rail) before writing the note, rather than taking
the characterization on faith. No `eslint-disable` added anywhere.

### Final re-confirmation (fresh `.next`, checked for stray `next start`/`next dev` first — none found, same as Part 4)

- `npm run lint`: **0 errors, 67 warnings**, exit 0.
- `npm run build`: **succeeds**, same 7 routes + `/_not-found` all `○`
  static, same 67-warning set in its own lint step (unaffected by the
  `.source/**` change either way — `next build`'s internal lint step
  never scanned `.source/` to begin with, confirmed by comparing this
  build's warning output byte-for-byte against Part 4's original build
  output: identical).
- `node --test`: **59/59 pass**.

### Files changed this round

```
 M eslint.config.mjs   (add .source/** to ignores)
 M README.md           (add "Lint warnings you'll see" section)
```

Committed as `49e1b33`. Nothing else touched.
