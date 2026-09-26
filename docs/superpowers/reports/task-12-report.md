# Task 12 Report: Convert Careers

## What I implemented

- `node tools/convert.mjs careers` → `.source/jsx/careers.jsx` (356 lines, converter exited 0 — no completeness-guard failures, no unknown constructs).
- `lib/behaviors/roles.ts` — new. Ports careers' `initRoles` and (folded in, per the Job's Step 2) `applyPay`, the latter always-on per Ruling 2.
- `lib/behaviors/navCta.ts` — new. Ports the `[data-ag-navcta]`-toggling slice of careers' bespoke `initNav` that the shared `nav.ts` doesn't cover (Ruling 1, Branch A — see below).
- `lib/behaviors/index.ts` — modified: exports `roles` and `navCta` alongside the existing behaviours. `SHARED` itself is untouched.
- `app/careers/modules.ts` — new. `CAREERS_MODULES`, built explicitly (not `[...SHARED, roles]` — see Ruling 3 finding below).
- `app/careers/careers-runtime.tsx` — new. Six-line `'use client'` wrapper, identical in shape to `services-runtime.tsx`.
- `app/careers/page.tsx` — new. Server Component; converted markup inlined verbatim from `.source/jsx/careers.jsx` except for the wrapper lines, three `next/image` swaps, and the `<ContactPill /><CareersRuntime />` mounts.

## The careers-vs-home `initNav` comparison (Ruling 1)

Careers' `initNav` — `.source/templates/careers.html:642-657`:
```js
initNav() {
  const root = this.root(); if (!root) return;
  const nav = root.querySelector('[data-ag-nav]'); if (!nav) return;
  const logo = nav.querySelector('[data-ag-logo]');
  const cta = nav.querySelector('[data-ag-navcta]');
  const onScroll = () => {
    const stuck = (window.scrollY || 0) > 40;
    nav.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    if (cta) cta.style.display = stuck && window.innerWidth > 720 ? 'flex' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  this.cleanups.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });
}
```

Home's `initNav` — `.source/templates/home.html:1311-1332`:
```js
initNav() {
  const root = this.root(); if (!root) return;
  const nav = root.querySelector('[data-ag-nav]'); if (!nav) return;
  const darks = Array.from(root.querySelectorAll('[data-dark]'));
  const onScroll = () => {
    const y = window.scrollY || 0;
    const stuck = y > 40;
    const probe = nav.getBoundingClientRect().height * 0.6;
    const onDark = darks.some(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
    nav.style.color = '#F5F2ED';
    const logo = nav.querySelector('[data-ag-logo]'); if (logo) logo.style.filter = 'none';
    nav.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    Array.from(nav.querySelectorAll('button')).forEach(b => {
      b.style.background = '#1A1815';
      b.style.color = '#F5F2ED';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  this.cleanups.push(() => window.removeEventListener('scroll', onScroll));
}
```

Surface reading: careers is missing the `darks`/`onDark` probe, the `nav.style.color` set, the `logo.style.filter` reset, and the button-recolour loop; it adds the `cta` toggle and a `resize` listener. That is not a literal superset ("home's plus CTA handling") — real assignments are missing, not just CTA added. Ruling 1 says a divergence like this should stop and ask. I verified further before treating it as a stop, because the finding this ruling is built on was itself flagged as "made in passing, not verified" — so I checked whether those omissions are semantic or just no-ops, using the actual converted markup (`.source/jsx/careers.jsx`) rather than guessing:

- `darks`/`onDark`: already proven dead in `nav.ts`'s own doc comment (computed, never read — `nav.style.color` is set unconditionally regardless). Home's port already drops this; careers dropping it is not a new fact.
- `nav.style.color = '#F5F2ED'`: careers' root div is `<div data-ag-root className="bg-[#0C0B0A] text-[#F5F2ED] ...">` (`page.tsx:8`) — `#F5F2ED` is already the inherited text colour of everything under it, nav included. Setting it inline to the same value is a no-op.
- `logo.style.filter = 'none'`: careers' logo class is `h-[46px] w-auto block [transition:height_.45s_ease]` (`page.tsx:11`) — no `filter` utility, and `filter`'s CSS default is already `none`. No-op.
- Button-recolour loop (`background:#1A1815;color:#F5F2ED`): careers' menu button's static classes are exactly `bg-[#1A1815] text-[#F5F2ED]` (`page.tsx:14`) — the same values the loop would set. No-op. (Home's own menu button is statically `#1F1E1C`/`#EDE9E1`, which is *why* home's loop is load-bearing there — careers just starts at the target value.)

