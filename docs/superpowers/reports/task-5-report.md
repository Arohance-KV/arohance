# Task 5 Report: Port the shared behaviour modules and the runtime mount

## What I implemented

All files created exactly per the brief's file list, in `lib/behaviors/` and `components/`:

1. **`lib/behaviors/types.ts`** — `Behavior` type and the frozen `MOTION` constant (`{ y: 46, dur: 1100, amp: 96 }`). Copied verbatim from brief Step 1.
2. **`lib/behaviors/theme.ts`** — `applyTheme`, sets `--ag-accent` to the frozen `#F2600C` and returns a no-op disposer. Copied verbatim from brief Step 2.
3. **`lib/behaviors/reveal.ts`** — `reveal`, IntersectionObserver-driven fade/translate reveal with a 1600ms guard timeout. Copied verbatim from brief Step 3 ("ported verbatim from `initReveal`").
4. **`lib/behaviors/parallax.ts`** — `parallax`, rAF-batched scroll/resize-driven transform. Copied verbatim from brief Step 4.
5. **`lib/behaviors/nav.ts`** — `nav`, scroll listener restyling the nav bar. Copied from brief Step 5 **with Ruling 1 applied** (dead `darks`/`probe`/discarded-`.some()` computation removed — details below).
6. **`lib/behaviors/clock.ts`** — `clock`, lifted from `initClock` in `.source/templates/home.html`. New authoring (brief did not supply code); see diff section below.
7. **`lib/behaviors/form.ts`** — `form`, lifted from `initForm` in the same source file. New authoring; see diff section below.
8. **`lib/behaviors/index.ts`** — re-exports all six behaviours plus `SHARED: Behavior[]` in original `componentDidMount` order. Copied verbatim from brief Step 7.
9. **`components/AgRuntime.tsx`** — client-component runtime mount. Copied from brief Step 8 **with Ruling 2 applied** (doc comment on the `modules` prop; no defensive memoisation added, effect dependency array left as `[modules]`).
10. **`lib/behaviors/ssr.test.mjs`** — SSR-safety test. Copied verbatim from brief Step 9.

## `clock` and `form`: source ranges, diff summary, justification

Source: `.source/templates/home.html`, `<script type="text/x-dc">` block.
- `initClock`: lines 1408–1420
- `initForm`: lines 1422–1435

Both methods only call `this.root()` and `this.cleanups.push(...)` — no other helper methods, no `this.props`, no DOM access outside `[data-ag-root]`. Neither needed `this.motion()` or `this.props.accentColor`/`this.props.motion`, so those porting-table rows never trigger. This matched the brief's expectation exactly; no escalation was needed.

### `clock.ts` diff summary (source lines 1408–1420 vs. `lib/behaviors/clock.ts`)

| Change | Justification |
|---|---|
| `initClock() {` → `export const clock: Behavior = (root) => {` | Porting-table row 1 (method → named `Behavior` const). |
| `const root = this.root(); if (!root) return;` deleted | Porting-table row 2 (`root` is now the parameter). |
| Added `const cleanups: (() => void)[] = [];` | Porting-table row 5 setup (local cleanups array). |
| `const el = root.querySelector('[data-ag-clock]'); if (!el) return;` → split into `const el = root.querySelector<HTMLElement>('[data-ag-clock]');` / `if (!el) return () => {};` | Added `<HTMLElement>` generic for type-consistency with sibling files (not functionally required here — only `.textContent` is used, which exists on `Node`). Guard's `return;` → `return () => {};` because every `Behavior` must return a disposer, even a no-op one (stated in the task and matched by the brief's own `nav.ts`/`parallax.ts` early-return guards). |
| `try { const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()); el.textContent = t + ' IST'; } catch (e) { el.textContent = new Date().toLocaleTimeString(); }` | **Unchanged, byte-for-byte** — same locale, same options object, same `' IST'` suffix, same catch fallback. |
| `tick(); const id = setInterval(tick, 1000);` | **Unchanged** — same 1000ms interval. |
| `this.cleanups.push(() => clearInterval(id));` → `cleanups.push(() => clearInterval(id));` | Porting-table row 5 (`this.cleanups.push` → `cleanups.push`). |
| implicit `}` → `return () => cleanups.forEach((fn) => fn());` | Porting-table row 6. |

