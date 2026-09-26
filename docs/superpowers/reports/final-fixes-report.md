# Final fix wave — report

Branch `feat/nextjs-port`, starting commit `49e1b33`. All 8 items from the
whole-branch review fixed in this wave. Nothing here changes rendered body
output; the `<title>` change (item 5) is the only thing touching served
HTML, and only `<head>`.

---

## 1. Fidelity oracle false-pass race (highest priority) — `tools/shoot.mjs`

**Problem:** `startNextServer` spawns `next start -p 4501`; `waitForHttp`
raced the child's `exit` event against an HTTP probe of the same URL. A
server already listening answers in ~2ms; the child's `EADDRINUSE` exit
takes hundreds of ms to propagate. The probe always won, so a pre-existing
occupant on the port was silently measured as if it were a fresh `next
start`. There was also no check that `.next` was still fresh relative to
source.

**Fix:**

1. `isPortInUse(port)` — binds the port ourselves (`net.createServer().listen(port)`)
   *before* spawning anything. Bind either succeeds (port free, released
   immediately) or fails `EADDRINUSE` (port occupied) — deterministic,
   nothing left to race. Called in `main()` before `startNextServer`; on a
   hit, prints the port number and remediation (`netstat -ano | findstr`,
   `taskkill`) and exits 1 without spawning `next start`.
2. `assertBuildIsFresh()` — compares `.next/BUILD_ID`'s mtime against the
   newest mtime of any file under `app/`, `lib/`, `components/`, `public/`
   (recursive walk, missing dirs contribute nothing). Refuses with an exact
   timestamp comparison and a `npm run build` instruction if source is
   newer. Replaces the old bare `existsSync(.next)` check (a missing
   `BUILD_ID` still fails the same way).

`startStaticServer` (the `original` target) was untouched — it already uses
`server.once('error', reject)`, which is not subject to this race (nothing
calls `waitForHttp` against it).

### Proof 1 — port-in-use guard fires

A 5-line impostor server was started on 4501 (matching the reviewer's own
repro), then `node tools/shoot.mjs port 1440 900` was run against it:

```
impostor listening on 4501
--- now running shoot.mjs port against the occupied port ---
port 4501 is already in use — refusing to start `next start` on it.
Something else is already listening there (maybe a previous run of this script that did not shut down cleanly, or an unrelated server) — measuring it would silently report on whatever that is, not this build. Find and stop it (Windows: `netstat -ano | findstr :4501` to get its PID, then `taskkill /PID <pid> /F`), or free the port some other way, then re-run.
shoot exit code: 1
```

It aborted immediately — no `next start serving...`, no `OK` lines, no
"N/7 captured cleanly". This is the exact transcript the reviewer's own
repro used to get instead: `next start serving http://localhost:4501` →
`OK` × 7 → `7/7 captured cleanly`, exit 0, while measuring the impostor.

### Proof 2 — stale-build guard fires

This one fired for a genuine reason mid-verification, which is itself
corroborating evidence: after a fresh `npm run build`, running `npm test`
(which spawns `tools/unbundle.mjs` inside `unbundle.test.mjs`, rewriting
every file under `public/images/` and `public/fonts/` with fresh mtimes,
same bytes) made the very next `shoot.mjs port` refuse:

```
.next build is stale: .next/BUILD_ID (2026-09-26T16:36:00.035Z) is older than the newest edited file under app/, lib/, components/, public/ (2026-09-26T16:36:56.913Z).
Run `npm run build` again before shooting target=port — otherwise this measures the PREVIOUS build, not your current source.
```

A second, deliberate proof: with a fresh build in place, a scratch file was
created under `app/` (`app/.guard-test.tmp`, later deleted, no trace left —
`git status --short app/` clean afterward) to bump the directory's newest
mtime past `BUILD_ID`, then `node tools/shoot.mjs port 1440 900` was run
again (port free this time):