So every line careers "drops" relative to home is a no-op given careers' own static markup; nothing behavioural is lost. What's added — the CTA toggle and the `resize` listener it needs (CTA visibility depends on viewport width, which nothing else in `initNav` does) — is exactly "CTA handling." Running the existing `nav.ts` unmodified alongside a small new module reproduces careers' bespoke `initNav` with no visible difference.

**Branch taken: Ruling 1, Branch A.** Created `lib/behaviors/navCta.ts`, mounted immediately after `nav` in `CAREERS_MODULES`. I did not modify `nav.ts`.

## Module list derived from careers' own `componentDidMount` (Ruling 3)

`.source/templates/careers.html:588-596`:
```js
componentDidMount() {
  this.cleanups = [];
  this.applyTheme();
  this.initReveal();
  this.initNav();
  this.initShell();
  this.initRoles();
  this.initForm();
}
```

Mapped in order: `applyTheme, reveal, nav, (navCta), shell, roles, form`.

**Disagreement with the brief:** the brief's Step 3 hypothesis was `CAREERS_MODULES = [...SHARED, roles]`, i.e. `applyTheme, reveal, parallax, nav, shell, clock, form, roles`. Careers' own `componentDidMount` never calls `initParallax` or `initClock`. I checked this wasn't merely omitted-as-dead-but-still-called: `grep -n "initParallax\|initClock\|data-ag-parallax\|data-ag-clock" .source/templates/careers.html` returns **zero hits**, anywhere in the file, and the page has exactly one `<script type="text/x-dc">` block (lines 586-747) — there's no other place those calls could be hiding. Cross-checked independently against the markup: `.source/jsx/careers.jsx` / `app/careers/page.tsx` contain no `[data-ag-parallax]`, `[data-ag-clock]`, `[data-svc]`, `[data-ag-trail]`, `[data-ag-ether]`, `[data-cursor]`, `[data-ag-stroke]`, `[data-ag-magnet]`, `[data-ag-reel]`, `[data-ag-video]`, `[data-ag-flag]`, `[data-vt-]`, or fan-pointer markers at all — consistent with careers mounting none of parallax/clock/services/hovers/cursor/flags/video/ether/magnet/stroke/reel/trail/fanPointer.

Because of this, `CAREERS_MODULES` does **not** spread `SHARED` — spreading it would silently pull in `parallax` and `clock`, which careers' own source never called and has no matching markup for. It's built explicitly instead:

```ts
export const CAREERS_MODULES: Behavior[] = [
  applyTheme, reveal, nav, navCta, shell, roles, form,
];
```

`fanPointer`: checked per the task's instruction — zero references anywhere in `careers.html`, not even a dead method definition (unlike services/about, which still have the dead method body). Moot regardless since it was deleted from `lib/behaviors` in Task 8.

## Fidelity diff: `app/careers/page.tsx` vs `.source/jsx/careers.jsx`

Full `diff -u` (18 diff lines: 13 additions, 5 removals). Every changed line falls into one of the three permitted categories:

| Change | Category | Lines |
|---|---|---|
| 4 `import` statements + `export default function Careers() {` + `return (` | wrapper | 6 added |
| 2 leading/1 trailing blank line removed (whitespace only, from source-file trimming) | wrapper | 2 removed |
| Logo `<img>` → `<Image>` + `width={422} height={133} priority` | next/image swap | 1 changed |
| `b7afa59dc4.jpg` `<img>` → `<Image>` + `width={950} height={535} priority` | next/image swap | 1 changed |
| `3143905490.jpg` `<img>` → `<Image>` + `width={900} height={600}` | next/image swap | 1 changed |
| `<ContactPill />` + `<CareersRuntime />` inserted before the root's closing `</div>` | component mount | 2 added |
| `);` + `}` closing the component | wrapper | 2 added |

No `className` was touched anywhere. No markup was reordered, added, or removed beyond the above. I did not spot anything in the converted markup that looked wrong (no hand-editing was needed or performed).

## Ported behaviours

### `lib/behaviors/roles.ts` vs source `initRoles` (`careers.html:701-728`) + `applyPay` (`careers.html:605-609`)

Porting-table application (every difference traces to one row):