**6 substantive differences, every one traceable to a porting-table row or the `Behavior` no-op-disposer requirement.** The clock tick logic itself — selector, locale, format options, string suffix, interval, catch fallback — is untouched.

### `form.ts` diff summary (source lines 1422–1435 vs. `lib/behaviors/form.ts`)

| Change | Justification |
|---|---|
| `initForm() {` → `export const form: Behavior = (root) => {` | Porting-table row 1. |
| `const root = this.root(); if (!root) return;` deleted | Porting-table row 2. |
| Added `const cleanups: (() => void)[] = [];` | Porting-table row 5 setup. |
| Local var `form` renamed to `el` | **Not literally in the porting table** — forced by the interface requirement that the exported const itself be named `form`; reusing `form` as the inner local would shadow the outer export. Followed the exact convention the brief's own `nav.ts` established (local element named `el`, not reused from the export name). Purely a name; every reference to it (`el.querySelector`, `el.addEventListener`, `el.removeEventListener`) moves with it — no behavioural change. |
| `root.querySelector('[data-ag-form]')` → `root.querySelector<HTMLFormElement>(...)` | Confirmed against the source template (`.source/templates/home.html:883`, an actual `<form data-ag-form>`) — precise, not required by `tsc` (an `HTMLElement` generic would also have compiled). |
| `if (!form) return;` → `if (!el) return () => {};` | Same no-op-disposer requirement as `clock.ts`. |
| `const onSubmit = e => {` → `const onSubmit = (e: Event) => {` | **Not in the porting table** — required by `strict`/`noImplicitAny`: `onSubmit` is assigned to a `const` before being passed to `addEventListener`, so TypeScript cannot contextually infer the event type the way it can for an inline callback. No behavioural effect. |
| `const btn = form.querySelector('[data-ag-submit]');` → `const btn = el.querySelector<HTMLButtonElement>('[data-ag-submit]');` | `form.`→`el.` is the rename above. The `<HTMLButtonElement>` generic **is** functionally required: `btn.disabled = true` three lines later doesn't type-check against a bare `Element`. Confirmed the underlying tag is genuinely `<button data-ag-submit type="submit">` (`.source/templates/home.html:896`). |
| `if (!btn) return;` | **Unchanged.** |
| `btn.textContent = 'Thanks — we reply within a day';` | **Same runtime string, not byte-for-byte source** — corrected per review (see Fix report below): the source (`.source/templates/home.html:1429`) spells this with the 6-byte JS escape sequence `—`; my file has the literal 3-byte UTF-8 em-dash character instead. Both evaluate to the identical `textContent` value at runtime, but I overstated this as byte-identical in the original write-up. This is the "hardcoded success message" the task told me to port as-is; the string's *value* is unchanged, only its source-level spelling of one character. |
| `btn.style.color = 'var(--ag-accent,#F2600C)';` | **Unchanged, byte-for-byte** — including the no-space-after-comma formatting. |
| `btn.disabled = true;` | **Unchanged.** |
| `form.addEventListener('submit', onSubmit);` → `el.addEventListener(...)` | Rename propagation only. |
| `this.cleanups.push(() => form.removeEventListener('submit', onSubmit));` → `cleanups.push(() => el.removeEventListener('submit', onSubmit));` | Porting-table row 5 + rename propagation. |
| implicit `}` → `return () => cleanups.forEach((fn) => fn());` | Porting-table row 6. |

The one deviation not literally listed in the porting-rules table is the `form`→`el` rename, made necessary by the interface's naming requirement and resolved the same way the brief's own `nav.ts` resolves the identical naming collision. Everything else is either a table rule or a mechanical `strict`-mode type annotation with no behavioural effect. There is no fake-delay, no surprise validation, no alternate success path in `initForm` — it synchronously rewrites the button's text/color and disables it on submit, nothing else, and that's exactly what's ported.