```
--- scratch file mtime ---
26 September 2026 22:04:14
--- BUILD_ID mtime ---
26 September 2026 22:03:05
--- running shoot.mjs port (port is free, .next is now stale) ---
.next build is stale: .next/BUILD_ID (2026-09-26T16:33:05.281Z) is older than the newest edited file under app/, lib/, components/, public/ (2026-09-26T16:34:14.259Z).
Run `npm run build` again before shooting target=port — otherwise this measures the PREVIOUS build, not your current source.
shoot exit code: 1
```

Both guards independently confirmed. **Finding worth flagging** (not a
loosened guard — reported as instructed): running `npm test` after
`npm run build` can trip the freshness guard on the next `shoot.mjs port`,
because `unbundle.test.mjs` re-runs the real unbundler as part of testing
and touches `public/` even when nothing meaningfully changed. Not a bug in
the guard — it is mtime-correct — just a sequencing note: build last,
immediately before shooting, not before a `npm test` run. Documented inline
here rather than in the README, since it's a one-time verification-order
gotcha, not a day-to-day workflow fact.

---

## 2. `compare.mjs` exit code carries no signal

**Problem:** `if (totalDiffs > 0) process.exitCode = 1;` — but the
known-good state is 5 differences, so a perfect run exited 1. The 5 were
never classified, so "residual == 0" was never actually checked — a human
compared a raw count to a README paragraph.

**Fix:** Classification happens inside `comparePage`, per line, not as a
blanket per-page/per-slug exemption:

- `CLOCK_TEXT = /\d{2}:\d{2}:\d{2} IST/g` and
  `TIMER_TEXT = /\d{2}:\d{2} \/ \d{2}:\d{2}/g` — the exact literal shapes
  `lib/behaviors/clock.ts` and `lib/behaviors/reel.ts` render. A "text
  differs" finding is acceptable **only if** masking both shapes out of
  *both* captured texts makes them equal — i.e. the clock/timer is
  provably the only difference, not just present somewhere on the page.
- A "body background-color differs" finding is acceptable only when
  `slug === 'contact'`.
- Every line is still pushed to `lines`/`diffCount` and still printed
  exactly as before (full list unchanged). A parallel `residualLines`
  only collects the ones *not* marked acceptable.
- New verdict block: prints `N total, M known-acceptable, R residual`,
  lists every residual line by slug if `R > 0` and exits 1; otherwise
  prints PASS. The final line only ever *sets* `exitCode = 1`, never
  resets it to 0 — a prior regression-guard failure (font proofs, html
  line-height, form control) can't be silently cleared by a clean residual
  count.

**Proof — synthetic fixtures** (before running the full Playwright cycle),
covering exactly the scenario the review warned about — a genuine
regression landing on the *same line* as a clock tick:

```
=== Scenario A: known-good shape (expect exit 0) ===
exit code: 0
TOTAL: 5 difference(s) across 7 pages
  5 difference(s) total, 5 known-acceptable (...), 0 residual.
  PASS — every difference is accounted for by the known-acceptable set.

=== Scenario B: genuine regression on about (expect exit 1) ===
exit code: 1
TOTAL: 2 difference(s) across 7 pages
  2 difference(s) total, 1 known-acceptable (...), 1 residual.
*** 1 RESIDUAL (unclassified) DIFFERENCE(S) ...
  - [about] text differs (original 7 chars, port 24 chars, common prefix 4 chars)

=== Scenario C: regression hidden under a clock tick on studio (expect exit 1) ===
exit code: 1
## studio — 1 difference(s)
  - text differs (original 24 chars, port 24 chars, common prefix 4 chars)
  1 difference(s) total, 0 known-acceptable (...), 1 residual.
*** 1 RESIDUAL (unclassified) DIFFERENCE(S) ...
  - [studio] text differs (original 24 chars, port 24 chars, common prefix 4 chars)
```

Scenario C is the load-bearing one: `studio`'s original/port texts differed
in *two* places at once (the clock value, which is acceptable, and an
unrelated word, which is not) inside the same "text differs" line — masking
correctly leaves a residual, so this could never silently pass just because
the page also happens to have a clock.