| Source | Ported as | Rule |
|---|---|---|
| `const root = this.root(); if (!root) return;` (both methods) | dropped | `root` is the function parameter, guaranteed non-null by `AgRuntime` before any behaviour is called — same convention as every existing behaviour (`services.ts`, `form.ts`, etc. have no such guard either) |
| `this.cleanups.push(fn)` | `cleanups.push(fn)` against a local `const cleanups: (() => void)[] = []`, returned as `() => cleanups.forEach((fn) => fn())` | standard array + disposer |
| `const show = this.props.showPay !== false;` ... `show ? '' : 'none'` | deleted; body kept as unconditional `el.style.display = ''` | Ruling 2 — `showPay` frozen `true` |
| `panel && panel.style.gridTemplateRows === '1fr'` | `panel?.style.gridTemplateRows === '1fr'` | cosmetic idiom only (optional chaining); identical truth table for both `panel` null and non-null |
| Everything else (element selectors, `setOpen`, per-item click wiring, close-all-then-toggle-clicked logic, count text) | copied verbatim | no change |

Changed-line count: essentially every line carries one of the two mechanical substitutions above (that's expected — it's a JS-class-method-to-TS-arrow-function port, matching the shape of every other file in `lib/behaviors/`), but there are exactly **two lines of real semantic change**, both mandated by Ruling 2: the `show` const and its ternary are gone, replaced by the unconditional `''`.

### `lib/behaviors/navCta.ts` vs the CTA-specific slice of source `initNav` (`careers.html:642-657`)

This is a **partial** port by design (see Ruling 1 evidence above) — `nav.ts` already covers the padding/logo-height part unmodified. Rows:

| Source | Ported as | Rule |
|---|---|---|
| `const nav = root.querySelector('[data-ag-nav]');` | `const nav = root.querySelector<HTMLElement>('[data-ag-nav]');` | `this.root()` → `root` param |
| `const cta = nav.querySelector('[data-ag-navcta]');` | `const cta = nav?.querySelector<HTMLElement>('[data-ag-navcta]');` | same, plus optional-chain since `nav` is typed nullable here |
| `if (cta) cta.style.display = stuck && window.innerWidth > 720 ? 'flex' : 'none';` | kept verbatim inside a scoped `onScroll` (the `if (cta)` becomes an early-return `if (!nav \|\| !cta) return () => {};` before the closure, since this module only exists to act on `cta`) | logic preserved |
| `window.addEventListener('scroll', ...)`, `window.addEventListener('resize', ...)`, `onScroll()`, both-listener cleanup | copied verbatim | `this.cleanups.push` → returned disposer directly (no array needed — one disposer) |
| `nav.style.padding = ...`, `if (logo) logo.style.height = ...`, the `logo` lookup itself | **not** ported here | already covered by `nav.ts`, which mounts immediately before this module |
| `nav.style.color`, `logo.style.filter`, button-recolour loop, `darks`/`onDark` probe | **not** ported (and not present in `nav.ts` either, for the loop/probe; `nav.ts` does still set color/filter) | proven no-ops on careers' own static markup — see evidence above |

Changed/omitted-with-justification lines: 4 of source `initNav`'s ~12 statement lines are ported here; the rest are either `nav.ts`'s job or proven dead for this page.

## Shell trace on careers (no news panel)

`lib/behaviors/shell.ts` (unmodified, already made news-optional in Task 6b) against careers' markup:

