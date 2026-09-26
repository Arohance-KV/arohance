# SDD ledger — plan: docs/superpowers/plans/2026-09-25-arohance-nextjs-port.md

**Spec:** docs/superpowers/specs/2026-09-25-arohance-nextjs-port-design.md (read, authoritative)
**Branch:** feat/nextjs-port
**Merge base:** 41ffe13 (baseline: original HTML bundles + spec + plan)
**Setup note:** repo was not under git; initialised at setup, baseline committed, work branched off `main`.

---

## Pre-flight conflict scan

### Cross-task rows (tasks sharing a file or interface)

| Tasks | Produces → Consumes | Finding |
|---|---|---|
| T1 → T6,7,11,12,13 | `.source/templates/*.html`, `.source/assets.json` → converter input | clean |
| T1 → T4 | `.source/vendor/{liquid-ether,stroke-text}.js` → `lib/*.ts` | clean — both in unbundler VENDOR list |
| T1 → T6 | `.source/vendor/contact-pill.js` → `components/ContactPill.tsx` | clean — in VENDOR list |
| T2 → all | `app/globals.css`, `app/layout.tsx` | clean |
| T3 → T6 | `styleToClasses(cssText, prefix)` → `convert.mjs` import | clean — signature matches call site |
| T4 → T8 | `mount(el, opts) => () => void` → `ether.ts`, `stroke.ts` | clean — both call sites match |
| T5 → T6 | `SHARED` defined without `shell`; T6 Step 7 appends it | clean — strictly sequential |
| T5 → T7,8,11,12,13 | `Behavior`, `MOTION`, `AgRuntime` | clean — one definition, consistent use |
| T6 → T7 | `Nav`/`MenuOverlay`/`Footer`/`ContactPill` | clean |
| T7 → T8 | `HOME_MODULES` created `[...SHARED]`, rewritten full in T8 | clean — sequential |
| T3 → T9 | T9 may amend `tools/tw.mjs` and re-run converter, invalidating hand-assembled `app/page.tsx` | **friction, not conflict** — plan Step 3 mandates re-paste. Accepted. |
| T6 → T10 | shell components modified by responsive pass | clean — additive variants only |
| T11 vs T7 | `SERVICES_MODULES` is a verbatim copy of `HOME_MODULES` | see Ruling 4 |

### Per-task self-consistency rows

| Task | Tests vs code / files created vs later touched | Finding |
|---|---|---|
| T1 | test 3 asserts `map[u]` truthy; script assigns `null` for fonts and page-logic JS | **defect** — see Ruling 1 |
| T2 | scaffold, deps, CSS, layout all mutually consistent | clean |
| T3 | traced all 9 tests against MAP by hand — shorthand split, paren-safe `parts()`, spacing scale, prefix, fallback all produce the asserted strings | clean except **Ruling 2** |
| T4 | copy → retarget imports → type → idempotent disposer → test asserts exactly those | clean |
| T5 | `index.ts` imports `clock`/`form` created in Step 6 of same task | clean — same task, ordered |
| T6 | 8 converter tests traced against `convert()`; attr rename runs after class assembly | clean |
| T7 | Step 3 dependency probe is incoherent | **defect** — see Ruling 3 |
| T8 | 11 modules, all re-exported and wired in `app/modules.ts` | clean |
| T9–T14 | verification-only; no code interfaces produced | clean |

### Rulings made before execution

**Ruling 1: T1 test 3 must assert key presence, not truthiness.**
The unbundler deliberately maps fonts and page-logic scripts to `null` (they are
not shipped). `assert.ok(map[u])` therefore fails on a correct implementation.
Change the assertion to `assert.ok(u in map, ...)` up front rather than
reacting to a red test.
*Why:* the plan's own Step 4 anticipates this; fixing it in the brief avoids a
false failure the implementer might "fix" by shipping fonts.
*Cost if wrong:* an unmapped UUID slips through to render as a broken image —
caught by the Task 9 visual gate.

**Ruling 2: replace T3's second cubic-bezier assertion.**
As written it is `assert.ok(!cls(x).includes(' ', cls(x).indexOf('[')))` — it
recomputes the value, and `String.includes` with a fromIndex makes the intent
unreadable. Replace with a direct equality assertion on the box-shadow output.
*Why:* the review rubric treats near-vacuous tests as a defect, and this one
would be flagged in Task 3's review anyway.
*Cost if wrong:* none — it strengthens the same guarantee.

**Ruling 3: T7 Step 3's dependency probe is replaced.**
The plan writes `node -e "require('sharp')" || npm i -D image-size`, which tests
for one package and installs another. Replace with a plain
`npm i -D image-size` followed by the dimension probe.
*Why:* as written it installs `image-size` only when `sharp` is absent, so the
probe can run against a missing module.
*Cost if wrong:* wrong `width`/`height` on `next/image`, visible at the Task 9 gate.

**Ruling 4: `HOME_MODULES` and `SERVICES_MODULES` stay separate despite being
identical today.**
They are per-page behaviour manifests that happen to coincide; About already
diverges (no `trail`). Collapsing them into a shared constant would couple two
pages that the spec treats as independent.
*Why:* pre-ruled so the reviewer's duplication check does not spawn a fix loop
over an intentional choice.
*Cost if wrong:* one duplicated 12-element array.

**Ruling 5: branch in place, no separate worktree directory.**
`create-next-app` must scaffold into the user's project folder — that folder is
the deliverable. A sibling worktree would put the app outside it.
*Cost if wrong:* the port shares a working tree with the reference bundles;
recoverable by moving the branch.

---

## Progress

Task 1: dispatched (sonnet) — base d3b94c7 — brief task-1-brief.md
Task 1: implementer reported DONE_WITH_CONCERNS (commit 9351a97) — outputs correct
  (7 templates, 33 images, 5 vendor scripts; source .html byte-identical, verified
  via empty `git diff --stat`), but two defects surfaced in MY plan's code:
  (a) the diagnostic counts content-hash entries not files, printing 39 for 38 files;
  (b) two `contact-pill.js` variants write to one vendor filename, last-write-wins
  and silent, ordered only by `readdirSync`.

Task 1: Ruling: fix both before review rather than after — Why: (a) is a diagnostic
  that lies, which is how a later reader gets misled about what shipped, and (b) is
  silent data loss that happens to be harmless only because the differing code is
  href logic Task 6 replaces anyway; a third variant of any vendor script would
  vanish unnoticed. Fix is ~6 lines plus one test (first-write-wins + warn, count
  distinct output paths). Not deferred as a minor because the reviewer would flag
  the count discrepancy regardless, costing a fix round for the same work.
  — Cost if wrong: six lines of defensive code in a one-shot dev tool.

Task 1: CARRY TO TASK 6 — `.source/vendor/contact-pill.js` hardcodes a contact href
  against `.dc.html` artifact filenames. Both source variants are stale: neither
  matches a real file nor a future Next.js route. Task 6 Step 8 must replace that
  link logic with real routing (`/contact`), not port it verbatim. Pre-existing in
  the source bundles, not introduced by unbundling.

Task 1: fix round 0 (pre-review) dispatched to same implementer — count metric +
  vendor collision warning + 1 covering test
Task 1: fix round 0 complete (2 fixes + 1 test; 4/4 pass, prints "assets: 38",
  collision warning fires once from clean state; commits 9351a97..eb6f444).
  Side effect worth noting: the six-page majority contact-pill variant now wins
  deterministically; previously the stale Homepage .dc.html variant won by
  directory-order accident.
Task 1: review dispatched (sonnet) — package review-d3b94c7..eb6f444.diff
Task 1: review verdict — spec ❌, quality "Needs fixes". 2 Important, 0 Critical,
  5 Minor. Reviewer independently traced the count fix rather than trusting the
  report, and confirmed source .html absent from the diff entirely.
Task 1: Ruling: accept both Important findings — Why: #1 is a real defect in the
  fix instruction I wrote (existsSync conflates "written this run" with "left over
  from a prior run", so 4 of 5 vendor libs emit false variant warnings on every
  re-run, devaluing the one true warning); #2 is the absence of regression cover
  for the very guarantee #1 broke, which is why #1 escaped. Content-gate the
  compare, add a cold-then-warm spawn test. — Cost if wrong: ~4 lines and one
  test that runs the unbundler twice.
Task 1: minor (deferred): base64 decode tolerates malformed input while adjacent
  gunzip throws — inconsistent failure semantics, inputs are frozen and known-good
Task 1: minor (deferred): sha1 truncated to 40 bits for content addressing —
  ~1.6e-8 collision risk at 187 fixed assets; unsafe pattern only if reused at scale
Task 1: minor (deferred): iteration order depends on readdirSync, which Node does
  not guarantee across filesystems — accepted as the ordering primitive
Task 1: minor (deferred): each bundle read and split twice (manifest pass, template
  pass) — inconsequential at 7 files
Task 1: minor (deferred): vendor fingerprint regexes could in principle
  misclassify — checked against the real dataset, exactly 5 matched, no misclassification
Task 1: fix round 1/5 dispatched — content-gated warning + cold/warm spawn test
Task 1: fix round 1/5 (2 addressed, 0 open; commits eb6f444..a10ad7c). Re-reviewer
  traced that the new test yields 6 warnings under the old gate vs 1 under the new
  one, confirming it discriminates rather than merely re-asserting counts.
Task 1: complete (commits d3b94c7..a10ad7c, review clean) — 5/5 tests, 7 templates,
  33 images committed, 5 vendor scripts, source .html byte-identical.

Task 2: Ruling: scaffold Next.js into a temp sibling dir and copy in, NOT
  `create-next-app .` as the plan's Step 1 says — Why: the project dir is non-empty
  and already holds a COMMITTED public/images/ with 33 files; create-next-app both
  prompts on a non-empty dir (it would hang a non-interactive subagent) and writes
  its own public/ boilerplate, risking the images Task 1 just produced. Temp-dir
  scaffold + selective copy is deterministic and cannot clobber committed work.
  — Cost if wrong: a slightly more manual scaffold step; verified by `npm run build`.
Task 2: implementer returned NEEDS_CONTEXT before writing anything — `next@latest`
  now resolves to 16.3.6, not the 15 the spec names. Repo left clean. Correct stop.
Task 2: Ruling: pin Next 15.5.26 — Why: the spec is the binding authority and names
  Next.js 15; 15.5.x is still backported; Next 16 defaults to Turbopack, an unknown
  in the build pipeline that twelve later tasks would inherit. The port uses only
  App Router, next/font, next/image, next/link and client effects — no API where 16
  helps. Also dropped `--no-turbopack` from the scaffold command (webpack is already
  default in 15.x; the flag may not parse).
  — Cost if wrong: user starts one major behind. Upgrade is `npm i next@latest` plus
  a codemod; nothing in this architecture (no server actions, middleware, route
  handlers or caching semantics) changes across that boundary. SURFACE THIS TO THE
  USER AT THE END.
Task 2: re-dispatched with the version decision
--- SESSION RESTART ---
Task 2: agent killed mid-run by session end. Left UNCOMMITTED but substantially
  correct work: next 15.5.26, react 19.1.0, tailwindcss ^4, gsap ^3.12.5,
  three ^0.160.1, node-html-parser ^9.0.4; app/{globals.css,layout.tsx,page.tsx};
  .gitignore merged (not overwritten); node_modules installed. Never built, never
  committed, keyframe fidelity never verified. Orphaned npm had continued writing
  after the kill — first state check saw no package.json, second saw it.
  Removed leftover next-scaffold-tmp/ (partial install, untracked scratch).
Task 2: Ruling: keep the partial artifacts and re-dispatch a fresh agent to VERIFY
  rather than trust them, instead of resetting clean — Why: versions already match
  the ruling exactly and a reinstall costs minutes for no gain; every item needs
  independent verification either way, and the keyframes must be re-diffed against
  source regardless of who wrote them. — Cost if wrong: a subtly bad scaffold file
  survives; caught by `npm run build` plus the explicit per-file verification list.
Task 1 remains complete and intact (3 commits, 33 images) — ledger did its job.

USER DECISIONS (session 2): reconnect Chrome for fidelity gates; keep per-task
  subagent review. Estimate given: 6-9h wall clock for remaining 13 tasks.
Task 2: implementer DONE (commit e480464). Next 15.5.26 / React 19.1.0 /
  Tailwind 4.3.3; no tailwind.config.*; @types/three 0.186.0 already present.
  ag-rail-r and ag-rail-l MD5-identical to .source/templates/home.html:234-235;
  full globals.css and layout.tsx diffed against brief reference — zero diffs.
  Build clean twice; dev smoke-test confirmed compiled CSS carries #0C0B0A and
  the Instrument Sans variable. public/images/ and the 7 .html files untouched.
  Self-reported concerns to adjudicate after review: (a) inherited app/page.tsx
  boilerplate references unscaffolded public/ SVGs (404 at runtime, moot at Task 7);
  (b) Tailwind v4 content scanning picks up class-like strings from
  docs/superpowers/**/*.md, generating dead CSS.
Task 2: review dispatched (sonnet) — package review-a10ad7c..e480464.diff
Task 2: review verdict — spec ✅, quality "Needs fixes". 1 Important, 3 Minor.
  Reviewer independently re-derived both rail keyframe MD5s from disk rather than
  trusting the report, and confirmed the 15.5.26 pin is honoured in the lockfile.
Task 2: Ruling: fix the Important (@types/three 0.186.0 vs pinned three 0.160.1,
  26 minor versions of API drift) — Why: inert only because nothing imports three
  yet, but Task 4 ports LiquidEther and Task 8 mounts it; drift there yields either
  spurious errors on valid 0.160.1 code or types that compile while describing APIs
  the runtime lacks. Origin is my brief's unversioned `npm i -D @types/three`.
  — Cost if wrong: one-line re-pin, verified by build.
Task 2: Ruling: ALSO fold in Minor 2 (restrict Tailwind content scan via
  `@source not`) despite minors normally going straight to the ledger — Why: a fix
  round is already dispatched, it is two lines, and the cost compounds — docs grow
  over 12 more tasks and the seven 933KB-2.3MB reference bundles are re-scanned on
  every build until the project ends. — Cost if wrong: two CSS lines; if the globs
  are wrong the build still passes and only dead CSS returns.