## Surprises / gaps in the porting-rules table

- Nothing about `initClock`/`initForm` themselves was surprising — both are simple, self-contained, and match the table's assumptions exactly (confirmed no `this.props`, no external helper calls, no DOM access outside `root`).
- The table has no row for "add a parameter type annotation" or "add a querySelector generic," both of which strict TypeScript required in a couple of spots (documented above). These are mechanical, zero-behaviour-change additions, consistent with what the brief's own `reveal.ts`/`parallax.ts`/`nav.ts` already do (e.g. `<HTMLElement>` generics that the original untyped JS never had).
- The table has no row for "rename a local variable that collides with the exported const's own name." Only `form.ts` hits this (the original's local variable is literally named `form`, same as the file's required export name). Resolved by following `nav.ts`'s own precedent (`el`, not the export's name).

## Ruling confirmation

**Ruling 1 (dead `darks`/`onDark` removed):** Confirmed. `lib/behaviors/nav.ts` has no `darks` query, no `probe` variable, and no discarded `.some()` call. It keeps exactly what the ruling specified: the scroll listener, the `stuck` threshold at 40px, the padding/logo-height changes, the hardcoded colours (`#F5F2ED`, `#1A1815`), and the button restyling. I added one short comment explaining the omission (for future readers who diff against the original and wonder where the dark-section probe went) — the comment describes the removal, it does not reintroduce any of the removed computation.

**Ruling 2 (stable-reference doc comment):** Confirmed. `components/AgRuntime.tsx` defines a named `AgRuntimeProps` type with a JSDoc comment directly on `modules` stating it must be a stable (module-level constant) reference and explaining why (`[modules]` dependency array → teardown/remount on every render if given a fresh array identity). No `useMemo`, no ref-based caching, no defensive comparison was added — the effect body and its `[modules]` dependency array are byte-for-byte what the brief specified in Step 8.

## Test / typecheck / build output

### `node --test lib/behaviors/ssr.test.mjs` — PASS

```
TAP version 13
# Subtest: no behaviour touches window or document at module scope
ok 1 - no behaviour touches window or document at module scope
# Subtest: AgRuntime is a client component
ok 2 - AgRuntime is a client component
1..2
# tests 2
# pass 2
# fail 0
```
Exit code 0.

### `npx tsc --noEmit` — PASS

No output. Exit code 0.

### `npm run build` — FAILS, for reasons entirely outside this task's file set

```
✓ Compiled successfully in 15.6s
   Linting and checking validity of types ...
Failed to compile.

./lib/behaviors/clock.ts
11:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/liquid-ether.ts
1:1  Error: Do not use "@ts-nocheck" because it alters compilation errors.  @typescript-eslint/ban-ts-comment
56:5  Warning: Expected an assignment or function call and instead saw an expression.
64:150  Warning: Expected an assignment or function call and instead saw an expression.
205:105  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/stroke-text.ts
32:20 / 33:21 / 33:32 / 35:52 / 48:12 / 48:28 / 48:44 / 75:15 / 88:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:49  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
```

**This is not caused by anything in this task's diff.** I isolated it: `git status --short` before committing showed only `components/` and `lib/behaviors/` as new/untracked — nothing under `lib/liquid-ether.ts`, `lib/stroke-text.ts`, or anywhere else was touched. Running ESLint against only my new files (`npx eslint lib/behaviors components/AgRuntime.tsx`) reports exactly **one warning, zero errors** (`clock.ts:11:14`, the unused catch-binding `e` — a byte-for-byte port of the original's `catch (e) { ... }`, and the identical pattern already present, unmodified, in `lib/stroke-text.ts:54` from Task 4). A warning alone does not fail `next build`; that isolated lint run exits 0.