**Proof — real run**, fresh build, real Playwright capture, both targets,
1440:

```
TOTAL: 5 difference(s) across 7 pages
[... three regression guards, all PASS ...]

## Verdict
  5 difference(s) total, 5 known-acceptable (live clock/timer text on [data-ag-clock]/[data-vt-time]; Contact's occluded body background-color), 0 residual.
  PASS — every difference is accounted for by the known-acceptable set.
```

`echo $?` immediately after: **0**. Exactly 5 differences (home timer,
studio clock, contact clock + background, case-study clock), exit 0.

---

## 3. Generated + hand-augmented pages have no provenance

**Fix:** Each of the seven `app/**/page.tsx` files now opens with a header
comment (before the imports) stating: what it was generated from
(`tools/convert.mjs <slug>` → `.source/jsx/<slug>.jsx`), what the one-time
hand-merge did (only `<img>` → `next/image`; the converter already emits
`next/link`'s `<Link>` for internal anchors, corrected from the old
"swap `<a>` for `next/link`" instruction), and this page's own exact count
of hand-added `max-lg:` classes (verified via a small Node script, not
estimated):

| page | `max-lg:` count |
|---|---|
| `app/page.tsx` (home) | 26 |
| `app/about/page.tsx` | 25 |
| `app/services/page.tsx` | 26 |
| `app/studio/page.tsx` | 19 |
| `app/contact/page.tsx` | 28 |
| `app/case-study/page.tsx` | 18 |
| `app/careers/page.tsx` | 24 |
| **Total** | **166** |

README additions:

- The converter bullet under "The tooling" corrected (no more
  "swap `<img>`/internal `<a>` for `next/image`/`next/link`" — only `<img>`
  is manual) and now points at the new section.
- New **"Changing the converter"** section: explains the 166 count and
  exactly why a blind regenerate-and-paste is dangerous (deletes all
  `max-lg:` classes silently; page still builds; `compare.mjs` still says
  "5 differences, exit 0" because it only ever measures 1440; only
  `mobile-audit.mjs` at 390/768 would show it), then gives the real
  5-step procedure: fix `tools/tw.mjs` → regenerate → diff against the
  committed page → re-apply the responsive variants → re-run both gates.

---

## 4. Stale "broken" comment — `lib/behaviors/video.ts`

The comment said the `data-vt-poster` → `window.__resources` lookup
"always misses and falls back to the literal `assets/*.jpg` string, which
will not resolve." Verified against current source
(`app/page.tsx:305-314`): `data-vt-poster` now holds real paths, e.g.
`data-vt-poster="/images/df2ee54140.jpg"` — `tools/convert.mjs` rewrites
this attribute at conversion time (confirmed in `tools/convert.test.mjs`,
which asserts exactly this rewrite). The regex
(`/^assets\/(.+)\.jpg$/`) only ever matched the old bundle-relative form, so
it no longer matches anything; `.replace()` is a no-op; the real path is
used as-is; all four testimonial posters resolve.