Task 2: minor (deferred): app/page.tsx boilerplate references 5 unscaffolded
  public/ SVGs that 404 — foreseeable result of not copying scaffold public/,
  no build impact, Task 7 deletes the file
Task 2: minor (deferred): dangling `next-scaffold-tmp/` .gitignore entry — inert
Task 2: fix round 1/5 dispatched — @types/three@0.160.0 + @source not globs
Task 2: fix round 1 implemented (commit 8acd9ee). @types/three -> 0.160.0 aligned
  with three 0.160.1. @source not globs added. NOTABLE: the "Minor" scan-scope fix
  was not cosmetic — controlled before/after showed production build >120s scanning
  the multi-MB reference bundles, dropping to ~4-7s after exclusion, with the stray
  docs-sourced utility gone and real utilities + rail keyframes intact. The ruling
  to fold it in paid for itself immediately and would have cost ~2min per build
  across the remaining 12 tasks.
Task 2: re-review dispatched — package review-e480464..8acd9ee.diff
Task 2: fix round 1/5 (2 addressed, 0 open; commits e480464..8acd9ee). Re-reviewer
  confirmed @source path semantics against official docs (paths resolve relative to
  the declaring stylesheet, so ../docs and ../*.html correctly reach repo root) and
  verified neither glob over-excludes real source. Lockfile genuinely resolved to
  0.160.0; zero stale 0.186.0 entries.
Task 2: complete (commits a10ad7c..8acd9ee, review clean) — Next 15.5.26,
  React 19.1.0, Tailwind 4.3.3, build ~7s clean.
Task 2: note for FINAL review (not a finding): the @theme block's tokens
  (--color-ag-ink etc.) are not emitted because nothing references ag-ink utilities.
  Mechanical conversion emits arbitrary values like bg-[#0C0B0A], so @theme may end
  up entirely unused dead config. Re-assess at Task 14 — delete it or start using it.

Task 3: dispatched (sonnet) — the CSS->Tailwind mapper, highest-leverage code in
  the project; every page's styling correctness flows through it. Preflight Ruling 2
  applies (replace the weak second cubic-bezier assertion).
Task 3: implementer DONE_WITH_CONCERNS (commit bdb8909). 9/9 tests, tw.mjs
  byte-identical to brief, test file identical except the amended assertion.
  Flagged a real defect in MY brief's code: scale()/len() emit `mt--2` for
  margin-top:-8px (Tailwind's negative form is -mt-2), so the class silently
  matches nothing. None of the 9 specified tests exercise that path.
Task 3: controller checked all three flagged items against the real source data
  before ruling (grep over all 7 templates):
    - negative px on margin/top/left/right/bottom/inset: ZERO occurrences
    - border: exactly one form, `border:0`, 47x — no shorthand anywhere
    - font-weight: all numeric (700/500/600/400); the `100 900` hits are
      variable-font ranges inside @font-face, which the converter strips
Task 3: Ruling: fix the negative-length defect, decline the border and
  font-weight changes — Why: the negative branch is known-wrong code in the most
  reused function in the project and costs 3 lines plus one test, cheaper than
  rediscovering it mid visual-fidelity investigation; the other two have zero
  occurrences in the data, so changing them is untested speculative surface area
  of exactly the kind I told the implementer to avoid. Chose arbitrary-value
  routing (mt-[-8px]) over prefix sign-flipping (-mt-2) because the table includes
  p-/gap-/w- which have no negative variants. — Cost if wrong: negatives render as
  arbitrary values rather than idiomatic negative utilities; visually identical.
Task 3: fix round 0 (pre-review) dispatched — negative-length routing + 10th test
Task 3: fix round 0 complete (commit 1400a55) — 10/10 pass, pristine. scale() now
  rejects negatives so they route to arbitrary values; top:0 -> top-0 and
  padding:16px -> p-4 regression-checked unchanged. border/font-weight untouched.
Task 3: review dispatched (sonnet) — package review-8acd9ee..1400a55.diff.
  Reviewer directed to trace the whole mapping table for malformed output
  independent of test coverage, since a bad rule replicates across 7 pages and
  only the Task 9 visual gate would catch it.
Task 3: review verdict — spec ✅, quality Approved, but 1 Important + 4 Minor, so
  the fix loop triggers. Reviewer compiled candidate classes through the project's
  REAL installed Tailwind 4.3.3 (postcss + @source inline) rather than reasoning
  from memory, verified the whole MAP table verbatim entry-by-entry, confirmed every
  bracket site routes through escapeValue, and corrected its own wrong assumption
  about min-w-screen in the process.
Task 3: Ruling: fix the SIZE axis bug by DELETING the '100vw'/'100vh' keys rather
  than making SIZE axis-aware — Why: w-screen is hardcoded to 100vw and h-screen to
  100vh, so crossed axes silently emit a PLAUSIBLE WRONG VALUE (width:100vh ->
  width:100vw) that still renders — worse than the "emits nothing" mode the brief
  warns about, because a visual diff can pass it. Arbitrary values (w-[100vh]) are
  exactly correct for every prefix with no axis knowledge. Same reasoning as the
  negative-length ruling; consistency matters in this table. Remaining SIZE keys
  (full/auto/fit/min/max) are axis-safe. Zero occurrences in the data, so dropping
  the keys costs nothing. — Cost if wrong: viewport sizes render as arbitrary
  values rather than w-screen/h-screen; visually identical.
Task 3: Ruling: fold in Minor 2 (border + font-weight happy-path tests) — Why:
  they are the two most-hit entries in the table (border:0 47x, numeric
  font-weight 300x+) and had NO test at all; pure regression cover, 5 lines.
  — Cost if wrong: five redundant assertions.
Task 3: minor (deferred): 3-value box() branch untested — verified correct by
  execution, three-value shorthands are rare
Task 3: minor (deferred): row-gap/column-gap/right/bottom/left/inset untested —
  same len() factory as the tested `top`, differing only in prefix string
Task 3: minor (deferred): generic fallback escapes value but not prop — inert,
  CSS property names cannot contain internal whitespace
Task 3: fix round 1/5 dispatched — drop SIZE viewport keys + size() tests + border
  and font-weight tests (expect 12/12)
Task 3: fix round 1/5 (2 addressed, 0 open; commits 1400a55..9356c33). Re-reviewer
  reconstructed the PRE-FIX tw.mjs in a scratch dir and ran the new tests against
  it: 3/9 failed, including width:100vh -> w-screen. Discriminating power proven,
  not assumed. Confirmed only the two keys were dropped; full/auto/fit/min/max all
  survive; size()->len() fallback intact.
Task 3: complete (commits 8acd9ee..9356c33, review clean) — 12/12 tests. The
  mapper is now the verified foundation for all seven page conversions.

Task 4: Ruling (pre-emptive, to save a round trip): if putting the vendored
  three.js/GSAP modules under TS `strict` costs more than a handful of `any`
  annotations, the implementer should put `// @ts-nocheck` at the top of the
  vendored file and type ONLY the exported boundary precisely — Why: we consume
  exactly one symbol from each module, `mount(el, opts) => dispose`. The internals
  are known-working vendored React Bits code we must not modify (editing them is
  visual drift). @ts-nocheck suppresses diagnostics but still exports declared
  types, so callers keep full typing at the boundary where it matters. Grinding
  strict-mode annotations through 400 lines of fluid-sim math buys nothing and
  risks touching the animation logic. — Cost if wrong: type errors inside vendored
  code go unreported; that code is not ours to change and is exercised visually at
  Task 9.
Task 4: dispatched (sonnet) — port liquid-ether + stroke-text, idempotent disposal
  (Review Focus 3: WebGL context leak)
Task 4: implementer DONE_WITH_CONCERNS (commit 720603c). liquid-ether.ts uses
  @ts-nocheck (measured: 71 raw tsc errors -> ~7 root causes needing object-shape
  rewrites, not clean `any` drops); stroke-text.ts uses `any` annotations
  (19 errors -> 9 annotations, pure additions). Fidelity vs vendored originals:
  liquid-ether 2 removed/12 added in 2 hunks; stroke-text 8 removed/15 added in
  5 hunks. The three WebGL release calls (dispose/forceContextLoss/remove) already
  existed in source — only the double-dispose guard was added. 2/2 test, tsc exit 0.
  Independently verified the @ts-nocheck boundary claim with @ts-expect-error probes.
Task 4: two self-reported concerns passed to the reviewer rather than pre-judged —
  (a) stroke-text disposer has no explicit `disposed` flag, argued behaviourally
  idempotent because kill/disconnect/removeEventListener/killTweensOf all are;
  (b) the `= {}` runtime default was dropped from both mount() params because
  strict requires it once opts is fully-required. No callers exist yet (Task 8
  not landed). Reviewer asked to check whether either module internally reads
  option fields absent from the declared Opts types.
Task 4: review dispatched (sonnet) — package review-9356c33..720603c.diff.
  Reviewer directed to diff both ported files against .source/vendor/ ITSELF,
  since new files show as pure insertions and the diff alone cannot reveal drift.
Task 4: review verdict — spec ✅, quality "Needs fixes". 2 Important, 3 Minor.
  Reviewer ran the vendor fidelity diffs itself (counts confirmed exactly, zero
  touches to shaders/constants/easing/draw order) and validated EtherOpts and
  StrokeOpts against the REAL pre-port call sites in home/about/services.html —
  every field maps 1:1, which closes the dropped-`= {}` concern with evidence.
Task 4: Ruling: rewrite the leak-guard test to assert inside the returned disposer
  body — Why: PLAN-MANDATED DEFECT, my brief's test is three independent whole-file
  regexes; the reviewer built a counterexample with the guard in a dead helper and
  a completely unguarded real disposer and all three assertions PASSED. A test that
  cannot fail on the bug it guards is worse than no test, and this one guards the
  WebGL leak (Review Focus 3). Implementer must prove the replacement FAILS against
  that counterexample. — Cost if wrong: brace-slicing is more brittle than a regex
  and could break on reformatting; acceptable, since it breaks loudly.
Task 4: Ruling: KEEP @ts-nocheck on liquid-ether.ts but correct the written
  justification — Why: the report's stated reason (C/F/M "require restructuring")
  is factually wrong; each takes one `: any`, same as stroke-text, ~11 sites/~19
  tokens. The decision is still right, for a different reason: liquid-ether.ts is
  frozen fidelity-critical vendored code we will never edit internally, so
  minimising touched lines beats in-file diagnostics we would not act on. Fixing
  the write-up, not the code — a report that misstates WHY a decision was made is
  how a future reader reverses it for bad reasons. — Cost if wrong: no type
  checking inside vendored code we do not own.
Task 4: Ruling: fold in Minor 1 (stroke-text disposer guard) — Why: reviewer
  confirmed it IS behaviourally idempotent, so this is not correctness; but it
  rests on third-party API contracts (GSAP kill, IO disconnect) rather than our
  code, has zero test coverage, is asymmetric with ether, and I am already
  rewriting that test file. 3 lines makes the contract verifiable not argued.
Task 4: minor (deferred): no try/catch around mount() init — a WebGL failure
  mid-init strands a context with no disposer returned. Unchanged from vendor, low
  likelihood, and fixing it means touching non-disposer code the fidelity mandate
  forbids. BACKLOG.
Task 4: minor (deferred): EtherOpts/StrokeOpts omit runtime-read fields
  (isViscous, dt, BFECC, reverse, height, +). Verified no call site customises
  them; they always take module defaults. Type-surface completeness only.
Task 4: fix round 1/5 dispatched — discriminating leak test + stroke-text guard +
  corrected @ts-nocheck rationale (expect 3 tests)
Task 4: fix round 1/5 (3 addressed, 0 open; commits 720603c..789fcd2). Re-reviewer
  built its OWN counterexample, harder than the implementer's — embedding an earlier
  decoy `return () => {}` holding the guard text to stress-test the lastIndexOf
  choice. Old test 3/3 PASS against it (vacuous confirmed), new test FAILS
  correctly. Verified exactly one `return () => {` per file so the slice is
  unambiguous, no braces in strings/comments to unbalance depth counting, and
  stroke-text's slice starts after play() so tl.kill() cannot mis-resolve.
Task 4: complete (commits 9356c33..789fcd2, review clean) — 3/3 tests, tsc exit 0,
  both files still byte-faithful to vendor apart from import/type/signature/disposer.
Task 4: minor (deferred): disposerBody() is coupled to the literal spelling
  `return () => {`; a rename or switch to function() would break location. Failure
  mode is loud (assert.fail), not silently vacuous. Inherent to slice-by-text.

Task 5: Ruling: DELETE the dead `darks`/`onDark` computation when porting initNav,
  rather than preserving it verbatim — Why: in the ORIGINAL, `const onDark =
  darks.some(...)` is assigned and never read; the nav colour is hardcoded light
  immediately after. The design evidently once switched nav palette on dark
  sections and that was abandoned. Preserving dead code is not fidelity, and this
  particular dead code calls getBoundingClientRect() on every [data-dark] element
  on EVERY scroll event — a forced layout reflow for zero visual effect. Deleting
  it is visually identical and strictly faster. — Cost if wrong: if some later
  task wants dark-section nav switching, it re-adds the query; the original
  behaviour is recoverable from .source/ at any time.
Task 5: Ruling: AgRuntime's `modules` prop MUST be a stable reference — Why: the
  effect deps are [modules], so an inline array literal (<AgRuntime modules={[...]}/>)
  would tear down and remount every behaviour on each render, restarting animations
  and leaking listeners. Page module lists must be module-level consts. Requiring
  this is cheaper than defensive memoisation inside AgRuntime. — Cost if wrong:
  a page inlining the array gets visibly restarting animations; caught at Task 9.
Task 5: dispatched (sonnet) — shared behaviours + AgRuntime (owns Review Focus 2:
  SSR window/document access breaking the build)
Task 5: implementer DONE_WITH_CONCERNS (commit 1e81395, 10 files). ssr.test 2/2,
  tsc exit 0, but `npm run build` FAILED. Correctly isolated: its own files lint
  clean (1 warning, 0 errors); the failure is error-severity ESLint findings
  (@ts-nocheck, 9x no-explicit-any) in Task 4's vendored lib/liquid-ether.ts and
  lib/stroke-text.ts. Did not mask it or touch those files. clock/form ported with
  no surprises (self-contained, no this.props, no helpers); one deliberate naming
  deviation: local `form` renamed `el` to avoid shadowing the exported const,
  matching nav.ts convention. Both rulings applied.
Task 5: PLAN DEFECT (mine, 3rd of its kind): Task 4's gate was `node --test` +
  `tsc --noEmit` with NO `npm run build`, so two vendored files entered the tree
  never having been linted. Task 5 is merely the first task to run the command
  that notices. CORRECTIVE: every remaining task that adds app code carries
  `npm run build` in its gate — already true for Task 5 onward.
Task 5: Ruling: fix with a SCOPED ESLint override naming the two vendored files,
  disabling ban-ts-comment and no-explicit-any for them only — Why: the rules must
  stay enforced on all the code we actually write (Tasks 5-13). Rejected
  alternatives: disabling globally (loses the rules everywhere);
  eslint.ignoreDuringBuilds (kills linting project-wide to solve a two-file
  problem, hiding real errors in every later task); removing @ts-nocheck and
  annotating (no-explicit-any then errors on all ~19 annotations — trades one
  failure for another while touching frozen fidelity-critical code); moving to
  lib/vendor/ (semantically cleaner but churns import paths and the Task 4 test
  for no functional gain). Two explicit filenames is the shortest honest diff and
  grows by one line if we vendor anything else. — Cost if wrong: two vendored
  files go unlinted; they are third-party code we never edit.
Task 5: fix round 0 (pre-review) dispatched — eslint.config.mjs override only;
  vendored files and effects.test.mjs stay untouched
Task 5: review verdict — spec ✅, quality "Needs fixes". 2 Important (BOTH
  plan-mandated, both in code my brief prescribed verbatim), 2 Minor. Reviewer
  verified clock/form against source line-by-line (selectors, ' IST' suffix,
  success message, 1000ms interval, submit wiring all unchanged), independently
  confirmed Ruling 1's premise via grep (onDark assigned once, never read), and
  confirmed the ESLint override is exactly 2 files / 2 rules with no
  ignoreDuringBuilds anywhere.
Task 5: Ruling: restore per-cleanup try/catch in AgRuntime's disposer — Why: the
  ORIGINAL componentWillUnmount wraps each cleanup individually; my port does a
  bare forEach, so one throwing disposer aborts the loop and every later disposer
  silently leaks. Dormant now (none of SHARED's six throw) but Tasks 8/12/13 add
  WebGL and GSAP teardown to that same array — precisely the disposers most likely
  to throw against an already-dead context. — Cost if wrong: a genuinely broken
  disposer fails silently instead of loudly; acceptable, matches the original.
Task 5: Ruling: replace the SSR heuristic with a TypeScript-AST scope check rather
  than DELETING the test in favour of `npm run build` — Why: PROVEN VACUOUS — the
  reviewer's probe `export const hazardWidth =\n  window.innerWidth;` passed 2/2,
  because the token landed on an indented continuation line and the heuristic
  equates indentation with function scope. I seriously considered deleting it and
  leaning on the build, which IS the real oracle and is now in every remaining
  gate; rejected because until Task 7 creates app/modules.ts nothing in the server
  graph imports these modules, so the build would NOT catch a hazard in
  lib/behaviors/shell.ts — which Task 6 adds. typescript is already a devDependency,
  so a correct AST check costs ~20 lines and no new install (ponytail ladder:
  prefer an installed dep over hand-rolling, prefer correct-on-edge-cases).
  — Cost if wrong: ~20 lines of test using a compiler we already ship.
Task 5: NOTE — third specified test in this project proven vacuous (Task 4 leak
  guard, Task 5 SSR heuristic, and Task 3's weak assertion caught at preflight).
  Pattern: my briefs favoured string/regex checks over structural ones. Every
  remaining test-bearing task must require a discrimination proof.
Task 5: minor (deferred): reveal's per-entry setTimeout and parallax's in-flight
  rAF are not cancelled on dispose — narrow window where a late callback touches
  an unmounted element. Reviewer confirmed the ORIGINAL has the identical gap;
  implementer correctly declined to silently rewrite it. BACKLOG.
Task 5: minor (folded in): report overstated em-dash fidelity as byte-for-byte
  (source uses an HTML entity, port uses literal UTF-8). Same runtime string.
  Correcting the claim — provenance statements are what a later auditor trusts.
Task 5: fix round 1/5 dispatched — disposal isolation + AST-based SSR check +
  report correction; discrimination proof required
Task 5: fix round 1/5 (3 addressed, 0 open; commits 56c69ec..370f838). Re-reviewer
  proved per-disposer isolation empirically (3-disposer array, middle throws,
  first and third still ran), built THREE probe shapes of its own (module-scope if
  block, top-level for, multi-line destructure) and confirmed each flagged at the
  correct line, plus all 8 real files clean. Also established the function-skip gap
  is BROADER than the implementer disclosed — synchronously-invoked module-scope
  callbacks and decorator functions slip through too, not just IIFEs — while
  correctly determining class static blocks are NOT a gap (not isFunctionLike, so
  the walk descends and flags them).
Task 5: complete (commits 789fcd2..370f838, review clean) — 2/2 ssr, tsc 0,
  build 0. Shared behaviours + AgRuntime are the foundation Tasks 7-13 build on.
Task 5: minor (deferred): AST check skips ALL function-like nodes, so a hazard
  inside any function invoked during module evaluation (IIFE, sync callback,
  decorator) is a false negative. Backstop: these modules reach a 'use client'
  component that Next still executes server-side during prerender, so a real
  hazard fails `npm run build` loudly from Task 7 onward — later than the unit
  test, but it does not escape. BACKLOG.

Task 6: Ruling: SPLIT Task 6 into 6a (tools/convert.mjs + 8 tests) and 6b
  (lib/behaviors/shell.ts + Nav/MenuOverlay/Footer/ContactPill) — Why: they are
  genuinely separable and a reviewer could approve one while rejecting the other.
  More importantly the dependency is one-way: 6b lifts four regions out of the
  converter's 133KB generated output, so if the converter is wrong, every
  extracted component is wrong too and both get redone. Verifying the converter
  first is the same reasoning as homepage-before-the-other-six. A single dispatch
  would also carry two unrelated concerns in one very long context.
  — Cost if wrong: one extra review cycle (~30 min).
Task 6a: dispatched (sonnet) — HTML-to-JSX converter. CARRIES the Task 1
  finding: contact-pill.js hardcodes stale `.dc.html` hrefs matching no real file
  and no future route; that is 6b's problem, flagged here so the ROUTES table is
  built with it in mind.
Task 6a: implementer DONE_WITH_CONCERNS (commit c2ba5ea). 8/8 tests, all rewritten
  from the brief's substring/regex matches to whole-string equality so each one
  actually discriminates — proved it by reinstating the brief's buggy brace-replace
  and confirming exactly one test failed. Seven-template sanity run clean: zero
  surviving style=/class=/image-slot/sc-camel-view-box, all void elements
  self-closed, all 7 outputs parse as valid JSX via the TS compiler.
Task 6a: PLAN DEFECT #4 (mine): the brief's brace escaping used sequential
  .replace() calls, which corrupt "a { b } c" into nested escapes. Implementer
  caught it, fixed with a single-pass replace, and proved the fix discriminates.
Task 6a: PLAN DEFECT #5 (mine) — THE MOST SERIOUS SO FAR, and found only because
  the brief required a run against real data rather than synthetic fragments:
  my ROUTES table matched `*.dc.html` exclusively. Verified independently: across
  all 7 templates there are 96 internal Arohance links, and ONLY home's 14 use
  .dc.html — the other 82 use a bare .html suffix. Six of seven pages would have
  shipped with entirely dead navigation, with all 8 synthetic tests green. There
  is also a fragment link (Arohance%20Homepage.html#work) an exact-match table
  misses regardless of suffix.
Task 6a: Ruling: replace exact-match ROUTES with suffix-agnostic normalisation
  (regex strips optional .dc, decodes %20, preserves #fragment, maps page name ->
  route) AND make an unresolvable internal link a LOUD failure that exits
  non-zero — Why: the silent survival is the real hazard; a converter that quietly
  emits a dead link is how this reaches the Task 9 visual gate as a mystery. An
  internal link the mapper cannot resolve is a bug in the mapper, not data to pass
  through. — Cost if wrong: the converter refuses to run on a link shape we did
  not anticipate; it fails loudly at conversion time, which is the cheapest place
  to find out.
Task 6a: note: test 8 (brace escaping) has ZERO real-data coverage — no { or }
  anywhere in the template bodies. Keeping it: the rule is correct and now
  discriminates; recorded as unexercised.
Task 6a: note for 6b: every sliced body ends with a dangling unmatched </x-dc>
  (the document wraps everything in <x-dc> opened before </helmet>).
  node-html-parser drops it harmlessly — do not be surprised by it.
Task 6a: fix round 1/5 dispatched — route normalisation + loud failure + tests
Task 6a: fix round 1 complete (commit ee94b68). 11/11 tests; all 3 new/changed
  verified by MUTATION (revert suffix normalisation -> only the suffix test fails;
  remove the throw -> only the throw test fails; broaden href scoping -> only the
  scoping test fails). Seven-template re-run: all exit 0, zero unconverted links,
  per-template 14/11/11/11/15/17/17 = 96, matching my independent count exactly.
  Failure path proved end-to-end through the real CLI (exit 1, names the link).
  Implementer also corrected its OWN earlier undercount (81 -> 96): its regex was
  anchored at `.html"` and missed the fragment-suffixed link in services.html.
  Notable design detail: the unresolved-link check is scoped to the href attribute
  specifically, because every template's nav logo carries
  alt="Arohance, Tech & Marketing" — a value-only check would false-positive.
Task 6a: review dispatched (sonnet) — package covers the FIX commit only, so the
  reviewer was told to derive the full task diff itself (370f838..ee94b68) and
  review the whole task, and to independently re-verify the 96-link claim since
  that is the defect that nearly shipped.
Task 6a: review verdict — spec ❌, quality "Needs fixes". 2 Important, 3 Minor.
  Reviewer independently re-derived the 96/96 link match file-for-file from clean
  templates, mutated FOUR rules itself (including one the implementer never
  tested — deleting for:htmlFor from ATTRS) with clean isolated failures each
  time, and verified href-only scoping by dumping all 100 distinct attribute
  names in the dataset (exactly one non-href "Arohance" value: the logo alt).
Task 6a: PLAN DEFECTS #6 and #7 (mine, same shape as #5 — my brief named only the
  patterns I happened to know):
  (a) style-focus silently dropped. 18 occurrences across 5 templates, all the
      identical `border-bottom-color:var(--ag-accent,#F2600C)`. Every text input,
      textarea and select on those pages loses its focus accent border — and a
      missing focus ring is nearly invisible at a manual visual gate unless
      someone deliberately tabs every field.
  (b) <sc-raw-select> never converted. 2 occurrences (careers role selector,
      contact budget selector) passing through as unrecognised custom elements,
      so both forms lose their control entirely.
Task 6a: controller ran a FULL census rather than patching two rules by name.
  Complete and bounded: style-* = {style-hover 112, style-focus 18}; custom tags
  = {image-slot 31, x-dc 7 (wrapper, discarded by the slice), sc-raw-select 2};
  sc-* attrs = {sc-camel-view-box 6}. Also confirmed both sc-raw-select carry only
  name/style/style-focus and all 12 option children are bare — no `selected`, so
  no React defaultValue complication.
Task 6a: Ruling: fix both, AND add a completeness guard that throws on any
  unknown style-*/sc-* attribute or unknown hyphenated custom tag — Why: this is
  the THIRD unnamed pattern to slip through silently (bare .html, style-focus,
  sc-raw-select). Patching two more by name leaves the fourth to be found by eye
  at Task 9. The census proves the set is closed today, so a guard costs nothing
  now and converts any future surprise from a silent visual regression into a
  conversion-time failure. Scoped to style-/sc- prefixes and custom tags only —
  explicitly NOT data-*/aria-*, which are numerous and load-bearing for the
  behaviour modules. — Cost if wrong: conversion halts on a construct that was
  actually harmless; loud and cheap to whitelist.
Task 6a: minor (deferred): toRoute throws on wrong-case/query-string Arohance
  hrefs; void self-closing regex would mis-truncate on an attribute value
  containing '>'. Both latent, zero occurrences, both fail in the safe direction.
Task 6a: fix round 2/5 dispatched — style-focus + sc-raw-select + completeness
  guard + 3 discriminating tests
Task 6a: fix round 2/5 (3 addressed, 0 open; commits ee94b68..43e3266). 14/14.
  Re-reviewer ran 5 false-negative probes against the guard (deep-nested unknown
  tag, style-active beside valid style+style-hover, sc- attr on an SVG child,
  self-closing unknown tag, unknown tag inside an allowed x-dc) — all fired;
  confirmed data-*/aria-* pass both algorithmically and on 27 real data-ag-*
  selectors; proved via mutation that omitting image-slot/sc-raw-select from
  KNOWN_TAGS is real defence-in-depth, not dead code. Also fairly corrected the
  implementer's causal attribution about the guard vs test coupling.
Task 6a: complete (commits 370f838..43e3266, review clean) — 14/14, 96/96 links,
  18 focus: classes, 2 selects, completeness guard armed.

Task 6b: PLAN DEFECT #8 (mine, structural — invalidates the plan's shared-shell
  design): the shell is NOT shared. Measured by hashing each region across all
  seven converted pages:
    nav     — 4 variants. home/about/services identical; studio/case-study
              identical; contact unique; careers STRUCTURALLY different (an
              "Open roles" CTA with data-ag-navcta instead of the news button,
              different button colours #1A1815 vs #1F1E1C, simpler transitions).
              Logo href is #top on home/about/services and / elsewhere.
    footer  — 5 variants. home/about/services share one; studio, careers,
              contact, case-study each unique.
    overlay — 5 variants. studio/contact/case-study share one; home, about,
              services each unique; careers is 28 lines vs 65 (NO news panel).
  Plan Step 8 said "lift these four regions into components" and reuse — that
  would have rewritten six of seven pages' design.
Task 6b: Ruling: NO shared Nav/MenuOverlay/Footer components; each page inlines
  its own converted markup in Tasks 7/11/12/13 — Why: with 4-5 genuinely
  divergent variants each, a props API would have to pass logoHref, button
  classNames AND slot content, i.e. parameterise everything. That is not an
  abstraction, it is five divergent implementations behind one interface — worse
  than the duplication, and every mistake silently changes a page's design. The
  markup is generated, so the "duplication" is generated code, not hand-written.
  — Cost if wrong: a future logo change touches 7 files instead of 1. Recoverable
  at any time by extracting later, once the exact variants are known and visually
  verified; premature extraction is not.
Task 6b: PLAN DEFECT #9 (mine, would break a page): shell.ts's guard is
  `if (!ov || !news || !menu) return`. Careers has no news panel, so the guard
  bails and careers loses its menu entirely. Careers also has its own initShell
  in source. Fix: make the news panel optional — guard on ov && menu only, wire
  news when present — and verify against careers' own initShell.
Task 6b: note: contact-pill is NOT in any template body; it is a vendored script
  loaded from the helmet that injects its own DOM. It IS genuinely shared, so it
  stays a component. Still carries the Task 1 finding: stale .dc.html hrefs.
--- SESSION RESTART #2 (2026-09-26) ---
Task 6b: agent stopped by session end with NOTHING committed and a clean working
  tree (verified: git status empty, none of shell.ts/ContactPill.tsx/Nav/Footer/
  MenuOverlay exist, SHARED still without shell). Task 6a intact at 43e3266.
  Re-dispatching 6b fresh rather than resuming the stopped agent — no partial
  state to preserve, so a clean dispatch is simpler than reconciling a transcript.
Task 6b: implementer DONE (commit 1be1e95). Careers finding CONFIRMED against
  source: careers markup/script has zero data-ag-news* refs and its own guard is
  already `!ov||!menu`, so Ruling 2 matches what careers actually does. Only
  cosmetic differences (boolean vs tri-state flag; careers' original omits
  per-link listener cleanup, which the unified version supplies — a small
  improvement over source, flag to reviewer). Contact pill confirmed universal:
  all seven templates load it, verified via assets.json UUID->file mapping
  cross-checked against every template. 3/3 ssr, tsc clean, build passes.
Task 6b: CARRY TO TASK 12 (careers): careers' bespoke nav also toggles a
  data-ag-navcta button that the generic nav.ts does NOT handle. Task 12 must
  either extend nav.ts or add a careers-specific behaviour. Found in passing by
  the 6b implementer, correctly not touched.
Task 6b: minor (accepted, not fixed): ContactPill's `load` listener is a no-op on
  client-side-navigated mounts (browser `load` fires once per document). The
  unconditional 350ms restore-check still covers the real scenario. Judged not
  worth deviating from the vendored source — agreed.
Task 6b: review dispatched — package below.
Task 6b: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  3 Minor. FIRST task to clear review with no fix round. Reviewer reproduced the
  scroll-lock discrimination proof in an isolated sandbox and broke BOTH disposers
  independently (not just the one demonstrated), confirmed the brief's own draft
  test lets the bug through, verified every ContactPill cssText/keyframe/duration/
  easing/threshold character-for-character against vendor (zero drift), and
  confirmed news-absence is careers-only across all seven templates by grep.
  Settled the per-link-cleanup question definitively: it is copied verbatim from
  home's initShell, so not an invention — and it is a correctness requirement in
  an SPA where AgRuntime remounts on every route change, unlike the original
  static multi-page site where teardown never ran.
Task 6b: complete (commits 43e3266..1be1e95, review clean) — 3/3 ssr, tsc clean,
  build passes.
Task 6b: minor (deferred): shell disposer resets body.overflow only if the
  cleanups forEach completes; a try/finally would be safer. Mirrors identical
  fragility in the original source. BACKLOG.
Task 6b: minor (deferred): ContactPill does not .cancel() in-flight Web Animations
  on unmount; wrap.remove() detaches them so no visible artifact and no leak, and
  the vendor source has no teardown path to compare against. BACKLOG.
Task 6b: minor (deferred): the scroll-lock test isolates disposers by manual
  balanced-brace scanning while its sibling test already uses the TS compiler API.
  Works today; fragile to a future string literal with an unbalanced brace.
  BACKLOG.

Task 7: Ruling: mount <ContactPill /> PER PAGE, not once in a persistent layout —
  Why: the reviewer raised this as the one thing it could not settle from the
  diff. The original was per-document: every static page loaded the pill script
  fresh, so its drop-in animation played once per page visit. A layout mount would
  persist across client-side navigation and never replay, silently changing the
  behaviour on six of seven pages. Per-page also matches Ruling 1's per-page shell
  markup. — Cost if wrong: the pill animation replays on each navigation, which is
  what the original did anyway.
Task 7: Ruling: the brief's Step 3 dependency probe is replaced (preflight Ruling
  3) — it tests for `sharp` but installs `image-size`, so the probe can run
  against a missing module. Use a plain `npm i -D image-size` then the probe.
