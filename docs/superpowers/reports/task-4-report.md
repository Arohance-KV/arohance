# Task 4 Report: Port the two vendor effect modules

## What I implemented

1. Copied `.source/vendor/liquid-ether.js` -> `lib/liquid-ether.ts` and `.source/vendor/stroke-text.js` -> `lib/stroke-text.ts` via `cp`, then verified byte-identical copies with `diff` before editing.
2. Replaced the artifact-runtime resource-table imports with real package imports in both files.
3. Added `export type EtherOpts` / `export type StrokeOpts` exactly as specified in the brief, and typed both `mount` signatures as `(el-equivalent: HTMLElement, opts: <Opts>): () => void`.
4. Made the LiquidEther disposer idempotent with a `disposed` guard, releasing the WebGL context via the renderer calls that were already present in the source.
5. Wrote `lib/effects.test.mjs` verbatim as specified in the brief.
6. Ran `node --test lib/effects.test.mjs` and `npx tsc --noEmit` — both pass.
7. Committed as `720603c`.

No dependencies were added or changed (`package.json`/`package-lock.json` untouched, confirmed via `git diff --stat`). Nothing under `tools/` was touched.

## Strictness approach per file

**`lib/liquid-ether.ts` -> `// @ts-nocheck`.**

**Correction (fix round 1): my original justification below was factually wrong, per review.** I originally wrote that `C`, `M`, and `F` "require restructuring a declaration, not just appending `: any`." That claim does not hold up — each is a single object literal that one `: any` on the existing declaration silences, exactly the technique I used for `box`/`tl`/`io` in `stroke-text.ts`. I'm leaving the corrected reasoning and the honest count in place of the original claim.

I first attempted the "annotate internals as `any`" route and measured it empirically rather than guessing: with only the brief's required changes applied (imports, option types, typed signature, disposer guard) and zero extra annotations, `npx tsc --noEmit` reported **71 errors** in this file alone. Those 71 collapse to roughly **11 declaration-site edits** (~19 individual `: any` / `?` tokens across them), every one the same move as the `box`/`tl`/`io` fix in `stroke-text.ts` — a single annotation added to an existing declaration, nothing rewritten:

- `const C = {...}` -> `const C: any = {...}` (silences every `renderer`/`clock` null-vs-`WebGLRenderer`/`Clock` complaint — about 15 of the 71 errors trace back to this one annotation)
- `const M = {...}` -> `const M: any = {...}` (same null-then-reassigned pattern for `M.timer`/`M.onInteract`)
- `const F = {}` -> `const F: any = {}` (silences every dynamically-keyed `F.vel_0`/`F.pressure_0`/etc. access afterward — about 20 of the 71 errors trace back to this one annotation)
- `let raf = null` -> `let raf: any = null`
- `paletteTex(stops)` -> `paletteTex(stops: any)`
- `makePass = (vs, fs, uniforms, extra) => {...}` -> `(vs: any, fs: any, uniforms: any, extra?: any) => {...}` — four tokens on one existing declaration; marking `extra` optional is a type annotation on a parameter that call sites already sometimes omit, not a restructure of the function
- `render = (scene, target) => {...}` -> `(scene: any, target: any) => {...}`
- `onMove = e => {...}` / `onTouch = e => {...}` -> `(e: any) => {...}` each
- `inside = (x, y) => {...}` / `setCoords = (x, y) => {...}` -> `(x: any, y: any) => {...}` each
- `Object.values(F).forEach(f => ...)` -> `.forEach((f: any) => ...)`

So this is not a different category of problem from `stroke-text.ts` — it is a bigger version of the same job (roughly 11 sites/~19 tokens here vs. 6 sites/9 tokens there), and I should not have written it up as needing restructuring.