**Fix:** comment rewritten to describe this — regex no longer matches
because the attribute already holds a real path, the `window.__resources`
branch is dead code (the replacer callback only fires on a match) but
harmless, deliberately left for source fidelity, same treatment as other
verbatim-ported dead code in this project (e.g. `reel.ts`'s unread `q`).

---

## 5. All seven routes shared one `<title>`

**Fix:** `app/layout.tsx`'s `metadata.title` is now a template:
`{ default: 'Arohance — Tech & Marketing', template: '%s — Arohance' }`.
Each page exports its own `metadata` with a short title derived from that
page's own `<h1>` or eyebrow label (never invented copy) — Home uses
`title: { absolute: 'Arohance — Tech & Marketing' }` to deliberately bypass
the template (it's already the full brand string; the site's own logo
`alt` text, sitewide).

Verified against the actual prerendered output (`.next/server/app/*.html`)
after a full rebuild:

| route | `<title>` |
|---|---|
| `/` | `Arohance — Tech & Marketing` |
| `/about` | `Small on Purpose — Arohance` |
| `/services` | `Six Disciplines, One Room — Arohance` |
| `/studio` | `A Studio, Not a Supply Chain — Arohance` |
| `/contact` | `Have a Thing Worth Building? — Arohance` |
| `/case-study` | `Case Study: Agasti Realty — Arohance` |
| `/careers` | `Come Make the Whole Thing — Arohance` |

All seven distinct, all site-name-suffixed, all traceable to real on-page
text (h1/eyebrow), no favicon touched or added.

---

## 6. Test suite undiscoverable / red on fresh clone

**Fix:**

- `package.json`: `"test": "node --test tools/*.test.mjs lib/*.test.mjs lib/behaviors/*.test.mjs"`.
  Verified the glob form works even when a shell does *not* expand it
  (Node 22's own `--test` resolves glob args internally) — checked by
  passing the literal, quoted glob strings directly to `node`, and by
  running `npm test` under Windows PowerShell (which invokes scripts via
  `cmd.exe`, no POSIX glob expansion) — both give 59/59.
- README: new "Tests" section naming `npm test`, explaining why the
  fallback (`node --test tools/ lib/`) fails on Node 22, and stating the
  `.source/` prerequisite (`node tools/unbundle.mjs` once, on a fresh
  clone) explicitly, since `tools/unbundle.test.mjs` and
  `lib/behaviors/form.test.mjs` read from it.

---

## 7a. `try/finally` around shell disposers

`lib/behaviors/shell.ts` and `lib/behaviors/shellMinimal.ts`: the final
disposer's `cleanups.forEach((fn) => fn()); document.body.style.overflow = '';`
is now `try { cleanups.forEach(...) } finally { document.body.style.overflow = ''; }`
in both files. Not a live defect today (nothing in `cleanups` can throw —
each entry is a plain `removeEventListener`), but one throwing cleanup
added later would otherwise skip the reset permanently (no recovery but a
reload). Comment explains why `AgRuntime`'s per-module isolation doesn't
already cover this (it isolates different behaviour modules from each
other, not a module's own internal `forEach` from itself).

## 7b. Dead `@theme` block — `app/globals.css`

Confirmed zero usage before deleting: grepped for `color-ag-`/`ag-ink`/
`ag-paper` across the repo — only hits were the block itself and an
unrelated historical planning doc (`docs/superpowers/plans/...md`), zero
hits in any `app/`/`lib/` JSX or CSS. Deleted the `@theme { --color-ag-ink/
-paper/-accent }` block; replaced with a comment explaining it emitted
nothing (Tailwind v4 only emits an `@theme` variable when something
references it) and that its presence implied a design-token system this
codebase deliberately doesn't use. `:root { --ag-accent: ... }` immediately
below — genuinely load-bearing, referenced sitewide as
`var(--ag-accent,#F2600C)` — is untouched and explicitly called out as not
part of this cleanup (different variable name entirely: `--color-ag-accent`
vs `--ag-accent`).

---

## 8. Small, high-value additions

- **`lib/behaviors/ssr.test.mjs`**: the body-scroll-lock guard now checks
  *both* `shell.ts` and `shellMinimal.ts` (previously only `shell.ts`,
  leaving studio/case-study/contact — the three pages that actually mount
  `shellMinimal.ts` — unguarded). Implemented as one test with an inner
  loop over both files, so the suite total stays at 59, not 60. Confirmed
  passing against the new `try/finally` bodies from item 7a
  (`node --test lib/behaviors/ssr.test.mjs` → 3/3).
- **`tools/tw.mjs`**: `escapeValue`'s `_`-for-space substitution now has a
  comment explaining Tailwind decodes `_` back to a literal space inside
  arbitrary-value brackets (why `[font-family:'JetBrains_Mono',monospace]`
  works) — flagged as "not a typo, do not correct."
- **README**: new "Four nav modules, on purpose" section (points at
  `nav.ts`/`navCareers.ts`/`navOnDark.ts`/`navPad.ts`'s own doc comments
  and each page's `modules.ts`); new "Why Next is pinned to 15.5.26"
  section (Next 16 defaults to Turbopack; upgrade path is bump
  deliberately → rebuild → re-run the full harness, not a `^` range); new
  "Forms don't submit anywhere" section (Contact/Careers `preventDefault()`
  + button-text swap + disable, matching the original exactly, no
  backend).

---

## Verification (all re-run after every source edit, final pass below)

Sequence: unfiltered port listing → confirmed clear → `npm run build`
(final, immediately before measuring, with no `npm test` run in between —
see item 1's stale-build finding) → `shoot original 1440` → `shoot port
1440` → `compare 1440` → `shoot port 390`/`mobile-audit 390` → `shoot port
768`/`mobile-audit 768` → `npm test` → `npx tsc --noEmit` → `npm run lint`.

| Gate | Result |
|---|---|
| `node --test` (via `npm test`) | **59/59 pass** |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | **0 errors**, 67 warnings (matches documented baseline exactly, same warnings, no new ones) |
| `npm run build` | 7 routes static (`/`, `/about`, `/careers`, `/case-study`, `/contact`, `/services`, `/studio`) + `/_not-found` |
| `node tools/compare.mjs 1440` | **exactly 5 differences**, all classified known-acceptable, **0 residual, exit code 0** |
| `node tools/mobile-audit.mjs 390` | page-overflow **0** on all 7 pages (149 total soft/non-gating findings, pre-existing, not a gate) |
| `node tools/mobile-audit.mjs 768` | page-overflow **0** on all 7 pages (174 total soft/non-gating findings at 390 — see note below) |

Note: `mobile-audit.mjs` itself exits 1 whenever *any* finding exists,
including the non-gating soft ones (`grand > 0` at line 177) — untouched by
this fix wave (out of scope; only `compare.mjs`'s exit code was item 2).
The pass criterion, per the task brief and the README, is
"page-overflow = 0", which holds for all 7 pages at both widths.

## Files changed

`tools/shoot.mjs`, `tools/compare.mjs`, `tools/tw.mjs`,
`lib/behaviors/video.ts`, `lib/behaviors/shell.ts`,
`lib/behaviors/shellMinimal.ts`, `lib/behaviors/ssr.test.mjs`,
`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`,
`app/services/page.tsx`, `app/studio/page.tsx`, `app/contact/page.tsx`,
`app/case-study/page.tsx`, `app/careers/page.tsx`, `package.json`,
`README.md`.

No dependencies added. No rendered body output changed (verified by the
1440 fidelity gate itself: exactly the same 5 known differences as before
this wave, nothing more). The seven root `Arohance *.html` files were not
touched.

---

## Addendum — re-review follow-up (finding 2 closed)

The re-review independently reproduced 7 of 8 items directly (both guards
live, all seven `<title>`s from real captures, all seven `page.tsx` diffs
pure insertions, the `@theme` deletion confirmed dead in compiled CSS, the
166 `max-lg:` count independently recounted) and confirmed those closed.
One finding remained open: **item 2's background-color classifier was
asymmetric with the text classifier beside it.**

### The gap

`tools/compare.mjs` (pre-addendum): the text path (`maskVolatileText`)
requires the *masked values* to match exactly — rigorous, proven in the
original wave's Scenario C to still catch a regression hidden on the same
line as a clock tick. The background path was `acceptable: slug ===
'contact'` — a bare page-identity exemption with no check on the actual
values. Any future body-background mismatch on Contact, whatever its
value, was swallowed. Compounding it: `bodyBackgroundColor` only ever
measures `<body>`, never the visible `[data-ag-root]` layer painted over
it, so this line was the *only* place such a regression could ever surface
at all — and it wasn't actually checking anything.

### Fix

Re-derived the real values from a fresh, independent capture (not trusting
the re-review's quoted numbers, or my own prior session's) — rebuilt,
re-shot both targets at 1440, read `compare.mjs`'s own printed line:

```
- body background-color differs: original=rgb(19, 17, 16) port=rgb(12, 11, 10)
```

Same pair the re-review quoted — corroborated independently, not copied.
Changed the classifier to:

```js
const acceptable =
  slug === 'contact' &&
  o.bodyBackgroundColor === 'rgb(19, 17, 16)' &&
  p.bodyBackgroundColor === 'rgb(12, 11, 10)';
```

Comment explains why these are fixed design constants (original bundle's
own occluded background vs. `globals.css`'s literal `#0C0B0A`), not
measurements that legitimately vary, and records the `<body>`-vs-visible-
layer measurement gap as a documented, out-of-scope limitation right at
the point where it matters, plus a pointer to the README note.

### Proof it discriminates (mutation test)

Backed up the real captured `port/1440/contact.json`, mutated only its
`bodyBackgroundColor` field (`rgb(12, 11, 10)` → `rgb(50, 50, 50)`), ran
`compare.mjs 1440` unchanged otherwise, reverted, ran again:

```
BEFORE MUTATION (sanity, post-fix, same real captures):
  5 difference(s) total, 5 known-acceptable (...), 0 residual.
  PASS — every difference is accounted for by the known-acceptable set.
  EXIT CODE: 0

before mutation, port bodyBackgroundColor = rgb(12, 11, 10)
mutated to rgb(50, 50, 50)

AFTER MUTATION:
## contact — 2 difference(s)
  - body background-color differs: original=rgb(19, 17, 16) port=rgb(50, 50, 50)
  - text differs (...)
TOTAL: 5 difference(s) across 7 pages   <- total UNCHANGED, still 5
  5 difference(s) total, 4 known-acceptable (...), 1 residual.
*** 1 RESIDUAL (unclassified) DIFFERENCE(S) — not part of the known-acceptable set: ***
  - [contact] body background-color differs: original=rgb(19, 17, 16) port=rgb(50, 50, 50)
EXIT CODE: 1

restored, port bodyBackgroundColor = rgb(12, 11, 10)

AFTER REVERT:
  5 difference(s) total, 5 known-acceptable (...), 0 residual.
  PASS — every difference is accounted for by the known-acceptable set.
TRUE EXIT CODE: 0
```

The total reads 5 in both the acceptable and unacceptable cases — proving
the fix gates on the value pair, not the count, and not merely on
`slug === 'contact'` — exactly the property the re-review asked to be
proven, checked by actually trying to defeat the guard rather than reading
the diff.

### README additions (2 lines requested, delivered as 2 focused paragraphs)

1. **"Tests"** section: `npm test` re-runs the real unbundler, which
   rewrites `public/images/`+`public/fonts/` with fresh mtimes (same
   bytes) — this can trip `shoot.mjs`'s stale-build guard on the very next
   `port` run. Documented as a sequencing note: build immediately before
   shooting; rebuild again if `npm test` ran in between. (This exact
   interaction had previously only been recorded in this gitignored
   report — now it's in the README, where the next person can find it.)
2. **"Verifying fidelity"** section: recorded the `bodyBackgroundColor`
   `<body>`-only measurement scope as a known, out-of-scope harness
   limitation — explicit that a real regression on Contact's *visible*
   background layer would not be caught by this check on either target.

### Re-run full gate sweep (nothing moved)

| Gate | Result |
|---|---|
| `npm test` | 59/59 |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 67 warnings (same baseline) |
| `npm run build` | 7 routes static |
| `node tools/compare.mjs 1440` | exactly 5 differences, 0 residual, **exit 0** |
| `node tools/mobile-audit.mjs 390` | page-overflow 0 on all 7 pages (174 total findings, unchanged from prior wave) |
| `node tools/mobile-audit.mjs 768` | page-overflow 0 on all 7 pages (149 total findings, unchanged from prior wave) |

Files touched this round: `tools/compare.mjs`, `README.md`. No other file
changed. No rendered output affected (background-color classification is
a harness-side verdict computation, not app code).