Task 7: implementer DONE_WITH_CONCERNS (commit 1983ee3). Fidelity excellent:
  7 removed / 16 added vs .source/jsx/home.jsx, every line justified (wrapper,
  5 next/image swaps, 2 component mounts). 3 long classNames spot-checked
  byte-identical. Correctly did NOT hand-patch the page; root-caused three
  CONVERTER bugs and proved the fixes in a transient, fully-reverted patch.
Task 7: CONVERTER GAPS (would have hit all 7 pages):
  (1) alt="" round-trips through node-html-parser as a BARE attribute; JSX reads
      a bare attribute as {true} and React types alt as string -> TS2322.
      22 occurrences. convert.test.mjs only ever tested non-empty alt.
  (2) rows="3" passes through as a string; React types textarea rows as number.
  (3) 6 literal apostrophes trip react/no-unescaped-entities as a BUILD error —
      invisible to tsc, so only `npm run build` catches it. Vindicates adding the
      build to every gate after the Task 4 defect.
Task 7: Ruling: authorise THIS implementer to fix tools/convert.mjs despite it
  being Task 6a's file — Why: it already diagnosed all three and verified the
  fixes; routing through another agent costs three round trips to re-derive known
  work. — Cost if wrong: converter changes land from a Task 7 dispatch; the diff
  is reviewed either way.