The actual `Failed to compile.` comes from real `error`-severity findings in `lib/liquid-ether.ts` (`@ts-nocheck`) and `lib/stroke-text.ts` (nine `no-explicit-any` sites) — both files I am explicitly told not to modify, both pre-existing from Task 4. I checked Task 4's own report (`task-4-report.md`): its verification gate was `node --test lib/effects.test.mjs && npx tsc --noEmit` — it never ran `npm run build`, and its `@ts-nocheck`/`any` strategy for those two files was a deliberate, reviewed decision (frozen vendored fidelity code, not to be touched again). Nobody had run the ESLint-in-build step against those files until now. Task 5's brief calls `npm run build` "the first task adding code that Next.js compiles" — that's accurate for compiling, but it's also, incidentally, the first time this branch's `npm run build` (with its ESLint pass) has been run at all, and it surfaces a latent issue in already-committed, out-of-scope files.

I did not touch `lib/liquid-ether.ts`, `lib/stroke-text.ts`, or any shared ESLint/Next config to silence this — both are explicitly off-limits for this task, and papering over it via a config change would mask real findings project-wide, which isn't a call for Task 5 to make unilaterally.

## Files changed

Commit `1e81395` — "feat: port shared behaviour modules and the runtime mount" (10 files, 219 insertions, 0 deletions):
- `lib/behaviors/types.ts`
- `lib/behaviors/theme.ts`
- `lib/behaviors/reveal.ts`
- `lib/behaviors/parallax.ts`
- `lib/behaviors/nav.ts`
- `lib/behaviors/clock.ts`
- `lib/behaviors/form.ts`
- `lib/behaviors/index.ts`
- `lib/behaviors/ssr.test.mjs`
- `components/AgRuntime.tsx`

No other files were touched. `git status --short` immediately before staging showed only these two new directories; nothing under `tools/`, `lib/liquid-ether.ts`, `lib/stroke-text.ts`, `lib/effects.test.mjs`, or `package.json`/`package-lock.json` changed.

## Self-review findings

- **Fidelity:** `clock.ts`/`form.ts` diffed line-by-line against the source above; every difference maps to a porting-table rule, the `Behavior` no-op-disposer requirement, a mechanical strict-TypeScript annotation, or the one forced rename — all documented with justification. `reveal.ts`/`parallax.ts`/`nav.ts`/`theme.ts`/`index.ts`/`AgRuntime.tsx` match the brief's given code exactly, modulo the two explicit rulings.
- **Disposal:** every behaviour returns a working disposer, including a no-op one on early-return branches (`theme`, and the not-found branches of `reveal`/`parallax`/`nav`/`clock`/`form`). `clock`'s interval is cleared, `form`'s submit listener is removed, `nav`'s scroll listener is removed, `parallax`'s scroll+resize listeners are removed, `reveal`'s observer is disconnected and its guard timeout cleared. `reveal.ts` and `parallax.ts` each have one uncancelled one-shot timer/rAF inherited directly from the original design (a per-element reveal-delay `setTimeout`, and a stray in-flight `requestAnimationFrame`) — both are in code the brief supplied verbatim as complete, and both mirror the original method's own behaviour exactly, so I did not alter them; flagging for visibility, not as something I introduced.
- **SSR:** confirmed via `ssr.test.mjs` (passing) and by re-reading every file: no `window`/`document` reference sits on an unindented line anywhere in `lib/behaviors/`, and `components/AgRuntime.tsx` starts with `'use client';`. `AgRuntime.tsx`'s only connection to `lib/behaviors` is `import type { Behavior } from '@/lib/behaviors'` — a type-only import that's erased at compile time, so even the wiring itself carries zero runtime coupling until a future task adds a value import.
- **Discipline:** no new dependencies (`package.json`/`package-lock.json` untouched), nothing under `tools/` touched, no config surface added for the frozen constants (`#F2600C`, `MOTION`, etc. are literal values, not props), no behaviours beyond the six the brief specifies.

## Issues or concerns

