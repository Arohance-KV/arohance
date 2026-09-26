# Task 3 Report: CSS-to-Tailwind mapper

## What I implemented

- `tools/tw.test.mjs` — the brief's nine `node:test` cases, with the amendment applied to test 5 (the second assertion in `'spaces inside arbitrary values become underscores'` is now a direct `assert.equal` against the literal string `'shadow-[0_10px_26px_rgba(0,0,0,.5)]'`, replacing the original `String.includes`/`indexOf('[')` construction). Everything else in that test, and all eight other tests, is transcribed verbatim from the brief.
- `tools/tw.mjs` — transcribed verbatim from the brief's Step 3 code block. Exports exactly `escapeValue(v)` and `styleToClasses(cssText, prefix = '')`; every other helper (`SPACING`, `scale`, `len`, `keyword`, `SIZE`, `size`, `parts`, `box`, `WEIGHT`, `MAP`) is module-private.

I did not add, remove, or reword any mapping-table entry, and did not add a test framework — `node:test` / `node:assert/strict` only, matching `tools/unbundle.mjs` / `tools/unbundle.test.mjs` conventions. Neither existing file was touched.

## TDD Evidence

### RED

Command:
```
node --test tools/tw.test.mjs
```
Run with only `tools/tw.test.mjs` present (`tools/tw.mjs` did not yet exist). Output:
```
TAP version 13
# node:internal/modules/esm/resolve:275
#     throw new ERR_MODULE_NOT_FOUND(
#           ^
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\arohance projects\Arohance-new-website\tools\tw.mjs' imported from C:\arohance projects\Arohance-new-website\tools\tw.test.mjs
#     at finalizeResolution (node:internal/modules/esm/resolve:275:11)
#     at moduleResolve (node:internal/modules/esm/resolve:932:10)
#     ...
#   code: 'ERR_MODULE_NOT_FOUND',
#   url: 'file:///C:/arohance%20projects/Arohance-new-website/tools/tw.mjs'
# }
# Node.js v22.12.0
# Subtest: tools\tw.test.mjs
not ok 1 - tools\tw.test.mjs
  ---
  duration_ms: 46.637
  failureType: 'testCodeFailure'
  exitCode: 1
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 1
# pass 0
# fail 1
```
Why this failure was expected: `tools/tw.mjs` did not exist yet, so the `import { styleToClasses, escapeValue } from './tw.mjs'` at the top of the test file cannot resolve. Node reports this as `ERR_MODULE_NOT_FOUND` for the module — the same failure the brief's Step 2 anticipates ("Cannot find module './tw.mjs'"), just displayed with Node's resolved absolute path rather than the bare specifier. This confirms the test file was in place and wired up correctly before any implementation existed.

### GREEN

Command:
```
node --test tools/tw.test.mjs
```
Run after writing `tools/tw.mjs`. Output:
```
TAP version 13
# Subtest: maps keyword declarations to real utilities
ok 1 - maps keyword declarations to real utilities
# Subtest: maps px lengths onto the spacing scale
ok 2 - maps px lengths onto the spacing scale
# Subtest: splits shorthand padding into axis utilities
ok 3 - splits shorthand padding into axis utilities
# Subtest: colors become arbitrary text/bg values
ok 4 - colors become arbitrary text/bg values
# Subtest: spaces inside arbitrary values become underscores
ok 5 - spaces inside arbitrary values become underscores
# Subtest: escapeValue never emits a bare space
ok 6 - escapeValue never emits a bare space
# Subtest: unknown properties fall back to arbitrary properties
ok 7 - unknown properties fall back to arbitrary properties
# Subtest: prefix is applied to every emitted class
ok 8 - prefix is applied to every emitted class
# Subtest: declarations are order-preserving and semicolon-tolerant
ok 9 - declarations are order-preserving and semicolon-tolerant
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 70.8225
```
All nine tests pass. Output is pristine — no warnings, no deprecations. Re-ran again after `git commit` (on the committed working tree) with the same result (9/9 pass) as a final gate check.

## Hand-trace of mapping-table entries against their tests

**1. `padding` shorthand (`box('p','px','py','pt','pr','pb','pl')`) — test `splits shorthand padding into axis utilities`.**
`padding:16px clamp(20px,4.4vw,64px)` → `parts()` walks the string tracking paren depth; the space between `4.4vw,64px)` characters never occurs at depth 0 (it's inside `clamp(...)`), and the only depth-0 space is between `16px` and `clamp(...)`, so `parts` yields exactly `['16px', 'clamp(20px,4.4vw,64px)']` — 2 values, not 5. `box` takes the 2-value branch: `[len('py')('16px'), len('px')('clamp(...)')]`. `len('py')('16px')`: `scale('16px')` matches the px regex, `n=16`, `SPACING[16] = '4'` → `'py-4'`. `len('px')('clamp(...)')`: the regex requires the whole trimmed value to be `<num>px`, which `clamp(...)` is not, and it isn't literal `'0'` either, so `scale` returns `null` → arbitrary path: `` `px-[${escapeValue('clamp(20px,4.4vw,64px)')}]` `` — no spaces inside `clamp(...)` here, so `escapeValue` is a no-op → `'px-[clamp(20px,4.4vw,64px)]'`. Joined: `'py-4 px-[clamp(20px,4.4vw,64px)]'` — matches the test exactly.

**2. `color` / `background` (`(v) => \`text-[${escapeValue(v)}]\`` / `` `bg-[${escapeValue(v)}]` ``) — test `colors become arbitrary text/bg values`.**
`color:#F5F2ED` → value `'#F5F2ED'` has no whitespace, `escapeValue` trims and collapses whitespace (no-op here) → `'text-[#F5F2ED]'`, matching the test. `background:#1F1E1C` → same shape → `'bg-[#1F1E1C]'`, matching. Confirms both routes go through `escapeValue` even though this particular input never exercises the space-collapsing behavior.

**3. The critical case: `transition` (Review Focus 1) — no `MAP['transition']` entry exists, so it falls through to the generic arbitrary-property branch in `styleToClasses`.**
`transition:opacity .5s cubic-bezier(.16, 1, .3, 1)` → `prop = 'transition'`, `value = 'opacity .5s cubic-bezier(.16, 1, .3, 1)'`. `MAP['transition']` is `undefined`, so `fn` is falsy and `emitted` stays `null`, triggering the fallback: `` `[${prop}:${escapeValue(value)}]` ``. `escapeValue` replaces every whitespace run with a single `_`: `opacity`, `.5s`, `cubic-bezier(.16,`, `1,`, `.3,`, `1)` joined by `_` → `opacity_.5s_cubic-bezier(.16,_1,_.3,_1)`. Final: `'[transition:opacity_.5s_cubic-bezier(.16,_1,_.3,_1)]'` — matches the test exactly, and confirms the fallback path (not just the named-property paths) also routes through `escapeValue`.

**4. The amended assertion: `box-shadow` — test 5, second assertion (per my amendment).**
`box-shadow:0 10px 26px rgba(0,0,0,.5)` → `MAP['box-shadow']` is `` (v) => `shadow-[${escapeValue(v)}]` ``. `escapeValue('0 10px 26px rgba(0,0,0,.5)')` tokenizes on whitespace runs — `0`, `10px`, `26px`, `rgba(0,0,0,.5)` — and joins with `_`: `0_10px_26px_rgba(0,0,0,.5)`. Final: `'shadow-[0_10px_26px_rgba(0,0,0,.5)]'`, matching the amended assertion exactly (and verified by the actual GREEN run above).

All four traces match both the brief's expectations and the executed test output; I found no discrepancy between the brief's nine tests and its reference implementation.

## Files changed

- `tools/tw.mjs` (new, 130 lines) — byte-for-byte identical to the brief's Step 3 code block (verified with `diff` against the brief file's extracted code block; zero differences).
- `tools/tw.test.mjs` (new, 59 lines) — identical to the brief's Step 1 code block except for the one intended hunk (the amended second assertion in test 5); verified with `diff` against the brief's extracted code block, which showed exactly that one hunk and nothing else.
- Commit: `bdb8909` — "feat: add tested CSS-to-Tailwind declaration mapper" (message taken verbatim from the brief's Step 5, with the required `Co-Authored-By` trailer added). `git status` is clean; no other file in the repo was touched (confirmed via `git status`/`git diff --stat` before committing).

## Self-review findings

- **Completeness:** all nine tests present; amendment applied to exactly the specified assertion and nothing else (confirmed by diff — single hunk, matching my amendment instructions character-for-character).
- **Transcription accuracy:** `tools/tw.mjs` diffs as identical to the brief's code block — every mapping-table entry, property name, and utility prefix is exact by construction, not just by eyeballing.
- **escapeValue routing:** grepped every `[...]`-building call site in `tools/tw.mjs` (14 sites: `len`, the 12 direct property handlers `color` through `border`, and the generic fallback in `styleToClasses`). All 14 pass their value through `escapeValue` before interpolating into a bracket. None bypasses it.
- **Discipline:** exactly two exports (`escapeValue`, `styleToClasses`); no properties added beyond the brief's `MAP`; `package.json` untouched; no test framework installed (`node:test`/`node:assert/strict` only, matching `tools/unbundle.test.mjs`).
- **Testing:** all assertions are direct equality (or, for the escape-value test, a direct equality on the escaper itself) — no loose/weak assertions remain after the amendment. Output is pristine: TAP-format, 9/9 pass, 0 fail/cancelled/skipped/todo, no warnings, both on first GREEN run and on a repeat run after commit.

## Issues or concerns

**1. Likely real bug (not caught by any of the nine required tests): negative pixel values on directional/prefixed utilities produce a malformed double-hyphen class, not a valid negative Tailwind utility.**

Root cause: `scale()` returns a *sign-prefixed magnitude string* for negative inputs (e.g. `scale('-8px')` returns the string `'-2'`), and `len(prefix)` then builds the class as `` `${prefix}-${s}` ``. When `s` is negative, this produces `prefix + '-' + '-2'`, i.e. a literal double hyphen, instead of Tailwind's actual negative-utility convention, which hoists the sign to the *front* of the whole class (`-mt-2`, not `mt--2`).

Verified by executing the shipped `tools/tw.mjs` directly (not just by hand-tracing):
```
margin-top:-8px  => mt--2       (Tailwind expects -mt-2)
top:-10px        => top--2.5    (Tailwind expects -top-2.5)
margin:-8px      => m--2        (Tailwind expects -m-2)
```
`mt--2`, `top--2.5`, and `m--2` are not utilities Tailwind generates, so — per the exact "silent nothing" failure mode this task's brief calls out for spaces in arbitrary values — the class would compile to nothing and the negative offset/margin would silently disappear from the page.

This bug is scale-dependent and therefore easy to miss: it only triggers when a negative value's *magnitude* lands exactly on the `SPACING` table (0, 1, 2, 4, 6, 8, 10, 12, ... 128px). Off-scale negative values accidentally take the arbitrary-value branch instead and come out correct, e.g. `left:-1.5px` → `left-[-1.5px]`, which is valid (Tailwind arbitrary brackets accept a literal signed CSS value fine). That makes the bug harder to notice by spot-checking and more likely to surface only against real page CSS at Tasks 6-7, on exactly the round pixel values (-8px, -10px, -16px, etc.) a hand-designed page is most likely to actually use for negative margins and absolute-position offsets.

Affected properties (any of them, whenever the shorthand/directional call routes through `len`/`scale` with a negative magnitude that lands on the spacing scale): `padding`/`margin` shorthands and their `-top/-right/-bottom/-left` longhands, `top/right/bottom/left/inset`. (`gap`/`row-gap`/`column-gap` can't legally be negative in CSS, and `width`/`height`/`min-*`/`max-*` are not realistically negative, so those are moot in practice.)

I implemented `tools/tw.mjs` exactly as the brief specifies and did **not** patch this — per your instructions I'm not to adjust the implementation on my own initiative, and none of the nine required tests exercises this path, so all nine still pass cleanly. But since you asked specifically to be told about any mapping rule that looks wrong even though I implemented it as written: this one looks wrong, and I'd flag it before Tasks 6-7 run the real page CSS through it. The fix (when you want it) is localized to `len`: the sign needs to move in front of the whole returned class rather than sitting inside the scale value, e.g. constructing `` `${n < 0 ? '-' : ''}${prefix}-${hitMagnitude}` `` instead of folding the sign into `hit` before it reaches `len`.

**2. Lower-confidence, informational-only observations (not verified against a running Tailwind build, since this task intentionally does not run `npm run build`):**

- `border`'s fallback (anything other than literal `0`/`none`) bundles width+style+color into one bracket, e.g. `border:1px solid #000` → `border-[1px_solid_#000]`. I can't confirm here whether Tailwind v4's arbitrary-value engine accepts a bare `border-[...]` as that composite shorthand (as opposed to needing a `border-[color:...]`/`border-[length:...]` type hint) — worth watching at the Task 9 visual-fidelity gate if any source page uses a `border` shorthand rather than the longhand `border-color`/`border-width` (which aren't in the table at all, and would currently fall through to generic arbitrary properties like `[border-color:...]`, which are unambiguous and fine).
- `font-weight` only special-cases numeric weights (100-900 via `WEIGHT`); a keyword weight like `font-weight:bold` or `font-weight:normal` would fall to `` `font-[${escapeValue(v)}]` ``, i.e. `font-[bold]`/`font-[normal]`, which is not a form I've confirmed Tailwind resolves for weight (as opposed to font-family). I did not check whether any of the seven source pages actually use a keyword font-weight — flagging only as a thing to watch for once real page CSS runs through this at Tasks 6-7.

Neither of these is something I changed or would change on my own — both are exactly as the brief specifies, and the mapping table is explicitly not mine to extend at this task. Flagging per your request to surface anything that looks under-specified even when implemented as written.

## Fix report (follow-up, post-coordinator review)

The coordinator confirmed the negative-length finding above was a real bug and asked for the fix below. The other two observations (`border` shorthand, keyword `font-weight`) were checked against the actual source templates and confirmed to be non-issues: the source contains only `border:0` (47 occurrences, zero shorthand forms) and only numeric `font-weight` values (all of which hit the `WEIGHT` table); the `font-weight: 100 900` text I'd have been reacting to is a variable-font range inside `@font-face` in the document head, not a declaration this function ever sees. No change made for either.

### What I changed

**`tools/tw.mjs` — `scale()`.** Replaced the sign-flipping implementation with the coordinator's version: it no longer matches a leading `-` at all, so any negative px value fails the regex and falls through to `null`. `len()` and `size()` needed no change — they already route a `null` result from `scale()` to the arbitrary-value branch. Net effect: negative lengths now always produce `<prefix>-[<value>]` (e.g. `mt-[-8px]`, `top-[-10px]`), which is valid for every prefix, instead of the old `<prefix>-<sign><magnitude>` (e.g. `mt--2`), which was only ever valid for the subset of utilities with a negative variant and was syntactically broken regardless (double hyphen).

Diff:
```diff
 const scale = (v) => {
-  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v.trim());
+  const t = v.trim();
+  if (t === '0') return '0';
+  const m = /^(\d+(?:\.\d+)?)px$/.exec(t);   // no leading sign: negatives fall through
   if (m) {
-    const n = Number(m[1]);
-    const hit = SPACING[Math.abs(n)];
-    if (hit !== undefined) return (n < 0 ? '-' : '') + hit;
+    const hit = SPACING[Number(m[1])];
+    if (hit !== undefined) return hit;
   }
-  if (v.trim() === '0') return '0';
   return null;
 };
```

**`tools/tw.test.mjs`.** Appended a tenth test, exactly as specified:
```js
test('negative lengths become arbitrary values, never double hyphens', () => {
  assert.equal(cls('margin-top:-8px'), 'mt-[-8px]');
  assert.equal(cls('top:-10px'), 'top-[-10px]');
  assert.equal(cls('margin:-4px -8px'), 'my-[-4px] mx-[-8px]');
});
```

### Regression check (requested explicitly)

Ran both cases the coordinator asked me to confirm, plus the three new cases, directly against the fixed module before re-running the suite:
```
node -e "import('./tools/tw.mjs').then(({ styleToClasses }) => {
  console.log('top:0            =>', styleToClasses('top:0').join(' '));
  console.log('padding:16px     =>', styleToClasses('padding:16px').join(' '));
  console.log('margin-top:-8px  =>', styleToClasses('margin-top:-8px').join(' '));
  console.log('top:-10px        =>', styleToClasses('top:-10px').join(' '));
  console.log('margin:-4px -8px =>', styleToClasses('margin:-4px -8px').join(' '));
});"
```
Output:
```
top:0            => top-0
padding:16px     => p-4
margin-top:-8px  => mt-[-8px]
top:-10px        => top-[-10px]
margin:-4px -8px => my-[-4px] mx-[-8px]
```
`top:0` and `padding:16px` are unchanged from before the fix, confirming no regression on zero or positive values. `git diff` against the prior commit touched only the body of `scale()` and the one new test — `len`, `size`, and the `MAP` table are untouched.

### Test run (GREEN, 10/10)

Command:
```
node --test tools/tw.test.mjs
```
Output:
```
TAP version 13
# Subtest: maps keyword declarations to real utilities
ok 1 - maps keyword declarations to real utilities
# Subtest: maps px lengths onto the spacing scale
ok 2 - maps px lengths onto the spacing scale
# Subtest: splits shorthand padding into axis utilities
ok 3 - splits shorthand padding into axis utilities
# Subtest: colors become arbitrary text/bg values
ok 4 - colors become arbitrary text/bg values
# Subtest: spaces inside arbitrary values become underscores
ok 5 - spaces inside arbitrary values become underscores
# Subtest: escapeValue never emits a bare space
ok 6 - escapeValue never emits a bare space
# Subtest: unknown properties fall back to arbitrary properties
ok 7 - unknown properties fall back to arbitrary properties
# Subtest: prefix is applied to every emitted class
ok 8 - prefix is applied to every emitted class
# Subtest: declarations are order-preserving and semicolon-tolerant
ok 9 - declarations are order-preserving and semicolon-tolerant
# Subtest: negative lengths become arbitrary values, never double hyphens
ok 10 - negative lengths become arbitrary values, never double hyphens
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 63.7531
```
10/10 pass, pristine output — no warnings.

### Commit

`1400a55` — "fix: route negative lengths to arbitrary values instead of double-hyphen classes" (`tools/tw.mjs`, `tools/tw.test.mjs` only; `Co-Authored-By` trailer included). This is a second commit on top of `bdb8909`, not an amend, per standard practice for this project.

## Fix report round 2 (post-review, findings 1 and 2)

The review approved the work overall (full `MAP` table checked verbatim against the brief with no transcription typos, every bracket-construction site confirmed to route through `escapeValue`, `parts()` confirmed to handle nested parens, and the round-1 negative-length fix validated by compiling `mt-[-8px]` through the project's real Tailwind 4.3.3 and confirming it emits `margin-top: -8px`). It raised one Important finding and folded in one Minor. Per the coordinator's explicit instructions, I did not touch the three items called out as deliberately left alone (untested 3-value `box()` branch, untested `row-gap`/`column-gap`/`right`/`bottom`/`left`/`inset`, and the fallback not escaping `prop`).

### Finding 1 (Important): `SIZE` cross-mapped `100vw`/`100vh` to the wrong axis's `screen`

Root cause: one `SIZE` table backs all six of `width`/`height`/`min-width`/`min-height`/`max-width`/`max-height` via `size()`, but Tailwind's `screen` utility suffix is axis-specific — `w-screen` is hardcoded to `100vw`, `h-screen` to `100vh`. The old table mapped both `'100vw'` and `'100vh'` to the same `'screen'` token regardless of which axis's prefix called it, so a crossed axis silently emitted the *other* axis's viewport unit: `width:100vh` compiled to `width: 100vw`, and `height:100vw` to `height: 100vh`. Unlike an unescaped space (which produces nothing and is conspicuous), this produces a plausible-looking, still-rendering, wrong value.

**What I changed — `tools/tw.mjs`, `SIZE` table.** Removed the `'100vw'` and `'100vh'` entries entirely, so both units now fall through `size()` to `len()`'s arbitrary-value branch on every axis:
```diff
-const SIZE = { '100%': 'full', '100vw': 'screen', '100vh': 'screen', auto: 'auto', 'fit-content': 'fit', 'min-content': 'min', 'max-content': 'max' };
+const SIZE = { '100%': 'full', auto: 'auto', 'fit-content': 'fit', 'min-content': 'min', 'max-content': 'max' };
```
The remaining keys (`full`, `auto`, `fit`, `min`, `max`) mean the same thing on both axes, so they stay exact. `size()` and `len()` themselves needed no change — a miss in `SIZE` already falls through to `len()`, which already produces an exact arbitrary value for anything off-scale or non-px.

**Test added — `tools/tw.test.mjs`, verbatim as specified**, covering all six `size()`-backed properties (previously zero coverage) including the crossed-axis case and the `size()` → `len()` → arbitrary fallback for an off-scale px value:
```js
test('size keywords map on both axes, viewport units stay arbitrary', () => {
  assert.equal(cls('width:100%'), 'w-full');
  assert.equal(cls('height:100%'), 'h-full');
  assert.equal(cls('height:auto'), 'h-auto');
  assert.equal(cls('min-width:min-content'), 'min-w-min');
  assert.equal(cls('max-height:max-content'), 'max-h-max');
  assert.equal(cls('width:100vw'), 'w-[100vw]');
  assert.equal(cls('height:100vh'), 'h-[100vh]');
  assert.equal(cls('width:100vh'), 'w-[100vh]');
  assert.equal(cls('min-height:640px'), 'min-h-[640px]');
});
```
Hand-traced before running: `width:100vh` now takes `size('w')('100vh')` → `SIZE['100vh']` is gone → falls to `len('w')('100vh')` → `scale('100vh')` fails the px-only regex → arbitrary → `w-[100vh]` (the exact input value, correct on either axis by construction). `min-height:640px` → `size('min-h')('640px')` → not in `SIZE` → `len('min-h')('640px')` → `scale` matches the px regex but `SPACING[640]` is `undefined` (scale tops out at 128) → `null` → arbitrary → `min-h-[640px]`, pinning the `size()` → `len()` → out-of-scale fallback path.

### Finding 2 (Minor, folded in): `border` and `font-weight` happy paths had no test

Both entries are correct (verified by the reviewer by execution) but untested despite being among the most-hit rows in `MAP` (`border:0` 47 times, numeric `font-weight` 300+ times across the seven templates). No implementation change — test only, added verbatim as specified:
```js
test('border and font-weight happy paths', () => {
  assert.equal(cls('border:0'), 'border-0');
  assert.equal(cls('border:none'), 'border-0');
  assert.equal(cls('font-weight:700'), 'font-bold');
  assert.equal(cls('font-weight:400'), 'font-normal');
  assert.equal(cls('font-weight:500'), 'font-medium');
});
```

### Diff scope

```
git diff -- tools/tw.mjs tools/tw.test.mjs
```
touched exactly one line in `tools/tw.mjs` (the `SIZE` literal) and appended exactly two `test(...)` blocks to `tools/tw.test.mjs` — nothing else in either file changed.

### Test run (GREEN, 12/12)

Command:
```
node --test tools/tw.test.mjs
```
Output:
```
TAP version 13
# Subtest: maps keyword declarations to real utilities
ok 1 - maps keyword declarations to real utilities
# Subtest: maps px lengths onto the spacing scale
ok 2 - maps px lengths onto the spacing scale
# Subtest: splits shorthand padding into axis utilities
ok 3 - splits shorthand padding into axis utilities
# Subtest: colors become arbitrary text/bg values
ok 4 - colors become arbitrary text/bg values
# Subtest: spaces inside arbitrary values become underscores
ok 5 - spaces inside arbitrary values become underscores
# Subtest: escapeValue never emits a bare space
ok 6 - escapeValue never emits a bare space
# Subtest: unknown properties fall back to arbitrary properties
ok 7 - unknown properties fall back to arbitrary properties
# Subtest: prefix is applied to every emitted class
ok 8 - prefix is applied to every emitted class
# Subtest: declarations are order-preserving and semicolon-tolerant
ok 9 - declarations are order-preserving and semicolon-tolerant
# Subtest: negative lengths become arbitrary values, never double hyphens
ok 10 - negative lengths become arbitrary values, never double hyphens
# Subtest: size keywords map on both axes, viewport units stay arbitrary
ok 11 - size keywords map on both axes, viewport units stay arbitrary
# Subtest: border and font-weight happy paths
ok 12 - border and font-weight happy paths
1..12
# tests 12
# suites 0
# pass 12
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 76.9341
```
12/12 pass, pristine output — no warnings.

### Commit

`9356c33` — "fix: stop SIZE from cross-mapping 100vw/100vh to the wrong axis's screen" (`tools/tw.mjs`, `tools/tw.test.mjs` only; `Co-Authored-By` trailer included). Third commit on the branch for this task, on top of `1400a55` and `bdb8909`.