**The actual reason I kept `@ts-nocheck` for this file** (the task's ruling on this, since my original justification was wrong): `liquid-ether.ts` is frozen, fidelity-critical vendored code that we do not own and will not be coming back to edit the internals of again. Threading ~19 extra annotation tokens through the fluid-sim body means ~11 more touched lines in the one file where every touched line has to be trusted not to have drifted the visual output the whole project is graded on — in exchange for enabling in-file diagnostics on code we will never act on, since we only ever consume the single `mount` export and its boundary type is fully enforced either way (verified below). Minimizing touched lines in this specific file is worth more than those diagnostics. That trade is specific to `liquid-ether.ts`'s size and role; `stroke-text.ts` is smaller and its fixes were uniformly trivial, so there was no comparable reason to reach for `@ts-nocheck` there.

I verified the rationale behind this choice rather than taking it on faith: I temporarily added a throwaway `lib/_boundary-check.ts` that imported `mount` from both modules and called it with `{}`, with a wrongly-typed field, and with a fully-correct options object, each behind `@ts-expect-error` where an error was expected. `npx tsc --noEmit` passed with exit code 0 — which only happens if every `@ts-expect-error` line had a real error to suppress (an unused `@ts-expect-error` is itself a compile error) and the two valid calls type-checked as `() => void`. This confirms `@ts-nocheck` only suppresses diagnostics *inside* `liquid-ether.ts`; callers importing `mount`/`EtherOpts` still get full, correct type-checking. I deleted the throwaway file afterward — it is not part of the deliverable and is not in the commit.

**`lib/stroke-text.ts` -> `any` annotations (no `@ts-nocheck`).**

Same empirical measurement: with only the required brief changes applied, `tsc` reported **19 errors**, but here they collapsed cleanly into six edit sites, all pure additions of a type annotation or an inline cast — no signature restructuring, no object-literal rewrites beyond adding `: any` to an existing `let`:

1. `font = t => {...}` -> `font = (t: any) => {...}`
2. `mk = (attr, data) => {...}` -> `mk = (attr: any, data: any) => {...}`
3. `Object.entries(attr).forEach(([k, v]) => ...)` -> the destructured pair needed an explicit `[string, any]` tuple annotation (TS can't infer the value type through `Object.entries` on an `any`-typed argument — the generic parameter falls back to `unknown`, not `any`, so this needed one small annotation of its own).
4. `let box = null, tl = null, io = null, killed = false;` -> `let box: any = null, tl: any = null, io: any = null, killed = false;` (fixes every downstream "implicitly has an `any` type" and "possibly null" complaint about these three).
5. `const st = p.reverse ? {...} : p.stagger;` -> `const st: any = ...` (GSAP's `stagger` overload doesn't accept the widened `string` type of `from: 'end'`; recasting the literal would touch the animation code, so I typed the variable instead).
6. `if (window.matchMedia && matchMedia(...).matches)` -> `if ((window.matchMedia as any) && matchMedia(...).matches)` (TS flags this specific truthy-check as "always true" since `window.matchMedia` is non-optional in `lib.dom.d.ts`; casting the check target to `any` silences the diagnostic without changing the runtime check or touching the conditional's structure).

That's 9 individual `any`-flavored annotations across 6 lines — comfortably inside "a handful," so I kept this file under strict checking rather than reaching for `@ts-nocheck`.

## Per-file diff summary against `.source/vendor/`

Verified with `diff -u .source/vendor/<file> lib/<file>.ts`. Line counts below are from the diff itself (`+`/`-` lines, excluding the `+++`/`---` headers), not estimated.

### `lib/liquid-ether.ts` — 2 lines removed, 12 lines added, in 2 hunks

```diff
+// @ts-nocheck
 // Vanilla port of React Bits <LiquidEther /> (three.js fluid sim). mount(el, opts) -> dispose()
-const THREE = await import(window.__resources.three);
+import * as THREE from 'three';
 
-export function mount(container, o = {}) {
+export type EtherOpts = {
+  colors: string[]; mouseForce: number; cursorSize: number; resolution: number;
+  autoDemo: boolean; autoSpeed: number; autoIntensity: number;
+  takeoverDuration: number; autoResumeDelay: number; autoRampDuration: number;
+};
+
+export function mount(container: HTMLElement, o: EtherOpts): () => void {
```
- `+// @ts-nocheck` — strictness escape hatch, justified above.
- `const THREE = await import(...)` -> `import * as THREE from 'three';` — import line, per brief Step 2.
- `export type EtherOpts = {...}` (7 added lines incl. blanks/`};`) — the option-bag type, verbatim from the brief, per Step 3.
- `export function mount(container, o = {})` -> `export function mount(container: HTMLElement, o: EtherOpts): () => void {` — signature typing, per Step 3. I kept the original parameter names `container`/`o` (used dozens of times through the file) rather than renaming to the brief's illustrative `el`/`opts` — renaming would have touched every line that reads `container` or `o`, which is exactly the kind of gratuitous diff the task told me to avoid; the *type* of the exported signature matches the brief's contract regardless of the parameter's local name, and I verified this at the call-site boundary (see above). I also dropped the `= {}` default: with `o` now typed as the fully-required `EtherOpts` (matching the brief's produced interface, which shows no default), `{}` is not a valid default value under `strict`, and nothing in the repo currently calls `mount()` with zero arguments (`app/` has no references yet — Task 8 hasn't landed) so there is no behavioral regression.

```diff
+  let disposed = false;
   return () => {
+    if (disposed) return;
+    disposed = true;
     pause(); io.disconnect(); ro.disconnect();
     ...
```
- 3 added lines, 0 removed — the idempotency guard, per Step 4. The three teardown calls the brief asked me to confirm (`renderer.dispose()`, `renderer.forceContextLoss()`, removing the canvas) were **already present** in the original file's disposer as `C.renderer.dispose()`, `C.renderer.forceContextLoss()`, and `C.renderer.domElement.remove()` — I did not need to add them, only guard the whole block.

Every other line in the 207-line file (185 of 197 original lines, unchanged) is byte-for-byte identical to `.source/vendor/liquid-ether.js` — confirmed by `diff -u`, which shows exactly the two hunks above and nothing else. No shader strings, no simulation constants, no easing/lerp maths were touched.

### `lib/stroke-text.ts` — 9 lines removed, 21 lines added, in 6 hunks (updated in fix round 1, see below)

```diff
-const gsap = window.gsap;
+import { gsap } from 'gsap';
...
-export function mount(root, o = {}) {
+export type StrokeOpts = { ... };
+
+export function mount(root: HTMLElement, o: StrokeOpts): () => void {
```
- Import line (Step 2) and option-bag type + signature typing (Step 3), same reasoning as ether: kept the original `root`/`o` parameter names, dropped the `= {}` default for the same strict-mode reason.

```diff
-  const font = t => { ... };
-  const mk = (attr, data) => {
+  const font = (t: any) => { ... };
+  const mk = (attr: any, data: any) => {
     const t = document.createElementNS(NS, 'text'); font(t);
-    Object.entries(attr).forEach(([k, v]) => t.setAttribute(k, v));
+    Object.entries(attr).forEach(([k, v]: [string, any]) => t.setAttribute(k, v));
```
- 3 lines changed in place — implicit-`any` parameter annotations (Step 3's "annotate as `any`" instruction), no logic touched.

```diff
-  let box = null, tl = null, io = null, killed = false;
+  let box: any = null, tl: any = null, io: any = null, killed = false;
```
- 1 line changed — same, `any` annotations on the three state variables.

```diff
-    const st = p.reverse ? { each: p.stagger, from: 'end' } : p.stagger;
+    const st: any = p.reverse ? { each: p.stagger, from: 'end' } : p.stagger;
```
- 1 line changed — `any` annotation, GSAP stagger overload workaround.

```diff
-    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setEnd(); return; }
+    if ((window.matchMedia as any) && matchMedia('(prefers-reduced-motion: reduce)').matches) { setEnd(); return; }
```
- 1 line changed — inline cast, same category as an `any` annotation, applied to the truthy-check target rather than a variable declaration since there's no local variable to annotate here. The check itself, and everything it guards, is unchanged.

```diff
-  return () => { killed = true; if (tl) tl.kill(); if (io) io.disconnect(); root.removeEventListener('pointerenter', play); gsap.killTweensOf([...strokes(), ...fills(), rect]); };
+  let disposed = false;
+  return () => {
+    if (disposed) return;
+    disposed = true;
+    killed = true; if (tl) tl.kill(); if (io) io.disconnect(); root.removeEventListener('pointerenter', play); gsap.killTweensOf([...strokes(), ...fills(), rect]);
+  };
```
- 1 line removed, 6 added — the idempotency guard, added in **fix round 1** (Finding 3, folded in). See that section below for why: this was not a correctness bug (the review confirmed every call in the original one-liner is independently safe to run twice — see the superseded reasoning that used to sit here, now moved there), but the guard makes the brief's "both disposers are idempotent" contract verifiable by a test instead of resting on an argument about third-party API contracts.

Every other line in the 99-line file (83 of 92 original lines, unchanged) is byte-for-byte identical to `.source/vendor/stroke-text.js`.

## Facts confirmed vs. what the brief assumed

- **Import lines:** the brief flagged that these "may not be verbatim." I greped both source files for `__resources` and `window.gsap` before touching anything. In this case they were exactly verbatim: `const THREE = await import(window.__resources.three);` (line 2 of `liquid-ether.js`) and `const gsap = window.gsap;` (line 2 of `stroke-text.js`), each occurring exactly once in its file. No surprises, but I verified rather than assumed.
- **Renderer variable name:** the brief's Step 4 snippet assumed a bare local `renderer`. The actual file has no such variable — the `THREE.WebGLRenderer` lives at `C.renderer`, a property of a small local state object `const C = { width, height, renderer: null, clock: null }` declared near the top of `mount`. I used `C.renderer` (its real name) everywhere the brief said "renderer," including in the disposer guard.

## Test output

This section reflects the current file (post fix-round-1; see that section for the round-0 -> round-1 delta). `node --test lib/effects.test.mjs`:
```
TAP version 13
# Subtest: ether disposer guards double-dispose before releasing the context
ok 1 - ether disposer guards double-dispose before releasing the context
# Subtest: stroke disposer guards double-dispose before releasing tweens and observers
ok 2 - stroke disposer guards double-dispose before releasing tweens and observers
# Subtest: vendor modules import real packages, not the artifact runtime
ok 3 - vendor modules import real packages, not the artifact runtime
1..3
# tests 3
# pass 3
# fail 0
# cancelled 0
# skipped 0
```

`npx tsc --noEmit`: no output, exit code 0.

Combined gate (`node --test lib/effects.test.mjs && npx tsc --noEmit`): both pass, confirmed at each stage of both rounds (round 0 mid-work and final; round 1 after the test rewrite and after the stroke-text guard).

Environment: Node v22.12.0, TypeScript 5.9.3 (via `npx tsc --version`), run from `C:\arohance projects\Arohance-new-website` (space in path handled by quoting throughout).

## Files changed

- `lib/liquid-ether.ts` (new in round 0; untouched in round 1)
- `lib/stroke-text.ts` (new in round 0; disposer guard added in round 1)
- `lib/effects.test.mjs` (new in round 0; rewritten in round 1)

Commits:
- `720603c` — "feat: port LiquidEther and StrokeText to typed modules with safe disposal" (round 0; 3 files changed, 326 insertions)
- `789fcd2` — "fix: structurally scope the disposer leak test and guard stroke-text's disposer" (round 1; 2 files changed, 41 insertions, 6 deletions)

No other files were touched in either round. `git diff --stat` against `package.json`/`package-lock.json`/`tools/` is empty.

## Self-review findings

*(Round 0. See "Fix report round 1" below for the review that followed and what changed as a result.)*

- **Fidelity:** diffed each file against `.source/vendor/` (shown in full above, as of round 0). liquid-ether.ts: 2 removed / 12 added lines in 2 hunks. stroke-text.ts: 8 removed / 15 added lines in 5 hunks. Every changed line maps to import / type / signature / disposer-guard / strictness-annotation — I went through each hunk line by line above and none of them touch simulation constants, shader source, easing curves, timing values, or DOM/GSAP call structure.
- **Completeness:** `grep -rn "__resources"` and `grep -rn "window\.gsap"` across `lib/` return zero hits outside `effects.test.mjs`'s own assertions (which check for their *absence*).
- **Disposal:** liquid-ether's disposer now starts with `if (disposed) return; disposed = true;`, making a second call a genuine no-op (nothing below that line executes). The three release calls (`domElement.remove()`, `dispose()`, `forceContextLoss()`) were already present in the vendored source and are preserved verbatim, now behind the guard. I additionally proved (via the temporary boundary-check file, since removed) that `@ts-nocheck` in this file does not weaken the type-checking that callers of `mount`/`EtherOpts` get.
- **Discipline:** no dependency changes, no files under `tools/` touched, no animation-logic edits. Confirmed via `git status`/`git diff --stat` that only the three intended new files exist in the working tree.

I missed, at this stage, that the leak-guard test's three assertions had no structural coupling to each other or to the actual disposer body — the review caught this (Finding 1 below) with a hand-built counterexample I would not have thought to construct myself.

## Issues or concerns

*(Round 0. Both items below were resolved in fix round 1 — kept here for the record, with a pointer to what changed.)*

1. ~~**stroke-text.ts's disposer has no explicit `disposed` guard**~~ — **resolved in fix round 1** (Finding 3, folded in). The underlying judgment (every call in the original one-liner is independently idempotent-safe) was checked and confirmed correct by the review; the guard was added anyway so the "both disposers are idempotent" contract is verified by a test rather than resting on an argument about GSAP/DOM API contracts.
2. I removed the `= {}` runtime default from both `mount` signatures (making `o`/opts a required argument) because the brief's produced interface shows `opts: EtherOpts`/`opts: StrokeOpts` with no default, and keeping `= {}` while typing the parameter as the fully-required option type is a `tsc` error under `strict`. **Resolved (confirmed safe) in fix round 1**: the review checked this against the real pre-port call sites in `home.html`/`about.html`/`services.html` and found every field maps 1:1 with a complete literal at every call site, so `Object.assign(defaults, undefined)` never actually happens in practice and this cannot be a behavioral regression.
3. Per your instruction not to dispatch subagents, all of the above — reading, editing, running tests/tsc, and this review — was done directly by me in this session; nothing was delegated. Same is true of fix round 1 below.

## Fix report round 1 (post-review, findings 1, 2, 3)

The review confirmed the port itself was clean — independently re-ran the `.source/vendor/` fidelity diffs and got my exact round-0 counts (2/12 and 8/15), confirmed zero touches to shader strings, simulation constants, easing, or draw order, and checked `EtherOpts`/`StrokeOpts` against the real pre-port call sites in `home.html`/`about.html`/`services.html`, finding every field maps 1:1 — which closed my round-0 concern #2 about the dropped `= {}` default with real evidence rather than argument. It raised two Important findings and folded in one Minor. Per the coordinator's explicit instructions, I did not touch the two items ruled out of scope (no try/catch around `mount()`'s WebGL init — real, but unchanged from the vendored original and fixing it means adding error-handling logic to non-disposer code, which the fidelity mandate forbids; and `EtherOpts`/`StrokeOpts` omitting runtime-read-only fields like `isViscous`/`dt`/`BFECC`/`reverse`/`height` — confirmed no real call site customizes any of them, so it's type-surface completeness only).

### Finding 1 (Important): the leak-guard test didn't pin what it claimed

Root cause: the round-0 test (`lib/effects.test.mjs`, written verbatim from the brief's Step 5) asserted three independent whole-file regexes — "does `forceContextLoss()` appear anywhere," "does `renderer.dispose()` appear anywhere," "does `if (disposed) return;` appear anywhere" — with no requirement that any of them appear in the *same place*, let alone inside the actual closure `mount()` returns. A file where the guard text sits in a dead, unwired helper and the real disposer has zero double-dispose protection satisfies all three regexes. That's the one failure mode Review Focus 3 exists to catch, sitting behind a test that structurally cannot catch it. This was a bug in the brief's Step 5 spec, which I implemented verbatim as instructed — not a deviation I introduced.

**Fix — `lib/effects.test.mjs`.** Added a `disposerBody(src, label)` helper that finds the literal `return () => {` mount() ends with (confirmed by inspection that both files' disposers actually start this way — no shape mismatch to report) and walks brace depth from there to slice out exactly the returned closure's text. Rewrote the ether test to run its three assertions against that slice instead of the whole file, and to additionally assert the guard's index precedes the release calls' indices (order within the disposer, not just presence):

```js
const disposerBody = (src, label) => {
  const start = src.lastIndexOf('return () => {');
  assert.notEqual(start, -1, `${label}: no returned disposer found`);
  let depth = 0, i = src.indexOf('{', start);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(start, j + 1);
  }
  assert.fail(`${label}: unbalanced disposer body`);
};

test('ether disposer guards double-dispose before releasing the context', () => {
  const body = disposerBody(ether, 'liquid-ether');
  const guard = body.indexOf('if (disposed) return;');
  const force = body.indexOf('forceContextLoss()');
  const disp = body.search(/\.dispose\(\)/);
  assert.ok(guard !== -1, 'guard must live inside the returned disposer');
  assert.ok(force !== -1, 'must force context loss inside the disposer');
  assert.ok(disp !== -1, 'must dispose the renderer inside the disposer');
  assert.ok(guard < force && guard < disp, 'guard must precede the release calls');
});
```
The import-check test (`vendor modules import real packages...`) was left as-is — a whole-file substring check is the *correct* scope for "does this string appear anywhere in the file at all," since there's no positional claim to get wrong there. Only the disposer test had the structural gap.

**Proof the new test discriminates (both directions), done in the scratch directory, nothing left in the repo:**

I built the exact class of counterexample the reviewer described — a hand-built `liquid-ether.ts` with the guard text living in an unwired dead helper and the real disposer carrying no protection at all:
```ts
function unusedHelper(disposed) {
  if (disposed) return;
  console.log('never called, never wired to the returned disposer');
}

export function mount(container: HTMLElement, o: EtherOpts): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  container.prepend(renderer.domElement);
  // BUG: no `disposed` flag guards this closure.
  return () => {
    renderer.domElement.remove();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
```
(Full file: `scratchpad/counterexample/lib/liquid-ether.ts` — written only under the scratch directory, never inside the repo, so there was nothing to delete from the repo; `git status --porcelain` before and after this exercise shows only the two real files touched.)

Ran the **round-0 test** (byte-identical to the brief's Step 5 assertions) against this file:
```
TAP version 13
# Subtest: [OLD/round-0] ether disposer releases the GL context and is idempotent
ok 1 - [OLD/round-0] ether disposer releases the GL context and is idempotent
1..1
# tests 1
# pass 1
# fail 0
```
**Passes** — confirming the bug: the old test is blind to a disposer with zero protection.

Ran the **new, round-1 test** (the `disposerBody`-sliced version above) against the *same* broken file:
```
TAP version 13
# Subtest: [NEW/round-1] ether disposer guards double-dispose before releasing the context
not ok 1 - [NEW/round-1] ether disposer guards double-dispose before releasing the context
  error: 'guard must live inside the returned disposer'
  code: 'ERR_ASSERTION'
  expected: true
  actual: false
1..1
# tests 1
# pass 0
# fail 1
```
**Fails**, with exactly the assertion I intended (`guard must live inside the returned disposer`) — confirming the new test catches the exact bug the old one missed. Combined with the real `lib/effects.test.mjs` passing 3/3 against the actual (correct) `lib/liquid-ether.ts` and `lib/stroke-text.ts` (see Test output above), this is genuine discrimination in both directions, not a test that merely always fails or always passes.

### Finding 2 (Important): `@ts-nocheck` justification was wrong — corrected in place, decision unchanged

My round-0 report claimed `C`, `M`, and `F` in `liquid-ether.ts` "require restructuring a declaration, not just appending `: any`." The review checked this and it doesn't hold: each is a single object literal, one `: any` on the existing declaration silences it, same technique as `box`/`tl`/`io` in `stroke-text.ts`. I corrected the "Strictness approach per file" section above in place rather than leaving the wrong claim to stand next to a correction bolted on elsewhere — it now states the honest count (~11 declaration-site edits / ~19 `any`/`?` tokens, the same technique as `stroke-text.ts` just applied more times, not a different category) and the real reason for keeping `@ts-nocheck` per the coordinator's ruling: `liquid-ether.ts` is frozen, fidelity-critical vendored code we don't own and won't be editing the internals of again, so minimizing touched lines there is worth more than in-file diagnostics on code we'd never act on — not that the fix was structurally infeasible. No code changed for this finding, only the report.

### Finding 3 (Minor, folded in): stroke-text's disposer now guards double-dispose too

The review traced every statement in the original one-liner and confirmed my "natively idempotent" reasoning was correct — this was never a live bug. Added anyway, per the coordinator's framing, because it rested on third-party contracts (GSAP `kill()`, `IntersectionObserver.disconnect()`) rather than our own code, was asymmetric with ether, and had zero test coverage. Changed `lib/stroke-text.ts`'s disposer from the original single-line return to the same three-line guard pattern as ether's (diff shown in the per-file diff summary above), and added a mirrored test using the same `disposerBody` helper:
```js
test('stroke disposer guards double-dispose before releasing tweens and observers', () => {
  const body = disposerBody(stroke, 'stroke-text');
  const guard = body.indexOf('if (disposed) return;');
  const killTl = body.indexOf('tl.kill()');
  const disconnectIo = body.indexOf('io.disconnect()');
  assert.ok(guard !== -1, 'guard must live inside the returned disposer');
  assert.ok(killTl !== -1, 'must kill the timeline inside the disposer');
  assert.ok(disconnectIo !== -1, 'must disconnect the observer inside the disposer');
  assert.ok(guard < killTl && guard < disconnectIo, 'guard must precede the teardown calls');
});
```
Verified this doesn't collide with the *other* `tl.kill()` call that already exists in `play()` (`const play = () => { if (tl) tl.kill(); tl = build(); tl.play(0); };`, earlier in the file): `disposerBody` slices only the text of the returned closure, so `body.indexOf('tl.kill()')` only ever searches within that slice — the occurrence inside `play()` is outside the slice and can't produce a false positive.

### Diff scope

```
git diff 720603c..789fcd2 -- lib/effects.test.mjs lib/stroke-text.ts
```
Touched exactly the two files above: `lib/effects.test.mjs` rewritten (Finding 1: `disposerBody` helper, restructured ether test, new mirrored stroke test, import-check test untouched) and `lib/stroke-text.ts`'s disposer (Finding 3: 1 line removed, 6 added, replacing the single-line return with the guarded three-line-plus-brace form). No other files touched; `lib/liquid-ether.ts` itself has zero diff in this round (`git diff --stat -- lib/liquid-ether.ts` between the two commits is empty) — only its test coverage improved.

### Test run (GREEN, 3/3) and typecheck

```
node --test lib/effects.test.mjs
```
```
TAP version 13
# Subtest: ether disposer guards double-dispose before releasing the context
ok 1 - ether disposer guards double-dispose before releasing the context
# Subtest: stroke disposer guards double-dispose before releasing tweens and observers
ok 2 - stroke disposer guards double-dispose before releasing tweens and observers
# Subtest: vendor modules import real packages, not the artifact runtime
ok 3 - vendor modules import real packages, not the artifact runtime
1..3
# tests 3
# pass 3
# fail 0
# cancelled 0
# skipped 0
```
`npx tsc --noEmit`: no output, exit code 0.

### Commit

`789fcd2` — "fix: structurally scope the disposer leak test and guard stroke-text's disposer" (`lib/effects.test.mjs`, `lib/stroke-text.ts` only; 2 files changed, 41 insertions, 6 deletions; `Co-Authored-By` trailer included). Second commit on the branch for this task, on top of `720603c`.