- `ov = root.querySelector('[data-ag-overlay]')` → present, `page.tsx:23`.
- `news = root.querySelector('[data-ag-news-panel]')` → **absent** (confirmed: `grep -n "data-ag-news" app/careers/page.tsx` → no matches).
- `menu = root.querySelector('[data-ag-menu-panel]')` → present, `page.tsx:25`.
- `nBtn = root.querySelector('[data-ag-news-btn]')` → **absent** (same grep).
- `mBtn`, `burger`, `close` → all present (`page.tsx:14`, `15`, `29`).
- Guard `if (!ov || !menu) return ...` → both present, so shell mounts fully (does not hit the degraded "reset scroll lock and bail" path).
- `panels = news ? [[news,...],[menu,...]] : [[menu, state==='menu']]` → with `news` null, takes the `[[menu, ...]]` branch — only the menu panel is painted; no crash from calling `.style` on a null `news`.
- `on(nBtn, () => set('news'))` → `on()` guards `if (!el) return;`, so with `nBtn` null this registers no listener and pushes no cleanup — there is no dead "open news" path a user could trigger.
- Every other branch (`mBtn` toggle, `close`, overlay background click, in-overlay anchor clicks, Escape key, and both disposer paths' `document.body.style.overflow = ''` reset) is unconditional and applies identically to careers.

All null branches are handled; nothing throws or silently no-ops in a user-visible way beyond "there is no news panel to open," which is correct for this page.

## Images converted

All three raster images referenced anywhere in `careers.jsx` (confirmed by grep — no others exist on this page):

| File | Usage | Measured (via `image-size`) | `priority`? |
|---|---|---|---|
| `/images/93c7aab596.png` | nav logo (`data-ag-logo`) | 422×133 | yes (the logo) |
| `/images/b7afa59dc4.jpg` | "The studio floor, wide" — first large image in body | 950×535 | yes (first large image) |
| `/images/3143905490.jpg` | "On set, tall" — second image | 900×600 | no |

Logo and `b7afa59dc4.jpg` dimensions match the values already in use for the same files in `app/page.tsx`, `app/services/page.tsx`, `app/about/page.tsx` — measured independently here, not copied, and they agree. `3143905490.jpg` had no prior `next/image` usage anywhere to cross-check against; measured fresh. All three keep their converter-emitted `className` unchanged (`h-full w-full object-cover` for the body images, matching the exact pattern already established for the same object-cover-in-a-sized-container case in `app/about/page.tsx:112`).

## `npm run build`

Exit 0. Route table:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      330 B         118 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 328 B         118 kB
├ ○ /careers                               310 B         118 kB
└ ○ /services                              332 B         118 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-2dbbf79f36f0dfa2.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          2.08 kB
```

`/careers` (310 B / 118 kB) sits in the same ballpark as every other route, as expected.

**three.js absence, confirmed two ways:**
1. `app-build-manifest.json`'s chunk list for `/careers/page` is `[webpack, 4bd1b696, 255, main-app, 850, 317, app/careers/page-*.js]` — identical shared-chunk set to `/services/page`, plus its own tiny (485 B) page chunk. Neither list includes the three.js chunk.
2. `ether.ts` (the only behaviour that touches `three`, via `lib/liquid-ether.ts`) loads it through a runtime `import('@/lib/liquid-ether')`, so webpack isolates it into its own on-demand chunk (`.next/static/chunks/b536a0f1.*.js`, 481 KB — confirmed to contain `three`'s markers by grep). `ether` is not in `CAREERS_MODULES` at all, and even if it were, it guards on `[data-ag-ether]`, which doesn't exist in careers' markup — so the dynamic import could never fire regardless.

Pre-existing ESLint warnings in the build output (`no-img-element` in `app/page.tsx`, `app/about/page.tsx`, `app/services/page.tsx`; unused-var warnings in `lib/behaviors/reel.ts`, `lib/liquid-ether.ts`, `lib/stroke-text.ts`) are all in files I did not touch and predate this task. Zero new warnings from any file I added or changed.

## Gate output

- `node --test`: `# tests 50`, `# pass 50`, `# fail 0`. Includes the SSR module-scope-hazard check (covers `roles.ts`/`navCta.ts` too, since it globs all of `lib/behaviors`) and the shell-disposer check.
- `npx tsc --noEmit`: exit 0, no output.
- `npm run build`: exit 0 (table above).

## Files changed

- New: `app/careers/page.tsx`, `app/careers/modules.ts`, `app/careers/careers-runtime.tsx`, `lib/behaviors/roles.ts`, `lib/behaviors/navCta.ts`
- Modified: `lib/behaviors/index.ts` (added `roles`, `navCta` imports/exports; `SHARED` unchanged)
- `git status --porcelain` confirms this is the complete change set — nothing else in the tree is touched, `.source/` stays gitignored.

## Self-review findings / concerns

- The one judgment call in this task is the Ruling 1 branch. I've laid out the full evidence chain above (each "missing" line in careers' `initNav` traced to a specific proven no-op in careers' own static markup); I'm confident in Branch A, but flagging it as the one place I resolved an "ask" trigger myself rather than stopping, because I could ground the decision in hard evidence from the markup rather than a judgment call on the two hypotheticals alone.
- `CAREERS_MODULES` diverges from the brief's Step 3 pseudocode (no `SHARED` spread, no `parallax`/`clock`). This is a Ruling-3-mandated finding, not a mistake I'm flagging defensively — but surfacing it clearly since it's a real disagreement with the written brief.
- No hand-tuning was needed anywhere in the converted markup; nothing looked wrong.
- No config surface was added for `showPay`; `roles.ts` has no prop/parameter for it at all.
- Careers has no `id="top"` anchor and its logo links to `/` via `next/link` rather than a same-page `#top` anchor — this is a genuine, source-driven fact (confirmed: no `id="top"` anywhere in `.source/jsx/careers.jsx`, and the raw HTML's logo link target was `Arohance%20Homepage.html`, an inter-page link), not an omission on my part.

---

## Fix Round 1

### Finding confirmed: composing `nav` + `navCta` was wrong

The coordinator's read is correct, and independently verified. `nav.ts` sets `background`/`color` on every nav `<button>` as **inline styles**:

```ts
Array.from(el.querySelectorAll('button')).forEach((b) => {
  b.style.background = '#1A1815';
  b.style.color = '#F5F2ED';
});
```

An inline style always wins over a stylesheet rule regardless of specificity — including a `:hover` rule. Careers' menu button carries `hover:bg-[var(--ag-accent,#F2600C)] hover:text-[#0A0A0A]` (`app/careers/page.tsx:14`). My earlier check only compared the *resting-state* value (`#1A1815`/`#F5F2ED` either way — a real match), which is why it came back clean; it didn't check what an inline write does to a `:hover` rule that only fires on top of it. Once `nav.ts` runs, that hover is permanently overridden after the first scroll event (which fires immediately, since `onScroll()` runs once synchronously on mount) — careers' own original `initNav` never touches `<button>` at all, so its hover always worked. Composing `nav` in in would have shipped a real, silent regression.

I had verified "same value" and stopped there; I hadn't checked what an inline write does to a state (`:hover`) that the static comparison can't see, because it only ever exists at interaction time. Internalised for next time: no-op-by-value and no-op-by-effect are different claims, and an inline style write needs the second check whenever the target element has a pseudo-class rule for the same property.

### Fix applied

- Deleted `lib/behaviors/navCta.ts` and its export.
- Added `lib/behaviors/navCareers.ts` — a verbatim port of careers' own `initNav` (`.source/templates/careers.html:642-657`): padding, logo height, the `stuck && window.innerWidth > 720` CTA toggle, both scroll and resize listeners, one disposer. It never touches `<button>`, matching the source exactly.
- `app/careers/modules.ts`: `CAREERS_MODULES` is now `[applyTheme, reveal, navCareers, shell, roles, form]` — `nav` is dropped entirely (not composed), `navCareers` replacing it in the position careers' `componentDidMount` calls `initNav`.
- `lib/behaviors/index.ts`: exports `navCareers` in place of `navCta`.

Files touched this round (confirmed via `git status`/`git diff --stat`): `app/careers/modules.ts` (M), `lib/behaviors/index.ts` (M), `lib/behaviors/navCta.ts` (D), `lib/behaviors/navCareers.ts` (new). `app/careers/page.tsx` untouched — this was a behaviour-wiring fix only, no markup changed.

### `navCareers.ts` vs source `initNav`, diffed

Whitespace-insensitive diff (`diff -u -b -B`) of the source method body against `navCareers.ts`'s function body:

```diff
-initNav() {
-    const root = this.root(); if (!root) return;
-    const nav = root.querySelector('[data-ag-nav]'); if (!nav) return;
-    const logo = nav.querySelector('[data-ag-logo]');
-    const cta = nav.querySelector('[data-ag-navcta]');
+export const navCareers: Behavior = (root) => {
+  const nav = root.querySelector<HTMLElement>('[data-ag-nav]');
+  if (!nav) return () => {};
+  const logo = nav.querySelector<HTMLElement>('[data-ag-logo]');
+  const cta = nav.querySelector<HTMLElement>('[data-ag-navcta]');
     const onScroll = () => {                                    [UNCHANGED]
       const stuck = (window.scrollY || 0) > 40;                 [UNCHANGED]
       nav.style.padding = (stuck ? '11px ' : '16px ') + ...      [UNCHANGED]
       if (logo) logo.style.height = stuck ? '36px' : '46px';     [UNCHANGED]
       if (cta) cta.style.display = ... ? 'flex' : 'none';        [UNCHANGED]
     };                                                            [UNCHANGED]
     window.addEventListener('scroll', onScroll, {...});           [UNCHANGED]
     window.addEventListener('resize', onScroll);                  [UNCHANGED]
     onScroll();                                                   [UNCHANGED]
-    this.cleanups.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });
-}
+  return () => {
+    window.removeEventListener('scroll', onScroll);
+    window.removeEventListener('resize', onScroll);
+  };
+};
```

**Changed-line count: 7 of 16 source lines** (signature; the redundant `this.root()` null-guard, deleted outright since `root` is the parameter and every behaviour in this codebase already drops that check; the `nav` guard reshaped to return a no-op disposer instead of bare `return`; `<HTMLElement>` generics added to the `logo`/`cta` lookups; `this.cleanups.push(fn)` → `return fn`; closing brace punctuation). **9 lines are untouched**: the entire `onScroll` body (padding calc, logo height, CTA toggle) and both `addEventListener` calls plus the immediate `onScroll()` invocation — the actual DOM-facing logic is copied verbatim, character for character. Every changed line is a mechanical porting-rule substitution (root-as-parameter, TS typing, Behavior's disposer-return contract); there is no semantic/behavioural change anywhere in this file.

### Gates re-run

- `node --test`: `# tests 50`, `# pass 50`, `# fail 0` (unchanged from before the fix — includes the SSR module-scope check, which now globs `navCareers.ts` instead of `navCta.ts`).
- `npx tsc --noEmit`: exit 0, no output.
- `npm run build`: exit 0. Updated route table:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      329 B         118 kB
├ ○ /_not-found                            990 B         104 kB
├ ○ /about                                 327 B         118 kB
├ ○ /careers                               306 B         118 kB
└ ○ /services                              331 B         118 kB
+ First Load JS shared by all             103 kB
```

`/careers` is now 306 B / 118 kB (was 310 B / 118 kB before the fix — one module fewer, same ballpark as every other route). Re-checked `app-build-manifest.json`: `/careers/page`'s chunk list is still just the same shared baseline chunks plus its own 485 B-scale page chunk; the three.js chunk is still absent, unaffected by this fix (nothing about `ether`/`liquid-ether` changed).

### Also checked: does `studio`, `contact`, or `case-study` have the same problem?

Read-only investigation, per instruction — nothing in these three pages was modified; they stay Task 13's.

All three inline their nav-scroll handling directly in `componentDidMount` rather than a named method (confirmed: `this.c` — note the shortened cleanup-array name, a different codegen convention than careers/home/services/about's `this.cleanups`). They split into **two distinct families, neither of which matches `nav.ts`**:

**`studio.html` (lines 552-584) and `case-study.html` (lines 479-511) are byte-identical** (`diff` exit 0, zero output) — both compute `onDark` the same way home does, but *unlike* home/services/about (where `nav.ts`'s doc comment already establishes this is dead code, discarded), studio/case-study's `onDark` is **live and load-bearing**:

```js
Array.from(nav.querySelectorAll('button')).forEach(b => {
  b.style.background = onDark ? '#F5F2ED' : '#1F1E1C';
  b.style.color = onDark ? '#F5F2ED' : '#EDE9E1';
});
```

Button colour genuinely depends on whether the nav is currently overlapping a `[data-dark]` section. Reusing `nav.ts` here would be wrong independent of any hover concern — it would silently replace correct dark-aware colours with `nav.ts`'s hardcoded `#1A1815`/`#F5F2ED`, losing real, visible behaviour. Both pages' news-btn and menu-btn also carry `style-hover="background:var(--ag-accent,#F2600C);..."` in the raw markup (so the converter will emit real `hover:bg-` classes), meaning the same inline-vs-`:hover` interaction from the careers finding applies here too — but it's moot as a *regression* concern, since studio/case-study's own original already runs this exact button loop themselves (the hover-after-first-scroll suppression, if it happens, is an authentic property of their own original, the same category as the accepted home oddity — not something reuse would newly introduce).

**`contact.html` (lines 452-465) is the minimal case**, closer to careers': its nav logic only ever sets `nav.style.padding` and logo height — no color, no filter, no button loop, and (unlike careers) no CTA and no resize listener either. But contact's news-btn and menu-btn are still statically `background:#1F1E1C;color:#EDE9E1` with a `style-hover="background:var(--ag-accent,#F2600C);..."` (`.source/templates/contact.html:235,238`) — i.e. the same hover-class shape as careers, but contact's *resting* colour (`#1F1E1C`) does **not** match what `nav.ts`'s button loop would set (`#1A1815`). So reusing `nav.ts` for contact risks compounding two regressions at once: a resting-colour shift its original never had, plus the same hover-suppression just found in careers.

**Recommendation for Task 13** (not acted on): none of the three should reuse `nav.ts` as-is. Studio and case-study look like a shared verbatim module is legitimate between just those two (given the byte-identical source), but Task 13 should re-verify that identity itself against whatever `.source/templates/*.html` says at the time, the same way this task was asked to verify rather than trust a prior finding. Contact needs its own minimal verbatim module (padding + logo height only, no button/colour handling of any kind).