1. **`npm run build` fails**, but only due to pre-existing `error`-severity ESLint findings in `lib/liquid-ether.ts` and `lib/stroke-text.ts` (Task 4's files, explicitly off-limits to me) — not due to anything in this task's diff. My new code contributes exactly one harmless `warning` (not an `error`), in a pattern already present unmodified elsewhere in the codebase. See the build-output section above for full detail and the isolation check I ran to prove it. This needs a decision above my task's scope: e.g., adding a scoped ESLint override for those two frozen vendor files, or reconsidering the `@ts-nocheck`/`any` strategy from Task 4 now that its real build-time cost is visible. I have not made that call or touched those files.
2. No other concerns. Tests, typecheck, and my own isolated lint check are all green; the port is narrow and mechanical; both rulings are applied as specified.

## Fix report (post-review): scoped ESLint override + clock.ts cleanup

The coordinator ruled this a **plan defect, not a Task 5 defect**: Task 4's verification gate was `node --test lib/effects.test.mjs && npx tsc --noEmit`, which never included `npm run build`. `lib/liquid-ether.ts` (`@ts-nocheck`) and `lib/stroke-text.ts` (nine `any` annotations) landed on the branch without ever passing through the ESLint-in-build step — Task 5 was simply the first task to run the command that noticed. **Recording explicitly, as instructed: `npm run build` was missing from Task 4's gate.** Every remaining task that adds app code now carries the build in its gate.

### Config change — `eslint.config.mjs`

Authorised by the coordinator, scoped to this one file, as a files-scoped override appended after the existing array entries:

```js
{
  // Vendored vanilla ports of React Bits components (LiquidEther, StrokeText).
  // Their internals are third-party code we deliberately do not own or edit —
  // only the exported mount() boundary is ours. @ts-nocheck and the `any`
  // annotations are deliberate; see docs/superpowers/plans for the rationale.
  files: ["lib/liquid-ether.ts", "lib/stroke-text.ts"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
},
```

Adapted to the file's existing style (double quotes, 2-space indent) and to its existing structural pattern: the pre-existing `ignores` block is already a plain flat-config object appended directly to the `eslintConfig` array, not routed through the `compat` layer (`compat` is only used for `compat.extends(...)` to pull in the shareable `next/*` configs) — the new override follows that same plain-object pattern rather than wrapping it in `compat`.

Confirmed `docs/superpowers/plans/2026-09-25-arohance-nextjs-port.md` actually exists before keeping that pointer in the comment, rather than leaving an unverified reference.

Why this shape (sanity-checked against the coordinator's four alternatives before applying, not just copied):
- **Not a global rule disable** — `ban-ts-comment` and `no-explicit-any` stay enforced on every file Tasks 5–13 write; only these two named files are exempted.
- **Not `eslint.ignoreDuringBuilds`** — that silences lint for the whole project over a two-file problem and would hide real findings in every later task.
- **Not removing `@ts-nocheck` and annotating instead** — would trade the one `ban-ts-comment` error for nine new `no-explicit-any` errors, while touching frozen fidelity-critical vendored code for no net gain.
- **Not relocating to `lib/vendor/`** — churns import paths and `lib/effects.test.mjs` (which reads these two files by their exact current path) for no functional gain; two explicit filenames is the shorter diff and grows by one line if another vendor file ever shows up.

`git status`/`git diff --stat` confirm `lib/liquid-ether.ts`, `lib/stroke-text.ts`, and `lib/effects.test.mjs` are untouched by this fix — only `eslint.config.mjs` and `lib/behaviors/clock.ts` changed.

### `clock.ts` cleanup

Once the vendored-file errors were silenced, `npm run build` surfaced exactly one remaining finding in code this task owns: `lib/behaviors/clock.ts:11:14`, `'e' is defined but never used` (`@typescript-eslint/no-unused-vars`) on the ported `catch (e) { ... }`. Per the coordinator's instruction to resolve this now rather than leave it for the reviewer — since doing so doesn't distort the port — changed:

```diff
-    } catch (e) { el.textContent = new Date().toLocaleTimeString(); }
+    } catch { el.textContent = new Date().toLocaleTimeString(); }
```

The original source never referenced `e` inside the catch body either. This removes an already-unused identifier, not logic, a string, a selector, or a timing value — same exception caught, same fallback runs. This is now the one line in `clock.ts` whose diff-against-source isn't driven by the original porting-rules table or the `Behavior` no-op-disposer requirement; it's driven by this fix round's lint finding, and it has zero behavioural effect. Adding it to the fidelity ledger from the first report: `clock.ts` now has 7 substantive differences from source (the original 6, plus this one), all justified.

### All three gates — final run, all green

**`node --test lib/behaviors/ssr.test.mjs`** — PASS
```
TAP version 13
# Subtest: no behaviour touches window or document at module scope
ok 1 - no behaviour touches window or document at module scope
# Subtest: AgRuntime is a client component
ok 2 - AgRuntime is a client component
1..2
# tests 2
# pass 2
# fail 0
```
Exit code 0.

**`npx tsc --noEmit`** — PASS. No output. Exit code 0.

**`npm run build`** — PASS. Exit code 0.
```
 ✓ Compiled successfully in 1330ms
   Linting and checking validity of types ...

./lib/liquid-ether.ts
56:5  Warning: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions
64:150  Warning: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions
205:105  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/stroke-text.ts
54:49  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

   Collecting page data ...
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                     5.5 kB         108 kB
└ ○ /_not-found                            990 B         104 kB
+ First Load JS shared by all             103 kB
```
The four remaining lines are all pre-existing `warning`-severity findings inside `lib/liquid-ether.ts`/`lib/stroke-text.ts` (untouched, off-limits) — `no-unused-expressions` and `no-unused-vars`, neither of which the coordinator's ruling scoped the override to touch. **Zero findings anywhere in this task's own files.**

### Files changed (this fix round)

Commit `56c69ec` — "fix: scope ESLint overrides to vendored effects files" (2 files changed, 12 insertions, 1 deletion):
- `eslint.config.mjs` — scoped override added.
- `lib/behaviors/clock.ts` — unused catch binding removed.

`lib/liquid-ether.ts`, `lib/stroke-text.ts`, `lib/effects.test.mjs`, and everything under `tools/` remain exactly as Task 4 left them — confirmed via `git status --short` and `git diff --stat` immediately before staging this commit.

### Naming-deviation note (per coordinator's request)

Recording explicitly: the `form` → `el` local-variable rename in `lib/behaviors/form.ts` is a **deliberate naming deviation from the porting-rules table** (the table has no row for it), made necessary because the source's local variable is named `form`, identical to the file's required export name (`export const form: Behavior`), and reusing it would shadow that export. Resolved by following the exact convention `lib/behaviors/nav.ts` already established for the same collision shape (local element named `el`, not the export's own name). No other file in this task hits this collision.

## Fix report (post-review, round 2): disposer isolation, AST-based SSR check, report correction

The review verified the `clock`/`form` port line by line against source and found no drift (selectors, the `' IST'` suffix, the success message, the 1000ms interval, the submit wiring all unchanged), confirmed Ruling 1's premise (`onDark` really is assigned once and never read in the original), and confirmed the ESLint override from fix round 1 is exactly two files and two rules. Three findings landed on code/tests, not on the port itself.

### Finding 1 (Important): disposal loop dropped the original's per-cleanup error isolation

`components/AgRuntime.tsx`'s unmount cleanup was a plain `disposers.forEach((d) => d())`. The original `componentWillUnmount` (`.source/templates/home.html:1245–1248`) wraps each cleanup individually: `(this.cleanups || []).forEach(fn => { try { fn(); } catch (e) {} })`. Without that isolation, one throwing disposer aborts `forEach` and strands every disposer after it in the array — dormant today because none of `SHARED`'s six disposers throw, but not dormant once Tasks 8/12/13 add WebGL/GSAP teardown to the same array (exactly the disposers likely to throw against an already-torn-down context).

Fix, applied exactly as specified:
```diff
-    return () => disposers.forEach((d) => d());
+    return () => disposers.forEach((d) => {
+      try { d(); } catch { /* isolate: one bad disposer must not strand the rest */ }
+    });
```
This makes the port match the original's isolation semantics exactly (catch-and-continue per cleanup) while keeping the bare `catch` (no unused binding) so it doesn't reintroduce the same lint finding fix round 1 just resolved in `clock.ts`.

**Note on an earlier claim this supersedes:** the original report's Ruling 2 confirmation says the effect's dependency array and body are "byte-for-byte what the brief specified in Step 8." That was accurate as submitted; this fix changes the disposal line, so the effect *body* is no longer byte-identical to Step 8 — only the `[modules]` dependency array and the rest of Ruling 2's requirement (doc comment on `modules`, no memoisation) still are. Recorded here rather than silently edited into the earlier paragraph, so the history reads correctly in order.

### Finding 2 (Important): the SSR test's indentation heuristic is defeatable by an ordinary hazard

The reviewer's probe:
```ts
export const hazardWidth =
  window.innerWidth;
```
passed the old test 2/2, because the heuristic used line indentation as a proxy for "inside a function" — `window` landed on an indented continuation line of a top-level statement that was never inside any function. Replaced the heuristic in `lib/behaviors/ssr.test.mjs` with a real scope check using the TypeScript compiler (`typescript` is already a devDependency; no new install), exactly as specified: parse each file with `ts.createSourceFile`, walk from the top-level statements, skip any `ts.isFunctionLike` node without descending into it, and flag any `window`/`document` identifier encountered outside that skip. Kept the existing `'use client'` string check on `AgRuntime` unchanged, per instruction — that check isn't defeatable the same way.

**Discrimination proof.** Recreated the probe at `<scratchpad>/hazard-probe.ts` (outside the repo entirely — session scratch directory, never inside `lib/behaviors/`). Built two throwaway harness files reproducing the old and new check logic byte-for-byte, temporarily under `_tmp-discrimination-proof/` in the repo root (needed to be inside the project tree so `import ts from 'typescript'` resolves via the project's own `node_modules`; the probe itself never moved from the scratch directory). Ran each with `node --test`, then deleted the harness directory and confirmed `git status --short` showed no trace of it.

**Old heuristic against the probe — passes (the bug):**
```
=== OLD heuristic vs reviewer's probe ===
TAP version 13
# Subtest: [OLD heuristic] no behaviour touches window or document at module scope
ok 1 - [OLD heuristic] no behaviour touches window or document at module scope
  ---
  duration_ms: 0.7636
  ...
1..1
# tests 1
# pass 1
# fail 0
```
Exit code 0 — confirms the old check is blind to this hazard.

**New AST check against the same probe — fails, naming the right file and line:**
```
=== NEW AST check vs reviewer's probe ===
TAP version 13
# Subtest: [NEW AST check] no behaviour references window or document at module scope
not ok 1 - [NEW AST check] no behaviour references window or document at module scope
  ---
  duration_ms: 5.7231
  error: |-
    module-scope DOM access: hazard-probe.ts:2
    + actual - expected

    + [
    +   'hazard-probe.ts:2'
    + ]
    - []
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected:
  actual:
    0: 'hazard-probe.ts:2'
  operator: 'deepStrictEqual'
  ...
1..1
# tests 1
# pass 0
# fail 1
```
Exit code 1, reporting `hazard-probe.ts:2` — line 2 is exactly where `window.innerWidth` sits. Genuine discrimination in both directions, run against real `node --test` executions, not asserted from memory.

Afterward: `rm -rf _tmp-discrimination-proof` and `git status --short` showed only the two real edits (`components/AgRuntime.tsx`, `lib/behaviors/ssr.test.mjs`) — no leftover harness files, staged or unstaged.

**One additional observation, flagged rather than fixed:** I traced the given `walk` function against an IIFE-at-module-scope shape (`(function() { return window.foo; })();`) rather than just the one probe. Because `ts.isFunctionLike` matches the `FunctionExpression` node regardless of whether it's immediately invoked, `walk` returns before descending into that function's body — so a hazard inside an IIFE's body would not be flagged, even though such an IIFE genuinely executes at import time (the case the coordinator's own explanation of the bug listed as a motivating example). This is a narrower gap than the heuristic it replaces and isn't exercised by any current file, so I implemented the check exactly as specified rather than extending it unasked. Flagging for the record, per the project's standing rule about not silently sitting on a test-correctness observation.

### Finding 3 (Minor): corrected an overstated provenance claim

`task-5-report.md`'s `form.ts` diff table originally claimed the success-message line was "byte-for-byte" identical to source "including the `—` em-dash escape." Checked the actual bytes on both sides:
- Source (`.source/templates/home.html:1429`): the 6-byte ASCII escape sequence `—` (backslash, u, 2, 0, 1, 4 — confirmed via a raw byte dump, hex `5c 75 32 30 31 34`).
- Port (`lib/behaviors/form.ts`): the literal 3-byte UTF-8 em-dash character U+2014 (hex `e2 80 94`) — introduced because the Write-tool call's own JSON-string parameter decoded the `—` escape I typed into the actual character before it ever reached disk.

Both spellings evaluate to the identical runtime string (`el.textContent`/`btn.textContent` ends up with the same code point either way), so this was never a behavioural bug — but it was not byte-for-byte at the source level, and the original write-up overstated that. Corrected the claim in place in the diff table above (marked, not silently rewritten) rather than leaving an inaccurate provenance claim standing. Also: on reflection "HTML entity escape" (the review's shorthand) isn't quite the precise term for `—` either — it's a JavaScript/Unicode escape sequence, not an HTML entity (`&mdash;`/`&#8212;` would be the HTML-entity spelling) — so I used the precise term in the correction rather than repeating the shorthand.

### Deliberately not fixing (acknowledged, no action taken)

`reveal`'s per-entry `setTimeout` and `parallax`'s in-flight `requestAnimationFrame` remain uncancelled on dispose, as flagged in the original report. Per the coordinator: confirmed as an original-design gap, not a porting error, and sent to the backlog rather than fixed here. No change made.

### All three gates — final run after this fix round, all green

**`node --test lib/behaviors/ssr.test.mjs`** — PASS
```
TAP version 13
# Subtest: no behaviour references window or document at module scope
ok 1 - no behaviour references window or document at module scope
# Subtest: AgRuntime is a client component
ok 2 - AgRuntime is a client component
1..2
# tests 2
# pass 2
# fail 0
```
Exit code 0.

**`npx tsc --noEmit`** — PASS. No output. Exit code 0.

**`npm run build`** — PASS. Exit code 0.
```
 ✓ Compiled successfully in 1777ms
   Linting and checking validity of types ...

./lib/liquid-ether.ts
56:5  Warning: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions
64:150  Warning: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions
205:105  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/stroke-text.ts
54:49  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

 ✓ Generating static pages (4/4)
Route (app)                                 Size  First Load JS
┌ ○ /                                     5.5 kB         108 kB
└ ○ /_not-found                            990 B         104 kB
```
Same four pre-existing warnings, all inside the two off-limits vendored files, unchanged from fix round 1. Zero findings in this task's own files.

### Files changed (this fix round)

Commit `370f838` — "fix: isolate disposer errors and replace the SSR heuristic with an AST check" (2 files changed, 27 insertions, 10 deletions):
- `components/AgRuntime.tsx` — disposal loop now isolates each disposer's errors.
- `lib/behaviors/ssr.test.mjs` — module-scope check rewritten from an indentation heuristic to a TypeScript-AST walk.

Plus this report file, corrected/appended (not tracked by git — `.superpowers/` is gitignored).

No other files touched. The temporary discrimination-proof harness (`_tmp-discrimination-proof/`) and the scratch probe were never part of any commit; confirmed via `git status --short` both mid-process and after final cleanup.