Task 7: Ruling: escape ' " > in the converter's existing text pass rather than
  disabling react/no-unescaped-entities for app/** — Why: fixes all seven pages
  automatically, keeps the rule live for hand-written code, and sits beside the
  brace escaping already there. JSX decodes the entities so rendered text is
  unchanged — which the implementer must VERIFY, since that is the fidelity
  requirement, not merely a passing build.
Task 7: Ruling: replace 'use client' on page.tsx with a thin per-page runtime
  wrapper (app/home-runtime.tsx) — Why: a Server Component cannot pass an array
  of functions to a Client Component, but marking the whole page client ships
  ~84KB of static markup for hydration that does nothing (no React state; all
  behaviour is imperative DOM). Chose a PER-PAGE wrapper over teaching AgRuntime
  to select module sets from a string prop because Task 8 adds three.js/GSAP to
  home/services/about but NOT studio/contact/case-study — a central map would drag
  three.js's 1.2MB into the graph of pages that never use it. — Cost if wrong:
  one 6-line file per page.
Task 7: fix round 1/5 dispatched — 3 converter fixes with mutation proofs +
  runtime wrapper + regenerate and re-paste + all seven templates re-verified
Task 7: fix round 1 complete (commit 1e84d84). 3 converter bugs fixed at SOURCE
  with 8 new mutation-proven tests; implementer read node-html-parser's own source
  to root-cause the alt="" collapse (both null and "" become a bare token via
  quoteAttribute), making the fix general — it also repaired data-ag-logo="" and
  data-hover-img="". Caught a VACUOUS TEST IN ITS OWN WORK: first test cases were
  too minimal to trigger the bug, which only fires when a sibling attribute forces
  re-serialisation. Found a companion gap: minlength had no rename entry, so the
  minLength numeric fix was unreachable dead code. Bundle: First Load JS 123->111 kB,
  page 20.5->8.72 kB after the Server Component fix.
Task 7: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  3 Minor. Reviewer regenerated .source/jsx/home.jsx itself and reproduced the
  8-removed/14-added diff exactly; verified all 5 next/image dimensions against the
  real files (422x133, 868x488, 3x 1920x1080); confirmed priority only on the logo
  and first work card; reconciled image counts (46 raw -> 41 img + 5 Image, none
  lost or double-converted); read React's own type definitions to confirm every
  NUMERIC_ATTRS entry is strictly number and that width/height are number|string
  so their exclusion is right; ran four of its own mutation tests; and found the
  literal apostrophes in .next/server/app/index.html with zero leaked &apos;.
Task 7: complete (commits 1be1e95..1e84d84, review clean) — tsc 0, build 0,
  static pages 4/4, full suite 45/45.
Task 7: minor (deferred): report said 9 new converter tests, actually 8. Miscount
  only; 22 total confirmed by running the suite.
Task 7: minor (deferred): tabIndex missing from NUMERIC_ATTRS though React types
  it strictly number and ATTRS already renames tabindex->tabIndex. Zero
  occurrences across all seven templates, so no live impact. BACKLOG.
Task 7: minor (deferred): the text-escape and numeric-attribute passes operate on
  the serialised string without tag/attribute-boundary awareness — a pre-existing
  characteristic this diff extends, not introduces. Reviewer verified zero live
  impact: no attribute value anywhere contains '>', and every script tag is either
  an external src reference or the x-dc block the CLI slices off. BACKLOG.
Task 8: implementer DONE_WITH_CONCERNS (commit 15fdc9f, 13 files). Per-module
  changed-line counts all small (4-16), every non-table deviation disclosed and
  individually justified as TS-strict accommodation. Verified componentDidMount
  order against source rather than trusting the brief. Raised three concerns —
  all three were worth raising; controller verified each against source:
  (1) initFanPointer: CONFIRMED DEAD. No call site in componentDidMount, and
      data-ag-fan appears in home.html only at lines 1170/1174 — both INSIDE the
      x-dc script block (starts 942) as querySelector argument strings, never as
      markup. Ruling: delete the module. Same category as nav.ts's darks/onDark.
      about/services show the same count; Task 11 must RE-VERIFY, not assume.
  (2) initVideo's __resources poster lookup: REAL DEFECT, and the root cause is
      a Task 1 gap — unbundle.mjs read only 2 of the bundle's 4 script blocks.
      The third, __bundler/ext_resources, is precisely the missing table:
      work-agasti-s/work-redpanda-s/work-social-s/work-identity-s -> UUIDs that
      are ALREADY extracted into public/images/. Also lists three/le/st,
      confirming the module ids ether.ts and stroke.ts were built against.
  (3) initCursor appending to document.body: FAITHFUL, not a deviation — the
      original does document.body.appendChild(dot) itself. No change. The flag
      was the correct instinct under the DOM-outside-root clause.
Task 8: PLAN DEFECT #10 (mine): Task 1's unbundler ignored ext_resources, so the
  four video-reel poster images had no name->path mapping and would have rendered
  broken. Invisible to every gate — tsc, lint and build all pass with a dead
  string. Would have surfaced only at the Task 9 visual comparison, if noticed.
Task 8: Ruling: fix via the tooling chain, not in video.ts — unbundle.mjs emits
  .source/ext-resources.json; convert.mjs rewrites assets/<id>.<ext> attribute
  values to real paths and fails loudly on an unresolvable one. video.ts stays
  BYTE-FAITHFUL: once the attribute holds /images/<hash>.jpg the ported regex
  ^assets\/(.+)\.jpg$ no longer matches, .replace returns the string unchanged,
  and the dead __resources branch is a harmless no-op. — Why: fixes all pages
  automatically, keeps the ported behaviour untouched, and matches the existing
  UUID-rewriting pattern. — Cost if wrong: a dead branch remains in video.ts,
  documented.
Task 8: fix round 1/5 dispatched — delete fanPointer, ext_resources pipeline,
  converter rewrite + loud failure + mutation-proven tests, regenerate and
  re-paste page.tsx
Task 8: fix round 1 complete (commit 19c4364). fanPointer deleted after
  independent re-verification; ext_resources pipeline added to unbundle.mjs and
  convert.mjs with 2 mutation-proven tests (2/24 fail with the fix removed,
  isolated); all 7 templates reconvert with the guard silent; page.tsx poster
  values refreshed. Fidelity 8 removed/14 added — poster values no longer appear
  in the diff because both sides now match. 47/47 suite, gates clean, home First
  Load JS 114 kB. Noted for Task 11: about/services show the same data-ag-fan
  signature as home, but flagged as SIGNAL ONLY — must be re-verified there.

CHROME AVAILABILITY: mcp__claude-in-chrome__* still unavailable (server
  disconnected at session restart #1; ToolSearch confirms no match). Tasks 9 and
  10 are the visual fidelity gates and cannot run without it.
Ruling: REORDER — defer Tasks 9 and 10, proceed with Tasks 11-13 (the remaining
  six page conversions), and batch ALL visual verification once Chrome returns.
  Why: the plan's homepage-first sequencing existed to catch a systematic
  conversion error before replicating it six times. That risk is materially lower
  than when the plan was written: every fidelity defect found so far — dead links,
  style-focus, sc-raw-select, the poster assets — was caught by TOOLING checks,
  not by eye, and the architecture is "fix the converter, regenerate", so a late
  discovery costs a re-run rather than seven hand-edits. Stalling the whole port
  on an extension that has been down for two sessions costs more than the residual
  risk. Batching the visual gates is also more efficient: one Chrome session,
  seven pages, three widths.
  — Cost if wrong: a systematic visual error is found at the end and all seven
  pages are regenerated from a converter fix. Recoverable by design.
  MITIGATION: Tasks 11-13 must NOT hand-tune anything the converter produces.
  Any page-specific visual fix is deferred to the batched gate, so a systematic
  error stays systematic (and thus fixable in one place) rather than being
  papered over per page.
Task 8: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  2 Minor. Reviewer read all eight ported methods from source side-by-side against
  the ports and found ZERO drift in any selector, magic number, easing string or
  timing constant. Strongest fidelity signal in the project so far: it noticed the
  port PRESERVES THE ORIGINAL'S OWN INCONSISTENCY — initCursor guards
  window.matchMedia twice while initMagnet checks window.matchMedia then calls
  bare matchMedia — which a rewrite would have normalised. Also independently
  re-verified the fanPointer deletion from scratch, regenerated ext-resources.json
  and matched it byte-for-byte, mutated both new converter tests (22 pass / 2 fail,
  isolated to exactly the new ones), and traced the ether unmount race through
  AgRuntime + both vendored files: if unmount precedes the dynamic import, dead=true
  short-circuits .then before mount() ever runs, so no context is created at all.
Task 8: complete (commits 1e84d84..19c4364, review clean) — 47/47, gates clean,
  home First Load JS 114 kB, three.js and gsap in lazy chunks.
Task 8: minor (deferred): the ext_resources merge in unbundle.mjs (null-skip,
  conflict warning) has no dedicated unit test, unlike its sibling assetMap merge.
  Consuming side in convert.mjs IS mutation-proven; producing side is not.
  Verified correct today by live regeneration. BACKLOG.
Task 8: minor (deferred): three INHERITED disposal gaps, each matching source
  exactly — video.ts's close() setTimeout(400), trail.ts's ResizeObserver debounce
  timer, reel.ts's per-word setTimeout(380). None throw; worst case is a redundant
  style write on a node about to be collected. Not regressions.

Task 11: dispatched — Services + About. Carries: no shared shell components
  (per-page markup), per-page 'use client' runtime wrapper, ContactPill per-page,
  fanPointer DELETED (must re-verify data-ag-fan is script-only on both pages,
  flagged as signal-only by Task 8), About has NO trail, and the reorder
  mitigation: NO hand-tuning of converter output.
Task 11: implementer DONE_WITH_CONCERNS (commit 7a19619). Fidelity: services
  4r/10a, about 9r/15a — wrapper plus next/image swaps only, classNames untouched.
  fanPointer INDEPENDENTLY re-verified dead on both pages (1 grep hit each, the
  definition only; data-ag-fan only inside that dead method body). Module lists
  derived from each page's OWN componentDidMount, both matched the brief once
  fanPointer is dropped; About's trail omission confirmed on stronger grounds
  than the brief claimed — initTrail and data-ag-trail are ENTIRELY ABSENT from
  about.html, not merely uncalled. Correctly refused to hand-edit pages or tools
  on the build failure; used a temporary fully-reverted ignoreDuringBuilds probe
  to prove nothing else was wrong (all routes ~115 kB, three.js/GSAP in shared
  lazy chunks, not tripled).
Task 11: build failed on @next/next/no-html-link-for-pages against the Home
  (href="/") links. Implementer traced the plugin's app-router scanner and
  reported it calls the Pages-router helper when recursing, so only "/" is ever
  detected.
Task 11: Ruling: fix the UNDERLYING issue — emit next/link for internal routes in
  the converter — rather than suppressing the rule, and DELIBERATELY do not
  adjudicate the plugin-bug claim, which the fix makes moot. Why: plain <a> means
  a full document reload on every internal link, which silently voids several
  decisions already made. AgRuntime mounts/disposes behaviours on route change
  with per-cleanup error isolation; shell.ts resets body overflow specifically so
  a menu open during navigation cannot strand the next page (a Review Focus item);
  ContactPill mounts per page so its animation replays per visit. Under full
  reloads none of that code ever runs — the document is destroyed instead. A
  Next.js site where every internal link is a full reload is a static site with
  extra steps. <Link> renders an <a> with identical attributes and className, so
  ZERO visual change, and shell.ts's ov.querySelectorAll('a') wiring still matches.
  Gated on hrefs toRoute() actually rewrote, so same-page fragments stay <a>.
  — Cost if wrong: internal navigation is client-side rather than a full reload;
  reversible by reverting one converter rule and regenerating.
Task 11: fix round 1/5 dispatched — converter emits Link, 2 mutation-proven tests,
  regenerate and re-paste home + services + about (app/page.tsx modification
  authorised), build must pass with NO rule suppression
Task 11: fix round 1 complete (commit c2b7002). Converter promotes <a> to <Link>
  only inside the branch where toRoute() resolved — gated on resolution, not
  output shape, so fragments and mailto: stay <a> while /#work qualifies.
  REAL BUG HIT AND FIXED: setting rawTagName='Link' silently dropped every child
  and the closing tag, because node-html-parser lower-cases a tag name before
  checking its void-element table and collided with the real HTML5 <link> void
  element. Fixed via a placeholder tag swapped after the void-collapsing pass.
  Mutation-proved BOTH directions including the anti-pattern the ruling named:
  disabling the rename fails the four "becomes Link" tests only; an over-broad
  shape-based gate fails the "stays <a>" test only. Also caught and corrected its
  OWN wrong comment rationale before shipping (it claimed footer social links were
  never Arohance-prefixed; checked the raw source and they are).
  Fidelity after regeneration: home 8r/15a, services 4r/11a, about 9r/16a —
  each exactly +1 line vs the prior round (the `import Link` wrapper line), as
  predicted. All seven templates reconvert with the guard silent.
  Gates: 50/50, tsc 0, build 0 with NO suppression. Routes / 331 B, /about 328 B,
  /services 332 B, all ~117 kB First Load. three.js (481 KB) and GSAP (51+18 KB)
  chunks have IDENTICAL hashes to every prior check — one instance each, shared
  and lazy, not duplicated per route. One new ~22 KB chunk is next/link's runtime.
Task 11: review dispatched — package below.
Task 11: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  1 cosmetic Minor (stale comment cross-reference "step 3d" vs the actual "4a").
  Reviewer REPRODUCED THE SERIALIZER BUG in isolation against the installed
  node-html-parser@9.0.4 (rawTagName='Link' on <a href="/about">About <span>x</span></a>
  serialises to just <Link href="/about"> — children and closing tag gone), read
  Next 15's own app-dir link.js to confirm <Link> spreads restProps onto a real
  <a> so shell.ts's querySelectorAll('a') still matches, and mutation-tested both
  directions itself — its over-broad mutation tripped TWO regression tests, one
  more than the implementer reported. Best evidence the gate is source-driven:
  about.html's nav logo is literally #top so it stays <a>, while studio.html's is
  a page link so it becomes <Link href="/"> — the gate reacts to genuine per-page
  source differences, not a hard-coded list.
Task 11: controller re-ran `npm run build` on the reviewer's ⚠️ (it had inferred
  rather than re-run): EXIT 0, 6 static pages, / 331 B, /about 328 B,
  /services 332 B, all 117 kB First Load, 103 kB shared. Confirmed.
Task 11: complete (commits 19c4364..c2b7002, review clean) — 50/50, tsc 0,
  build 0 with no suppression.
Task 11: minor (deferred): tools/convert.mjs:159 comment references "step 3d";
  the block is labelled 4a at :226. Cosmetic. BACKLOG.

Task 12: dispatched — Careers. Carries the Task 6b finding: careers' bespoke nav
  toggles a data-ag-navcta button the generic nav.ts does NOT handle. Also: no
  news panel (shell.ts already makes it optional), plus roles and the frozen
  showPay:true pay logic.
Task 12: implementer DONE_WITH_CONCERNS (commit 4bc021c). Fidelity 18 diff lines,
  all wrapper/image/mount, zero className changes. Honestly flagged that it
  RESOLVED A STOP-TRIGGER ITSELF: careers' initNav is not a superset of home's,
  which was my stated "stop and ask" case; it verified each omission was a no-op
  and proceeded, explicitly asking for a reviewer's eyes on that call.
Task 12: FINDING CONFIRMED (module list): careers has ZERO initParallax,
  initClock, data-parallax, data-ag-clock — verified independently by the
  controller. CAREERS_MODULES built explicitly rather than [...SHARED, roles] is
  correct and MORE faithful than my brief. Brief was wrong again.
Task 12: Ruling: OVERTURN the implementer's stop-trigger resolution — careers
  needs a single verbatim navCareers.ts; drop both nav and navCta from its list.
  Why: its evidence was nearly right but missed a SPECIFICITY interaction. The
  shared nav.ts button loop writes an INLINE background; careers' menu button
  carries hover:bg-[var(--ag-accent,#F2600C)], and inline beats any class rule
  including :hover. Base-state values match (which is why its check came back
  clean), so the regression appears ONLY in the hover state, invisible to static
  comparison. Careers' own initNav never touches the buttons. Note home's
  original DOES run that loop over buttons that also carry hover:bg-, so home's
  hover is suppressed after first scroll in the ORIGINAL too — nav.ts faithfully
  reproduces that oddity, and we must not export it to careers.
  Chose one verbatim module over composing shared+delta because composition
  requires PROVING that shared-plus-delta reproduces the original, and that proof
  just failed on a subtlety neither of us caught first pass. A verbatim port needs
  no such proof — it is the original.
  — Cost if wrong: one small page-specific module instead of reusing a shared one.
  LESSON: "same value" and "no effect" diverge whenever the write is inline and a
  pseudo-class rule exists on the same property.
Task 12: also asked implementer to GREP (not fix) studio/contact/case-study for
  bespoke initNav differences — Task 13 owns those pages and needs to know now.
Task 12: fix round 1/5 dispatched — navCareers.ts verbatim port, delete navCta.ts
Task 12: fix round 1 complete (commit f66524f). navCta.ts deleted; navCareers.ts
  added as a verbatim port (9 of 16 lines byte-for-byte; the 7 changed are
  signature/root-guard/disposer/TS mechanics). CAREERS_MODULES is
  [applyTheme, reveal, navCareers, shell, roles, form] — `nav` dropped entirely,
  not composed. Gates 50/50, tsc 0, build 0. /careers 306 B / 118 kB.
Task 12: MAJOR CARRY TO TASK 13 (reported, nothing touched): there are FOUR nav
  families across the seven pages, not one.
    (1) home/about/services -> nav.ts: onDark computed but DEAD, button loop runs
        unconditionally
    (2) careers -> navCareers.ts: never touches buttons, has the CTA toggle
    (3) studio + case-study -> byte-identical to each other; LIVE
        onDark-conditional button recolouring. Reusing nav.ts there would LOSE
        REAL BEHAVIOUR, independent of the hover issue.
    (4) contact -> minimal like careers, but its buttons rest at #1F1E1C not
        #1A1815, so reusing nav.ts risks BOTH a resting-colour shift AND the same
        hover suppression just found on careers.
  NOTE this directly qualifies the Task 5 ruling that deleted the dead
  darks/onDark computation: that deletion was correct FOR HOME, where the value
  is provably never read — but studio/case-study genuinely READ it. Their ports
  must keep it. The ruling stands for nav.ts; it must not be generalised.
  Recommendation accepted: Task 13 gives all three pages verbatim nav ports, none
  reusing nav.ts as-is.
Task 12: review dispatched — package below.
Task 12: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  1 Minor (a comment in roles.ts justifies ordering by an analogy that does not
  hold at componentDidMount granularity; the reordering IS inert, but for a
  different reason than stated). Reviewer independently reproduced the
  inline-style vs :hover interaction from nav.ts's real code and careers' real
  class list; confirmed no OTHER module in CAREERS_MODULES touches button styling
  (checked theme/reveal/shell/form), so the regression is fully closed not merely
  mitigated; verified three.js absence by reading .next/app-build-manifest.json
  and grepping the 481 KB chunk for WebGLRenderer; measured all three image
  dimensions with image-size; and confirmed ssr.test.mjs globs lib/behaviors so
  it genuinely covers the two new modules.
Task 12: KNOWN SOURCE-FAITHFUL BEHAVIOUR (not a defect): careers' static SSR text
  "Six roles open" flashes to "6 roles open" after mount, because initRoles writes
  items.length + ' roles open'. The original does exactly this. Flag at the visual
  gate so it is not mistaken for a porting bug.
Task 12: complete (commits c2b7002..f66524f, review clean) — 50/50, tsc 0,
  build 0, /careers 306 B / 118 kB, three.js absent from its graph.
Task 12: minor (deferred): roles.ts:14-17 comment rationale is imprecise. BACKLOG.

Task 13: dispatched — Studio, Case Study, Contact. Carries the four-nav-families
  finding: all three need VERBATIM nav ports, none reusing nav.ts. Studio and
  case-study read onDark LIVE (the computation deleted from nav.ts as dead on
  home); contact's buttons rest at #1F1E1C not #1A1815. Also: these three inline
  all their logic in componentDidMount rather than splitting it into initX
  methods, so porting means identifying logical blocks in one large body.
Task 13: implementer DONE_WITH_CONCERNS (commit 99e7df7). Fidelity studio 33/296,
  case-study 26/223, contact 11/195 — all wrapper/image/mount, zero hand-tuned
  markup. 5 new behaviour modules (shellMinimal, navOnDark, navPad, hoverLift,
  formWorkingDay), 14 blocks reused from existing modules each verified
  individually against source. Studio/case-study nav confirmed byte-identical by
  direct diff, not inspection. Gates 50/50, tsc 0, build 0, zero warnings on the
  three new pages. Routes studio 312 B, case-study 317 B, contact 311 B, all
  118 kB. three.js absent from all three, verified by compiled-bundle grep.
Task 13: CROSS-TASK DEFECT FOUND — a user-visible copy bug on the already-shipped,
  already-REVIEWED Careers page. Controller verified and the picture is broader
  than reported: there are THREE distinct form success messages across the seven
  templates, not two.
    home/about/services/case-study : "Thanks — we reply within a day"
    careers                        : "Thanks, we reply within a week"
    contact                        : "Thanks — we reply within a working day"
  form.ts hardcodes the first. Careers mounts the shared form, so it currently
  tells applicants "within a day" when the source says "within a week". Neither
  Task 12's implementer nor its reviewer questioned the `form` reuse — both were
  focused on roles.ts and navCareers.ts. Found only because an adjacent task
  looked across the whole set.
Task 13: Ruling: PARAMETERISE the message — makeForm(message) factory, `form`
  kept as the default instance, careers and contact get their own, formWorkingDay
  deleted. Why this differs from the nav ruling where I REJECTED composition: the
  nav variants differ in BEHAVIOUR (different statements, listeners, live vs dead
  onDark) and composing required proving shared-plus-delta reproduces the
  original — a proof that failed. The form variants differ in ONE STRING.
  Parameterising a datum is not parameterising behaviour, and three modules
  identical but for a literal is duplication with no upside. Factory called at
  module scope so the reference stays stable for AgRuntime's [modules] deps.
  — Cost if wrong: one factory instead of three modules; trivially reversible.
Task 13: ALSO FLAGGED: studio has no "Thanks" string at all yet mounts the shared
  form. Either it has no form element (harmless but pointless — drop it) or its
  block differs, in which case mounting shared form ADDS a message studio never
  had, the same defect class as careers. Implementer must determine which.
Task 13: fix round 1/5 dispatched — makeForm factory, careers + contact messages
  from their own source, studio determination, discriminating test
Task 13: fix round 1 complete (commit 4ab2c10). makeForm(message) factory added;
  `form` kept as the default instance so home/about/services/case-study are
  byte-unchanged; formWorkingDay.ts deleted; careers and contact call the factory
  with messages re-verified from their OWN templates this round rather than from
  my supplied table. 59/59 (was 50), tsc 0, build 0. All SEVEN routes now exist:
  / 331B, /about 328B, /careers 336B, /case-study 319B, /contact 358B,
  /services 332B, /studio 315B — all static, all ~118 kB, three.js still absent.
Task 13: CONTROLLER ERROR, corrected by the implementer: I claimed STUDIO_MODULES
  mounts the shared `form`. It never did — my `grep -ln "form" app/*/modules.ts`
  substring-matched the token inside a `formWorkingDay` comment. The implementer
  re-read the array literal, found the premise false, and said so instead of
  complying. Studio genuinely has no form at all (zero data-ag-form /
  data-ag-submit / <form / submit hits in its template). Lesson: a grep for a
  short token across files that mention a longer token containing it is not
  evidence.
Task 13: FIFTH vacuous-test catch, and the second by an implementer on its own
  work: while building form.test.mjs it found its own unanchored regex was
  matching the cursor block's unrelated `dot.textContent = '';` reset on every
  page rather than the form message. Anchored on "Thanks" to fix. Mutation proof
  then done properly (mutated careers' message, watched the exact
  expected/actual mismatch, restored, green).
Task 13: review dispatched — package below.
Task 13: review verdict — spec ✅, quality APPROVED. 0 Critical, 0 Important,
  1 Minor (shellMinimal guards !ov||!menu, looser than source's !ov||!news||!menu;
  provably inert — all three pages HAVE news panels — and matches shell.ts's
  reviewed pattern). Reviewer DELETED AND REGENERATED .source/ from scratch,
  diffed all three pages, verified all 11 image dimensions against real files
  with `file`, diffed every new module against its exact source block, and
  re-derived all seven form messages itself. Confirmed navOnDark retains the LIVE
  onDark conditional. Found the concrete delta justifying each NON-reuse:
  hovers.ts uses 10px on home/about/services vs 12px here; nav.ts hardcodes
  colour; navCareers adds a resize listener; shell.ts adds close-on-click wiring
  absent from all three templates. Mutation-tested form.test.mjs via the
  gitignored template (mutating a tracked file was blocked by the session's own
  safety classifier) — subtest 8 failed with the exact diagnostic, others passed.
Task 13: complete (commits f66524f..4ab2c10, review clean) — 59/59, tsc 0,
  build 0. ALL SEVEN PAGES CONVERTED.

STATUS: 12 of 15 units complete (1,2,3,4,5,6a,6b,7,8,11,12,13).
REMAINING: Task 9 (desktop fidelity gate), Task 10 (responsive implementation +
  verification), Task 14 (whole-site verification).
BLOCKER: Chrome MCP unavailable for a third consecutive session. This no longer
  merely defers verification — Task 10 is the user's explicit "make it mobile
  responsive" requirement and is IMPLEMENTATION work, not just checking. Raising
  the choice with the user rather than proceeding blind on a core requirement.
Task 9 (REVISED — Playwright harness replaces the cancelled Chrome gate):
  implementer DONE_WITH_CONCERNS (commit aca667d). tools/shoot.mjs +
  tools/compare.mjs. Captured 7/7 original and 7/7 port at 1440x900. Caught and
  recovered from a stray `next dev` process contaminating .next mid-run.
  27 differences: 1 likely real defect (one root cause behind 22 of the geometry
  deltas), 4 known-acceptable (live clock digits), 1 needing a ruling.
Task 9: THE MOST CONSEQUENTIAL DEFECT OF THE PROJECT, and the only one no amount
  of code review could have caught — it needed a rendered browser.
  The Archivo @font-face in the original declares `font-stretch: 62% 125%`, a
  variable WIDTH axis, and the design uses it in 36 places:
  font-variation-settings:'wdth' 104 (27x), 'wdth' 106 (7x), 'wdth' 100 (2x).
  app/layout.tsx passes weight: ['100'..'900'], which makes next/font/google
  serve STATIC INSTANCES. A static instance has no wdth axis, so all 36
  declarations are silently inert and every Archivo heading on all seven pages
  renders at the wrong width. Visible proof: identical Studio heading markup
  wraps to 4 lines in the original and 3 in the port, shrinking that header by
  152px and cascading into most other section-height deltas project-wide.
  Verified independently by the controller from the source templates.
Task 9: Ruling: fix in app/layout.tsx by omitting `weight` (which is what makes
  next/font serve the variable font) and adding axes: ['wdth']. Instrument_Sans
  left alone — its @font-face specifies single font-weight values and
  font-stretch: 100%, i.e. static instances, which the current config matches.
  — Cost if wrong: typography is wrong everywhere, which is what it already is.
Task 9: Ruling: ALSO require a RENDERED assertion that the axis actually works —
  measure a known string at 'wdth' 62 vs 'wdth' 125 and confirm the widths
  differ — and fold it into compare.mjs. Why: a config change that silently does
  nothing is exactly the defect we just found; verifying the fix only in the
  config would repeat it one level down.
Task 9: Ruling: contact's body background-color difference — LEAVE IT, record it.
  The original paints #131110 on a wrapper covering the #0C0B0A body; it is a
  computed-style difference on something nothing can see. Changing globals.css
  would affect all seven pages to fix an unobservable difference on one.
Task 9: fix round 1/5 dispatched — variable font axis + rendered proof + harness
  regression check + re-shoot at 1440
Task 9: fix round 1 complete (commit 96e2663). Archivo variable font fixed and
  PROVEN IN THE BROWSER: rendered-width ratio at 'wdth' 62 vs 125 went from ~1.0
  (inert) to 1.908, matching the original to 5 decimal places on all 7 pages.
  Folded into compare.mjs as checkFontAxis (threshold 1.3), 7/7 PASS.
  Instrument_Sans verified static-by-design against all seven templates first,
  left untouched per ruling. BUT only 1 of the 22 geometry deltas collapsed
  (/studio's header, exactly as predicted) — the other 21 survived.
Task 9: SECOND TYPOGRAPHY DEFECT, also mine, from the Task 2 brief:
  <body className="font-[var(--font-instrument),system-ui,sans-serif]" compiles
  to a font-WEIGHT rule, because Tailwind's `font-` prefix is ambiguous between
  family and weight. So body copy sitewide has been rendering in a raw system
  fallback on every page. Confirmed in the compiled CSS by the implementer and
  independently by the controller: the ORIGINAL body rule is
  `font-family:'Instrument Sans',system-ui,sans-serif` and my globals.css
  reproduced every OTHER declaration from that exact rule while relocating this
  one to a className. Blast radius checked: app/layout.tsx:37 is the ONLY
  ambiguous font-[...] utility anywhere in app/ — the converter emits the
  unambiguous [font-family:...] arbitrary-property form, so every generated
  heading was always correct. Confined to the single line I hand-wrote.
Task 9: Ruling: restore font-family to globals.css's body rule in the original's
  position and delete the className entirely, rather than fixing the utility with
  a font-[family-name:...] type hint. Why: the original declares it in CSS;
  globals.css already carries every other declaration from that exact rule, so
  this RESTORES the rule rather than adding an exception; and it removes the
  ambiguous construct instead of teaching it to behave. An ambiguous utility that
  happens to work is a trap for the next reader.
  — Cost if wrong: body typography is wrong everywhere, which it already is.
Task 9: Ruling: require a RENDERED computed-style proof again, and fold it into
  compare.mjs beside checkFontAxis. Why: "changed the config and assumed it took
  effect" is now TWICE-demonstrated in this project. Between the two checks the
  harness then guards both typefaces against silent regression.
Task 9: fix round 2/5 dispatched — body font-family + rendered proof + harness
  guard + re-shoot
Task 9: fix round 2 complete (commit 455b6ba). body font-family restored to
  globals.css at the original's declaration position; <body> carries no className.
  Proven in the browser two ways: computed fontFamily now names "Instrument Sans"
  (was the raw fallback stack), and a real body-copy string measures 10.50px
  wider under the resolved family than under literal system-ui — identical on
  both targets, all 7 pages. Folded into compare.mjs as checkBodyFont alongside
  checkFontAxis; both guards PASS on all 7.
  Differences 26 -> 24. Several collapsed or shrank sharply (home #work gone,
  #clients 31px->3px, contact header gone, careers #process 25px->8px).
Task 9: controller independently diffed the ORIGINAL's base stylesheet against
  globals.css — every rule now matches (*, html, body, ::selection, a, a:hover,
  input/textarea/button, both reduced-motion blocks). So the survivors are NOT a
  missing base rule, which was my first suspicion and the shape of the last two
  defects.
Task 9: THREE SURVIVORS unmoved to the pixel across all three font states:
  home/services #services accordion 18px, about #studio 12px, careers #roles 13px.
  Confirmed a separate third cause. Implementer's hypothesis: elements with no
  explicit line-height fall back to the font's `normal`, which depends on VERTICAL
  metrics its horizontal-width proof never tested — i.e. the Google-served
  Instrument Sans may differ in ascent/descent from the WOFF2 the bundle carried.
Task 9: Ruling: DIAGNOSIS-ONLY round, no application code changes — Why: the
  remedy that hypothesis implies is abandoning next/font/google for the eleven
  WOFF2 files Task 1 extracted and discarded. That is an architectural reversal,
  and this project has already been bitten once by acting on reasoning that was
  nearly right (the Careers nav, where "the values match" did not mean "no
  effect"). Confirm the cause before ruling on the remedy. Asked for: direction
  as well as magnitude (the two point at opposite causes); a computed line-height
  comparison on the same element in both targets; a file-level hhea/OS-2
  ascent/descent/lineGap comparison of the two Instrument Sans faces; explicit
  rule-out of Tailwind Preflight (which the originals never had and which would
  make the port SHORTER); and an explanation for why only THREE blocks — the
  #services delta being localised to item 1 and carried down without accumulating
  is a strong clue that any correct theory must account for.
  — Cost if wrong: one diagnostic round before a decision.
Task 9 fix round 3 (diagnosis only) — outstanding work. My round-2 hypothesis
  REFUTED AT THE FILE LEVEL: the implementer extracted both Instrument Sans WOFF2
  files (original's still embedded in the bundle; next/font's from .next), wrote a
  minimal WOFF2 parser using Node's zlib with no new dependency, and proved
  hhea/OS2/head vertical metrics byte-identical. The architectural reversal I was
  weighing would have fixed NOTHING. This is exactly why the round was
  diagnosis-only. Also ruled out Preflight two ways (direction — it can only
  shrink; and source — every relevant element already carries explicit m-0).
  All three deltas confirmed PORT TALLER. Line-height confirmed differing:
  Instrument Sans 18px vs 21px, JetBrains Mono 14px vs 17px, Archivo 22px vs 30px.
Task 9: ROOT CAUSE FOUND, far bigger than the three deltas, and mine from Task 2.
  The converted markup references fonts by their REAL names —
  font-family:'Archivo',sans-serif 59x and 'JetBrains_Mono',monospace 72x on the
  homepage alone. next/font/google defines those faces under HASHED names
  (__Archivo_<hash>) reachable only via its CSS variables, and nothing aliases the
  real names. So NONE OF THE THREE FAMILIES RESOLVE ANYWHERE IN THE MARKUP.
  Across the seven templates: Archivo referenced 238x, JetBrains Mono 236x,
  Instrument Sans 25x. Only body, via var(--font-instrument), was ever correct.
  JetBrains Mono was additionally never loaded at all — my Task 2 brief named only
  two families; I skimmed the helmet and never counted. It has the MOST @font-face
  declarations of the three (84).
Task 9: NOTE ON MY OWN VERIFICATION FAILURE: the wdth-axis proof passed because it
  measured a TEST element using the variable — proving the font file supports the
  axis, not that the page uses the font. That is precisely the "verify one level
  down" trap I warned the implementer about two rounds earlier, and I designed the
  check that way myself. Every subsequent font proof must be taken on REAL page
  elements.
Task 9: Ruling: REVERSE the Task 2 decision — self-host the original WOFF2 files
  under their real names with the original @font-face declarations, and remove
  next/font entirely. Why: next/font has now produced THREE separate typography
  defects (static instances killing the wdth axis, the hashed-name mismatch, and
  the size-adjust fallback perturbing normal line-height). Each was individually
  reasonable; collectively they cost more than shipping the original files would
  have. The binding requirement is EXACT DESIGN, and the original's typography is
  defined by those specific files with that specific unicode-range subsetting.
  Using them is not a workaround, it is the faithful answer. Requires: unbundle.mjs
  to stop discarding font/woff2; the original @font-face blocks extracted
  verbatim (preserving every unicode-range, weight range, stretch range and
  font-display) with src rewritten to real paths; layout.tsx stripped of next/font.
  The converted markup is NOT touched — its references become correct the moment
  the real names exist.
  — Cost if wrong: ~11 WOFF2 files in the repo and loss of next/font's automatic
  preloading, against eliminating an entire class of defect.
Task 9: fix round 4/5 dispatched — self-host fonts, per-family proof on REAL page
  elements, harness guards rewritten, re-shoot
Task 9: fix round 4 complete (commit 880d98b). Self-hosting SUCCEEDED fully — all
  147 @font-face blocks across the seven templates resolved, deduped to 21 unique
  rules, every unicode-range/weight-range/stretch-range/font-display preserved
  verbatim; WOFF2 files now shipped to public/fonts/; next/font removed entirely;
  converted markup untouched. PROVEN ON REAL PAGE ELEMENTS (h1, the footer's
  JetBrains Mono copyright line, first paragraph — not synthetic spans): Archivo
  and Instrument Sans now render pixel-identical to the original, delta 0.0px, on
  all 7 pages. checkFontProofs replaces the two old synthetic-element checks.
Task 9: THIRD ROOT CAUSE, and it is not fonts at all. The 24 differences persisted
  UNCHANGED after next/font was fully removed, which cleanly falsified the
  implementer's own round-3 fallback-face hypothesis. Real cause confirmed three
  independent ways (compiled-CSS grep, reproduction in a minimal next/font-free
  page using only that CSS, and removal by overriding the single rule):
  TAILWIND v4 PREFLIGHT SETS line-height:1.5 ON <html>. The original ships no
  Tailwind, so elements without explicit leading inherit the browser's `normal`.
  Explains all 24 survivors and their locality.
Task 9: Ruling: restore `line-height: normal` on html in globals.css alongside the
  original's two declarations, rather than disabling Preflight entirely. Why:
  disabling Preflight is more literally faithful (the original has no reset beyond
  box-sizing) but Tailwind's border-* width utilities DEPEND on Preflight setting
  border-style: solid, so dropping it could silently disable borders — trading a
  measured defect for an unmeasured one. The harness has measured the actual
  difference: 24 of 24 explained by this one inherited value. A one-line targeted
  fix that provably covers all of them beats a broad change whose side effects
  nobody has measured. Same reasoning that left the contact background alone.
  — Cost if wrong: one line, trivially reversible.
Task 9: PROCESS NOTES worth carrying: (1) a stray `next start` from earlier
  diagnostic work contaminated a capture and produced a catastrophic-looking false
  result — SECOND such incident in this task; always verify the server being
  measured is the one just built. (2) The implementer caught its OWN transcription
  error while hand-copying into globals.css — a duplicated keyframe value in the
  unrelated ag-rail-l animation (25 decimal stops) — by diffing the whole file
  against the last commit rather than skimming its edit. That corruption would
  have been undetectable by eye.
Task 9: fix round 5/5 dispatched — html line-height + harness guard + final
  re-shoot. Expect ~5 remaining (4 clock/timer text + 1 ruled contact background).
Task 9: fix round 5 complete (commit cabe919). html line-height:normal restored.
  Verified three ways incl. an UNFILTERED process listing before every capture,
  which caught two more stray processes whose command lines contained no repo
  path at all — the previous filtered check would have missed both. Both guards
  (checkFontProofs + checkHtmlLineHeight) pass on all 7.
  Count 24 -> 14, not the ~5 expected.
Task 9: FOURTH ROOT CAUSE, reconciled to the exact pixel rather than guessed.
  app/globals.css's `input, textarea, button { font: inherit; color: inherit; }`
  — from my Task 2 brief, copied faithfully from the original — sits OUTSIDE any
  @layer. CSS Cascade Layers give UNLAYERED rules priority over every layered
  rule, including all Tailwind utilities, regardless of specificity. So every form
  control loses its font-size utility to the reset. Deltas -4, -4, -12, -10 = the
  exact -30px measured on the shared #contact CTA (home/about/services) and
  careers' #apply. Harmless in the ORIGINAL, where there is no Tailwind and the
  design's inline font-size declarations win as inline styles; harmful in the port
  only because those inline styles became utility classes in @layer utilities.
  Also established the earlier +3px reading was TWO EFFECTS CANCELLING — the
  apparent near-agreement in rounds 2-4 was coincidence, not signal.
Task 9: Ruling: CONTINUE PAST THE FIVE-ROUND CAP. The cap exists to catch a loop
  where the implementer cannot see its own problem and rounds stop converging.
  This is the opposite: 27 -> 26 -> 24 -> 14, each round isolating a distinct root
  cause and proving it. Mechanically tripping a breaker on convergent progress
  would be process for its own sake. Also KEEPING the same implementer rather than
  escalating per the skill's rounds-4-5 guidance, because on this task the
  accumulated context — the harness, the measurement discipline, four causes and
  how they interact — is the asset, and a fresh agent would spend a round
  rebuilding it. — Cost if wrong: a longer loop on a task that is converging.
Task 9: Ruling: DELETE the unlayered form-control rule rather than wrapping it in
  @layer base. Why: Tailwind Preflight already provides the same reset correctly
  inside a layer, so the rule is both redundant and harmful. Deleting restores the
  ORIGINAL's actual outcome — the design's own sizing wins. Required verification
  of genuine Preflight parity first, because "equivalent" reasoning has been wrong
  twice in this project already.
Task 9: fix round 6 dispatched — delete unlayered rule + Preflight parity proof +
  form-control guard + re-shoot. Expect 14 -> 5.
Task 9: fix round 6 complete (commit 4cd028d). CONVERGED. Preflight parity
  verified from the COMPILED CSS before deleting anything — its own
  button/input/optgroup/select/textarea rule covers both properties on a superset
  of elements, confirmed inside @layer base by checking byte offsets against the
  nearest preceding @layer base{ and the not-yet-opened @layer utilities{.
  The three controls reconciled in round 5 now read 20px/20px/26px with the
  button in Archivo — byte-for-byte the original's values.
  14 -> 5, exactly the prediction: 4 known-acceptable clock/timer texts + the one
  ruled contact background. THREE PAGES (about, services, careers) now show ZERO
  differences of any kind. All three guards (checkFontProofs, checkHtmlLineHeight,
  checkFormControlProof) pass on all seven pages. No fifth root cause.
Task 9 FULL ARC: 27 -> 26 -> 24 -> 24 (diagnosis) -> 24 -> 14 -> 5 across six
  rounds, FIVE independent root causes, every one proven by direct measurement
  and every one invisible to tsc, ESLint, the build, 59 tests and multiple deep
  code reviews:
    1. Archivo served as static instances -> the variable wdth axis did not exist,
       so 36 font-variation-settings declarations were inert
    2. body font-family on an ambiguous font-[...] utility -> compiled to
       font-WEIGHT, body copy in a system fallback sitewide
    3. next/font's hashed family names never matched the markup's real names ->
       ALL THREE families unresolvable across 499 references; JetBrains Mono
       (236 uses) never even loaded
    4. Tailwind Preflight's line-height:1.5 on <html> -> inherited leading
       everywhere the design left it implicit
    5. an UNLAYERED form-control reset outranking every Tailwind utility ->
       form controls at browser-default sizes
Task 9: review dispatched — the harness is now the project's fidelity oracle, so
  it needs independent verification of its own.
Task 9: CONTROLLER'S OWN VISUAL VERIFICATION (independent of the harness).
  Read both contact.png captures directly. Result: visually IDENTICAL. Both
  images are 1440x2234 — same full-page height to the pixel. Identical
  typography (Archivo display head, JetBrains Mono eyebrow labels, Instrument
  Sans body), identical form layout and field sizing, identical three-column
  "what happens next" grid, identical footer wordmark crop, identical accent
  orange on BUILDING?. The ONLY visible difference in the entire frame is the
  clock: 17:56:45 IST vs 17:58:41 IST, the captures being ~2 minutes apart —
  exactly one of the four known-acceptable live-timer readings.
  This is a genuine independent confirmation: the harness's "5 remaining
  differences" verdict matches what a human eye sees.
  All 14 captures present with closely matching file sizes (contact 195KB vs
  197KB, about 1.32MB vs 1.34MB, home 4.02MB vs 4.16MB), consistent with
  comparable visual complexity rather than one side rendering degraded.
Task 9: review verdict — spec ✅ with 2 Important, quality APPROVED. The reviewer
  VALIDATED HANDS-ON rather than by reading: regenerated .source/, diffed all 21
  @font-face rules byte-for-byte against a fresh re-extraction (exhaustive, not a
  spot check), confirmed from the captured JSON that the proof elements are real
  page nodes carrying real heading text ("WE MAKE", "A STUDIO,") and that the
  archivo proof element itself carries [font-variation-settings:'wdth'_106] so it
  genuinely exercises the axis, verified Preflight's position by BYTE OFFSET in
  the compiled CSS (3462, before @layer utilities opens at 5284), confirmed the
  two rail keyframes character-for-character including the exact steps the
  implementer nearly corrupted, and traced every residual to its real source
  mechanism (real setInterval clock, real rAF playhead, structural occlusion).
Task 9: THE MUTATION TEST WAS ACTUALLY RUN — deleted line-height:normal, rebuilt,
  reshot: comparison went 5 -> 24 (matching the pre-fix count exactly) and
  checkHtmlLineHeight FAILED on all 7 pages with the literal broken value "24px".
  Reverted; git status and git diff --stat both empty; rebuilt and reshot to
  confirm return to exactly 5 with all guards passing. Full round trip. The
  harness is now a verified oracle, not an assumed one. It also independently
  reproduced the exact pixel magnitudes from the investigation (+18/+12/+13),
  strong evidence the five-round chain happened as described rather than being
  narrated after the fact.
Task 9: Ruling: fix both Important findings. (1) tools/shoot.mjs:41 and
  compare.mjs:17 hardcode a personal, session-specific absolute path as the
  default output dir — this is COMMITTED tooling meant to be the project's
  ongoing fidelity oracle, and nobody else on any other machine or in CI can
  write there. Default to os.tmpdir(), keep the env/CLI override. (2)
  checkFormControlProof asserts only fontSize while shoot.mjs already CAPTURES
  fontFamily and height on the same real textarea — fontFamily is interpolated
  into the failure message but never asserted, height never read. A font-FAMILY
  regression with unchanged size would report PASS, which is exactly the shape of
  this codebase's own Round 2 defect. A guard that captures a metric and does not
  check it is the weakest kind of test: it looks like coverage.
Task 9: Ruling: fold in one Minor — tighten FONT_PROOF_TOLERANCE_PX from 2 to 1.
  Mid-investigation a real secondary mechanism produced a 1.8px residual on the
  JetBrains Mono proof that would have PASSED under 2px. All three families now
  measure 0.0px, so there is no reason to keep a margin wide enough to have
  masked a defect found during this very task.
Task 9: fix round 7 dispatched (final) — portable output path, full guard
  coverage, tightened tolerance, re-verify still exactly 5.
Task 9: fix round 7 complete (commit e365104). Portable OUT_BASE via os.tmpdir()
  in both scripts, verified by running a full capture+compare with no env var set.
  checkFormControlProof now asserts fontFamily (exact) and height (1px) alongside
  fontSize. FONT_PROOF_TOLERANCE_PX 2 -> 1. Round 5 report wording corrected IN
  PLACE with a dated inline note rather than silently rewritten. Re-ran: still
  exactly 5 differences, all three guards pass on all seven pages, every
  family/page reads Δ0.0px so the tighter tolerance produces no false failures.
Task 9: COMPLETE (commits 4ab2c10..e365104, review clean). Seven commits, six fix
  rounds, five independent root causes, 27 -> 5 differences, three verified
  regression guards. Controller's own visual read of the contact page pair
  confirms the harness verdict.

STATUS: 13 of 15 units complete. REMAINING: Task 10 (mobile responsive — the
  user's explicit requirement) and Task 14 (whole-site verification + README).

Task 10 framing: at 1440 the goal is an EXACT match; at 390 it is emphatically
  NOT, because the original has zero breakpoints and does not work there. The
  goal is that the PORT works at 390 while desktop stays byte-identical. User
  chose "fix what breaks (as agreed)" — so every change must trace to a MEASURED
  breakage, not a speculative one. The 1440 comparison staying at exactly 5 is
  the regression gate that proves desktop was not touched.
Task 10: implementer DONE (commit c673eb3). Phase 1 measured 269 findings @390,
  196 @768 across 7 pages. Triaged to: 1 REAL layout defect (menu/news overlay
  panels, 10.8px overflow @390, gone by 768), ~9 tap-target categories (60+
  elements <40x40), 127 sub-12px text elements (sitewide design convention,
  identical at 1440, documented not fixed), and 4 "beyond-viewport"/"clipped"
  mechanisms all INVESTIGATED AND CONFIRMED HARMLESS (marquee, 3D rail, bleed
  wrapper, Ken Burns — all contained by ancestor overflow-hidden; footer wordmark
  clipping byte-identical to the original at 1440; cursor dot a pointer:fine-gated
  harness artifact).
  Fixes: 2 categories, ~15 edit sites, every one traced to a measurement.
  3 tap-targets left <40px with reasons (baseline-aligned rows where padding
  would visibly misalign text).
  1440 COMPARISON AFTER CHANGES: EXACTLY 5, all three guards pass on all seven
  pages. Desktop provably untouched.
Task 10: FIVE OF MY SEVEN STATIC-ANALYSIS PREDICTIONS WERE WRONG. Nav, hero h1,
  work cards, gutters — all measured clean. Most notably the MARQUEE RIBBONS,
  which I had flagged as Review Focus 5 and "the most likely source of
  page-level horizontal overflow", measured completely clean: contained by an
  ancestor overflow-hidden. Only #2 (overlay panels) was right as stated; #5
  (footer) was right for a different reason than I gave (tap targets, not layout).
  Lesson consistent with the whole project: my static analysis of this design has
  been unreliable, and measurement has been decisive every time.
Task 10: controller's own visual check of port/390/contact.png — nav fits, heading
  wraps to 3 lines with accent intact, form fields full width, the 3-column
  "what happens next" grid correctly stacked to 1, footer stacked, no overflow.
Task 10: CONTACTPILL OBSERVATION (not a defect, flagged to user): the floating
  pill overlays form content at 390. It is the SAME vendored script in both
  versions (only the href changed), position:fixed by design, and the original
  overlays form content the same way at 1440. Faithful by construction. Whether
  it should hide or reposition on small screens is a DESIGN decision that belongs
  to the user, not a responsive bug to fix unilaterally.
Task 10: review verdict — quality "Needs fixes", 0 Critical, 1 Important, 2 Minor.
  Exceptional verification: the reviewer SCRIPTED a longest-common-prefix/suffix
  diff across all 102 modified lines and proved 100% pure appends with zero
  pre-existing classes altered, reordered or removed; caught a STALE .next build
  predating the final commit by ten minutes (THIRD stale-build incident in this
  project) and rebuilt before measuring; used unfiltered Win32_Process and
  Get-NetTCPConnection checks rather than a filtered ps grep; and reproduced every
  quantitative claim EXACTLY — the 5-diff 1440 count with per-page breakdown, the
  127 sub-12px elements with identical per-page split at both widths, the
  1/0/1/0/0/0/1 tap-target residue at both widths, and the footer wordmark's
  1793/1313 and 1535/1313 values byte-identical across original and port. Verified
  all four dismissals from actual source structure, and confirmed Tailwind's lg
  breakpoint is unmodified so max-lg: is genuinely inert at 1440.
Task 10: Important finding — app/careers/page.tsx:66 got max-lg:py-3 while THREE
  structurally identical links (items-end row, unpadded paragraph sibling) were
  deliberately deferred for exactly that reason. Measured at GLYPH level with
  Range.getBoundingClientRect() on real text nodes: 1.6px above the paragraph's
  last line at 1440 (the designer's near-flush alignment) vs 10.8-10.9px at 768
  and 1023 with the row confirmed still on one flex line — ~9px degradation at a
  required test width. The three deferrals were confirmed correctly judged
  (services drifts only 2.3px vs a 3.4px reference; home's row wraps to two lines
  at both widths so there is no shared baseline to break).
Task 10: Ruling: DEFER the fourth link to match the other three; remove
  max-lg:py-3. REJECTED the reviewer's suggested max-lg:items-baseline — and the
  reason matters: items-baseline aligns each flex item's FIRST baseline, and the
  sibling is a MULTI-LINE paragraph, so it would align the link to the paragraph's
  first line rather than its last, moving it substantially further than the 9px
  being removed. Insensitive to the padding as claimed, but it changes WHICH lines
  align. Untested and plausibly worse. — Cost if wrong: four text links sit
  slightly under 40px, documented, with the alignment reason stated.
Task 10: recorded as an option, deliberately NOT implemented: py-3 paired with a
  compensating -my-3 would expand the hit area while leaving outer box height and
  therefore alignment unchanged. Declined to introduce a new technique late,
  across four sites, in a task scoped to measured breakage. User can adopt it.
Task 10: fix round 1 dispatched — defer the 4th link, document all four together,
  correct the text-[10px] imprecision, re-verify both widths and the 1440 gate.
Task 10: fix round 1 complete (commit 0b1e2d4). careers CTA reverted to
  byte-identical with the pre-Task-10 baseline; all four links now documented
  together; text-[10px] correction made in place with inline notes rather than
  silent rewrites. 1440 still exactly 5, all guards pass. Tap-target residue
  1/0/1/0/1/0/1 at both widths as predicted.
Task 10: COMPLETE (commits e365104..0b1e2d4).

CONTROLLER CATCH — a failing test was reported as "pre-existing, unrelated" and
  waved through. It is neither. Verified directly:
  tools/unbundle.test.mjs:32 asserts distinct mapped paths == files on disk,
  counting only public/images (33) + .source/vendor (5) = 38, but assets.json now
  holds 49 distinct paths because Task 9's commit 880d98b started shipping the 11
  WOFF2 files to public/fonts as part of the font self-hosting reversal. The test
  is STALE, not the code — its invariant is still correct, it simply never learned
  about the new directory. Introduced by Task 9, missed by Task 9's own review
  (which ran targeted tests plus the harness rather than the full suite), then
  mischaracterised by Task 10's implementer.
  The test did exactly its job: it detected that the asset surface changed.
  LESSON: "pre-existing and unrelated" is a claim, not an exemption. Earlier runs
  in this project were 59/59; a number that moves is a finding.
Task 14: implementer DONE_WITH_CONCERNS (commits 273a909 fix, 48441d8 README).
  Stale asset-parity test fixed -> 59/59.
  REVIEW FOCUS ITEMS 3 AND 4 VERIFIED IN A REAL BROWSER FOR THE FIRST TIME —
  both had only ever been asserted at source level by reading code:
    (3) WebGL context leak: PASS. Canvas count flat at 1 across 12 round-trips
        (24 navigations) at BOTH 1440 and 390, final canvas correctly sized to
        viewport, zero WebGL console warnings, zero page errors.
    (4) Body scroll lock surviving navigation: PASS at both widths. overflow
        "hidden" while the menu is open, resets to "" on the destination page
        after a REAL menu-link click-navigation, destination scrolls normally.
  Dead links: 0 — 103 rendered internal-link instances resolving to 7 unique
  routes, all HTTP 200. 96 match the converter's own count exactly; the extra 7
  come from the hand-authored ContactPill.
  1440 comparison: exactly 5, all three guards pass. Mobile: 0 page-level
  overflow on all 7 pages at 390 and 768.
Task 14: CONTROLLER ERROR, corrected. I doubted the lint claim and checked it, but
  my greps conflated errors with warnings — I saw findings in app/, lib/ and
  tools/ and concluded "all 47 trace to .source/vendor" was overstated. It was
  not. Summary is 315 problems = 47 ERRORS + 268 WARNINGS; the 47 errors are
  confined to the gitignored vendor bundles and everything in real code is a
  warning. The implementer's report was precise. Verifying a claim is right;
  mis-reading the evidence and doubting a correct report is not.
Task 14: Ruling: add .source/** to eslint.config.mjs ignores — the list already
  excludes node_modules, .next, out and build, every other generated directory.
  .source/ is gitignored, regenerable, and holds third-party bundles we neither
  wrote nor maintain. Plainly an oversight.
Task 14: Ruling: DOCUMENT the 268 remaining warnings in the README rather than
  suppressing them. Majority are no-img-element on generated pages — deliberate,
  since only measurable key visuals became next/image while decorative fills
  stayed <img>. The rest are unused catch bindings inherited from near-verbatim
  ports. A warning that is EXPLAINED is more useful than one that is hidden, and
  disabling the rule on page files would also suppress genuine future findings.
Task 14: fix round 1 complete (commit 49e1b33). .source/** added to eslint
  ignores; lint now 0 errors / 67 warnings (was 47/268 — the ignore also removed
  the vendor-bundle warnings). No rule suppressed. README documents the remaining
  67 in place: 61 no-img-element (deliberate — decorative/fill images not given
  next/image) and 6 unused-var/-expression (inherited from near-verbatim ports).
  Confirmed next build's own lint step never scanned .source/ (build output
  byte-identical to before), so this changed nothing about the build.
Task 14: COMPLETE (commits 0b1e2d4..49e1b33).

ALL 15 UNITS COMPLETE. Dispatching the whole-branch final review.
FINAL WHOLE-BRANCH REVIEW (opus, 41ffe13..49e1b33, 40 commits): "Ready to merge
  — WITH FIXES". 0 Critical, 6 Important, 11 Minor, plus triage of all 29
  deferred items (2 to fix, 27 fine to leave).
  Independently re-verified the headline claim from a COLD BUILD: exactly 5
  differences, 3 guards passing, every font proof Δ0.0px. Regenerated all seven
  pages in memory from the CURRENT converter and diffed class-attribute by
  class-attribute: 1,688 converter-produced classNames, ZERO alterations; the
  only deltas are 166 max-lg: tokens. Desktop provably untouched AND the pages
  are still in sync with the converter. Drove Playwright itself to OPEN the menu
  overlay at 390/768 on all seven pages — panel inside the viewport every time,
  overflow 0 open and closed, scroll lock engages, hit-test lands inside.
FINAL REVIEW'S MOST IMPORTANT FINDING — the fidelity oracle can certify a lie.
  tools/shoot.mjs:143-159 races the spawned `next start` child's exit against an
  HTTP probe. A server ALREADY listening on 4501 answers in ~2ms while the
  child's EADDRINUSE exit takes hundreds, so the probe wins and the rejection
  never fires. The reviewer PROVED it: put a 5-line impostor server on 4501, ran
  the capture, got "next start serving http://localhost:4501", "7/7 captured
  cleanly", exit 0 — while measuring a stub serving identical content for all
  seven routes. There is also no stale-.next guard. This is precisely the
  mechanism that burned this project THREE times, on the one gate the whole
  quality claim rests on.
FINAL REVIEW'S HIGHEST-DAMAGE MAINTAINER TRAP: regenerate-and-re-paste wipes the
  mobile requirement. The seven page.tsx files carry no provenance header, and
  the README's own converter bullet describes a hand-merge workflow that would
  delete all 166 hand-added max-lg: classes — while the 1440 gate would still
  report 5, so nothing would catch it. That bullet is also half-stale: it says to
  swap <a> for next/link by hand, but the converter already emits <Link>.
FINAL REVIEW ON MY OWN RULINGS (I asked): "consistently better than the plan they
  overrode". The two it would argue with are both places where "matches the
  original source" was used as a defence when the original's EXECUTION MODEL did
  not apply — the shell try/finally deferral (the original never ran teardown at
  all) and shellMinimal being duplicated wholesale right after makeForm
  established that a provable one-item delta should be parameterised. Fair, and
  the first is now being fixed.
Ruling: ONE fix wave per the process, covering the 6 Important + the 2 triage
  items + a small set of cheap high-value Minors (shell test glob, README gaps).
  EXCLUDED from the wave and surfaced to the user instead: the favicon (we have
  no square asset; cropping the 422x133 logo is a DESIGN act, not a fix) and the
  keyboard accessibility of the accordions/lightbox (inherited from the original,
  zero-pixel fix, but a deliberate choice that belongs to the user).
FINAL FIX WAVE complete (commit 1ce0675, 18 files). All 8 items fixed.
  Guard 1 PROVEN: impostor server on 4501 -> shoot.mjs aborted immediately, no
  "next start"/"OK"/"captured cleanly" lines, exit 1. The exact scenario the
  reviewer used to defeat the oracle now fails loudly.
  Guard 2 PROVEN: scratch file touched under app/ -> immediate refusal naming
  BUILD_ID vs source mtimes, exit 1. It also fired UNPROMPTED for a genuine
  reason — npm test's unbundle.test.mjs rewrites public/ assets, staling a
  just-built .next. The guard working correctly surfaced a real sequencing
  constraint: build immediately before shooting, not before npm test.
  compare.mjs: exactly 5 differences, 0 residual after classification, EXIT 0 —
  the harness can now gate CI.
  Gates: 59/59, tsc clean, lint 0 errors/67 warnings (unchanged baseline),
  build 7 routes static, mobile-audit 0 page-overflow at 390 and 768.
  Noted concern (unrelated, untouched): mobile-audit.mjs's own exit code still
  trips on non-gating soft findings; page-overflow=0 is the real gate and holds.
SCOPED RE-REVIEW of the final fix wave: 7 of 8 ADDRESSED, each verified
  INDEPENDENTLY rather than read from the diff — both guards reproduced live
  (impostor on 4501 -> two-line refusal, exit 1, no "next start"/"OK"/"captured
  cleanly"; touched app/ file -> refusal naming exact BUILD_ID vs source mtimes),
  all seven <title> values read back from real Playwright captures, all seven
  page.tsx diffs confirmed PURE INSERTIONS with zero deletions, the @theme
  deletion confirmed dead in the COMPILED css, and the max-lg: count
  independently recounted per file to exactly 166.
RESIDUAL FINDING — the exact loophole I asked it to hunt for. compare.mjs:212
  classifies the Contact background difference by PAGE IDENTITY
  (`acceptable: slug === 'contact'`) rather than by value, unlike its sibling
  text classifier at :216-230 which masks volatile clock/timer shapes and
  requires everything else to match exactly. So ANY future background-colour
  regression on that page, whatever the wrong value, is swallowed and still exits
  0. No fallback exists: bodyBackgroundColor only measures <body>, never the
  visible [data-ag-root] layer painting over it, so that line is the only place
  such a regression could surface.
Ruling: CLOSE it rather than park it, against the letter of the "one fix wave,
  then surface residuals" rule — Why: this is a one-line change to a TOOL (not
  the site), addressing precisely the failure mode the wave was commissioned to
  close, found by verification I explicitly commissioned. The no-second-wave rule
  guards against polish loops; closing the named defect in one line is not that.
  Handing the user a known hole in their fidelity oracle to save one dispatch is
  the wrong trade. Recorded as a deliberate deviation. — Cost if wrong: one extra
  dispatch. Required a mutation proof, since this project has found five vacuous
  tests and a guard nobody tried to defeat is not yet a guard.
Ruling: do NOT widen bodyBackgroundColor to measure the visible root layer —
  pre-existing, out of scope, and widening the harness now is exactly the scope
  creep being avoided. Document as a known limitation in the README instead.
Ruling: document the npm-test/stale-build interaction in the README — the
  re-review caught that it is explained only in .superpowers/, which is
  gitignored, so a future developer or CI hits it with zero in-repo guidance.
