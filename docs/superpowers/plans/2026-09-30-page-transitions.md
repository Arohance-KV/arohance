# Page Transitions and Home Entrance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An orange curtain covers every internal page change until the next page is ready, and a visit that starts on `/` opens with a DESIGN / SHOOT / ENGINEER entrance and a 0→100 counter.

**Architecture:** One client component in the root layout (`PageTransition`) intercepts internal link clicks with a single capture-phase listener, animates the curtain with the Web Animations API, navigates with `router.push`, and lifts once the new route has rendered and its first-screen assets have loaded. A home-only client component (`Intro`) runs the entrance, gated before first paint by an inline `<head>` script and `sessionStorage`. Both share a tiny import-free module, `lib/curtain.ts`, which also provides the "revealed" signal the entrance-animation behaviours wait on.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, Tailwind v4 (arbitrary-value classes), Web Animations API, `node --test`, Playwright (driving the installed Chrome).

**Spec:** `docs/superpowers/specs/2026-09-30-page-transitions-design.md`

## Global Constraints

- No new dependencies. Animations use `element.animate` (Web Animations API); GSAP is not used by the new code.
- Curtain: `z-[100]`, background `var(--ag-accent,#F2600C)`, label colour `#0A0A0A`, Archivo bold uppercase `clamp(2.5rem,10vw,9rem)`.
- Intro: `z-[101]`, background `#0C0B0A`, text `#F5F2ED`; words Archivo bold uppercase `clamp(3rem,12vw,11rem)`; counter Archivo bold `clamp(4rem,14vw,12rem)`, `tabular-nums`, three digits.
- Easing for every slide: `cubic-bezier(.76,0,.24,1)`.
- Timings: curtain enter 550ms, exit 600ms; hold at least 300ms after the enter, at most 4000ms after the push; intro at least 2400ms, assets cap 8000ms, 200ms pause at 100, exit 900ms; word swap 500ms; reduced-motion fades 200ms.
- Words by counter value: DESIGN 0–33, SHOOT 34–66, ENGINEER 67–100.
- Names: `sessionStorage` key `ag-visit`; `<html>` attributes `data-ag-covered` and `data-intro-seen`; overlay attributes `data-ag-curtain` and `data-ag-intro`; window event `ag:reveal`.
- Scroll lock goes on `<html>` (`document.documentElement.style.overflow`), never `<body>` (the menu owns `<body>`'s lock).
- Back/forward are not intercepted.
- Code style: match the surrounding files (Tailwind arbitrary values like `[font-family:'Archivo',sans-serif]`, short doc comments on exports, no semicolon-free style changes).
- The working tree has unrelated uncommitted changes. Commit steps stage only the files the task lists, and commits happen only once the user has given the go-ahead.
- Browser checks: dev server `npx next dev -p 4600` (run in the background); Playwright scripts live in the session scratchpad (`$SCRATCH` below, i.e. `C:/Users/MYPC~1/AppData/Local/Temp/claude/d--arohance-projects-Arohance-new-website/c599ed4f-da5c-4f69-b036-f20378d8a524/scratchpad`), import Playwright by absolute path, and launch with `channel: 'chrome'` (Playwright's bundled browser is not installed). Warm each route once with `curl` before a run; the first dev compile is slow.

## Review Focus

- A second link click while a transition runs: nothing queues, the URL ends at the first target, the curtain leaves once. (Task 2 test.)
- Clicking a link inside the open menu: the menu closes, the curtain plays, and afterwards both `<html>` and `<body>` scroll (`overflow` is `''`). (Task 2 test.)
- A link to a page that does not exist: the curtain still leaves (Next renders its 404). (Task 2 test.)
- A reload mid-visit on `/`: no intro, the curtain lifts, the page scrolls. (Task 4 test.)
- Reduced motion: both overlays still appear and go away. (Task 5 run.)

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/curtain.ts` (new) | Pure `navTarget` click filter; `cover`/`reveal`/`whenRevealed` signal on `<html>`; small shared helpers `EASE`, `wait`, `tween`, `settled`, `lockScroll`. No imports. |
| `lib/curtain.test.mjs` (new) | Node tests for `navTarget`. |
| `components/PageTransition.tsx` (new) | The curtain: markup, first-load lift, link interception, navigate-and-wait. |
| `components/Intro.tsx` (new) | The home entrance: markup, progress tracking, counter, word swaps, exit. |
| `app/layout.tsx` | Renders `PageTransition` with the page-name map, the once-per-visit gate script, the `<noscript>` fallback, and `<html data-ag-covered suppressHydrationWarning>`. |
| `app/page.tsx` | Renders `<Intro />` before the home root. |
| `app/globals.css` | Hides the intro once seen. |
| `lib/behaviors/reveal.ts`, `lib/behaviors/text.ts` | Start their scroll entrances only after `whenRevealed()`. |

---

### Task 1: `lib/curtain.ts` — click filter, reveal signal, helpers

**Files:**
- Create: `lib/curtain.ts`
- Test: `lib/curtain.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type NavLink = { href: string; target: string; download: boolean }`
  - `type NavClick = { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean }` (a `MouseEvent` satisfies it)
  - `navTarget(link: NavLink, click: NavClick, current: string): string | null`
  - `EASE: string`
  - `cover(): void`, `reveal(): void`, `whenRevealed(): Promise<void>`
  - `wait(ms: number): Promise<void>`
  - `tween(el: HTMLElement, frames: Keyframe[], ms: number): Promise<void>`
  - `settled(img: HTMLImageElement): Promise<void>`
  - `lockScroll(on: boolean): void`

- [ ] **Step 1: Write the failing test**

Create `lib/curtain.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// lib/curtain.ts has no imports: transpile it here, like lib/work.test.mjs.
const { outputText } = ts.transpileModule(readFileSync('lib/curtain.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { navTarget } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);

const HERE = 'https://arohance.test/about';
const link = (href, extra = {}) => ({ href: new URL(href, HERE).href, target: '', download: false, ...extra });
const click = (extra = {}) => ({
  button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...extra,
});

test('navTarget: a link to another page goes through the curtain', () => {
  assert.equal(navTarget(link('/studio'), click(), HERE), '/studio');
  assert.equal(navTarget(link('/case-study/kria-sports-platform'), click(), HERE), '/case-study/kria-sports-platform');
  assert.equal(navTarget(link('/studio', { target: '_self' }), click(), HERE), '/studio');
});

test('navTarget: another page with a hash keeps the hash', () => {
  assert.equal(navTarget(link('/#work'), click(), HERE), '/#work');
});

test('navTarget: same-page links are left alone', () => {
  assert.equal(navTarget(link('#contact'), click(), HERE), null);
  assert.equal(navTarget(link('/about'), click(), HERE), null);
  assert.equal(navTarget(link('/about#team'), click(), HERE + '#top'), null);
});

test('navTarget: new-tab and modified clicks are left alone', () => {
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    assert.equal(navTarget(link('/studio'), click({ [key]: true }), HERE), null, key);
  }
  assert.equal(navTarget(link('/studio'), click({ button: 1 }), HERE), null);
  assert.equal(navTarget(link('/studio', { target: '_blank' }), click(), HERE), null);
});

test('navTarget: downloads, other origins, mailto and prevented clicks are left alone', () => {
  assert.equal(navTarget(link('/brochure.pdf', { download: true }), click(), HERE), null);
  assert.equal(navTarget(link('https://instagram.com/arohance'), click(), HERE), null);
  assert.equal(navTarget(link('mailto:hello@arohance.com'), click(), HERE), null);
  assert.equal(navTarget(link('/studio'), click({ defaultPrevented: true }), HERE), null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/curtain.test.mjs`
Expected: FAIL with `ENOENT: no such file or directory, open 'lib/curtain.ts'`.

- [ ] **Step 3: Write the implementation**

Create `lib/curtain.ts`:

```ts
/**
 * Page-transition plumbing shared by components/PageTransition.tsx,
 * components/Intro.tsx and the entrance behaviours (spec:
 * docs/superpowers/specs/2026-09-30-page-transitions-design.md). No imports,
 * so lib/curtain.test.mjs can transpile and load it on its own.
 *
 * `<html data-ag-covered>` is on while an overlay hides the page. The root
 * layout renders it on, so every first page load starts covered.
 */

export type NavLink = { href: string; target: string; download: boolean };
export type NavClick = {
  button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean;
};

/** Where a link click should go through the curtain (path + search + hash),
 *  or null to leave it to the browser and Next: new-tab or modified clicks,
 *  other targets, downloads, other origins, and links to the current page. */
export function navTarget(link: NavLink, click: NavClick, current: string): string | null {
  if (click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey || click.defaultPrevented) return null;
  if ((link.target && link.target !== '_self') || link.download) return null;
  const from = new URL(current), to = new URL(link.href, current);
  if (to.origin !== from.origin) return null;
  if (to.pathname === from.pathname && to.search === from.search) return null;
  return to.pathname + to.search + to.hash;
}

export const EASE = 'cubic-bezier(.76,0,.24,1)';

export const cover = () => document.documentElement.setAttribute('data-ag-covered', '');

export function reveal() {
  document.documentElement.removeAttribute('data-ag-covered');
  window.dispatchEvent(new Event('ag:reveal'));
}

/** Resolves once nothing covers the page: at once if uncovered now, else on the next reveal(). */
export const whenRevealed = (): Promise<void> =>
  document.documentElement.hasAttribute('data-ag-covered')
    ? new Promise((done) => window.addEventListener('ag:reveal', () => done(), { once: true }))
    : Promise.resolve();

export const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

/** Plays `frames` on `el` and leaves it on the last one (as inline style). */
export async function tween(el: HTMLElement, frames: Keyframe[], ms: number) {
  const a = el.animate(frames, { duration: ms, easing: EASE, fill: 'forwards' });
  await a.finished.catch(() => {});
  try { a.commitStyles(); } catch { /* not rendered: nothing to keep */ }
  a.cancel();
}

/** Resolves when `img` has loaded or failed. */
export const settled = (img: HTMLImageElement) =>
  img.complete
    ? Promise.resolve()
    : new Promise<void>((done) => {
        img.addEventListener('load', () => done(), { once: true });
        img.addEventListener('error', () => done(), { once: true });
      });

/** The overlays' scroll lock, on <html> so it never fights the menu's lock on <body>. */
export const lockScroll = (on: boolean) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test lib/curtain.test.mjs`
Expected: PASS, 5 tests, 0 failures.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 6: Commit** (only with the user's go-ahead)

```bash
git add lib/curtain.ts lib/curtain.test.mjs
git commit -m "feat: add curtain helpers for page transitions"
```

---

### Task 2: `PageTransition` — the orange curtain

**Files:**
- Create: `components/PageTransition.tsx`
- Modify: `app/layout.tsx` (whole `RootLayout` return, plus imports and two constants)
- Test: `$SCRATCH/transitions.mjs` (not committed)

**Interfaces:**
- Consumes (Task 1): `cover`, `reveal`, `navTarget`, `tween`, `wait`, `settled`, `lockScroll` from `@/lib/curtain`.
- Produces: `<PageTransition labels={Record<string, string>} />` (default export); the DOM element `[data-ag-curtain]`, `visibility: hidden` when not covering; the `<html>` gate that Task 4 relies on: `data-intro-seen` present unless this tab's first load is `/`.

- [ ] **Step 1: Write the failing browser check**

Create `$SCRATCH/transitions.mjs`:

```js
// Browser check for the page curtain. Usage: node transitions.mjs [width]
// Env REDUCED=1 runs with prefers-reduced-motion: reduce.
import { chromium } from 'file:///D:/arohance-projects/Arohance-new-website/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4600';
const width = +(process.argv[2] || 393);
const tag = `[${width}${process.env.REDUCED ? ' reduced' : ''}]`;
const fail = (m) => { console.error('FAIL', tag, m); process.exitCode = 1; };
const ok = (m) => console.log('ok  ', tag, m);
const curtain = (p) => p.evaluate(() => getComputedStyle(document.querySelector('[data-ag-curtain]')).visibility);
const waitCurtain = (p, state, ms) => p.waitForFunction(
  (s) => getComputedStyle(document.querySelector('[data-ag-curtain]')).visibility === s, state, { timeout: ms },
).then(() => true, () => false);

const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width, height: 852 }, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
const p = await ctx.newPage();

// Start mid-visit on /about so the home entrance never plays in this check.
await p.goto(BASE + '/about');
(await waitCurtain(p, 'hidden', 6000)) ? ok('first load: curtain lifts') : fail('first load: curtain never lifted');

// 1. A nav link: curtain shows with the destination name, lands, leaves.
await p.evaluate(() => document.querySelector('a[href="/studio"]').click());
(await waitCurtain(p, 'visible', 1000)) ? ok('nav: curtain shows') : fail('nav: curtain did not show');
const label = (await p.locator('[data-ag-curtain]').innerText()).trim().toUpperCase();
label === 'STUDIO' ? ok('nav: label is STUDIO') : fail(`nav: label was "${label}"`);
await p.waitForURL('**/studio', { timeout: 6000 }).catch(() => fail('nav: never reached /studio'));
(await waitCurtain(p, 'hidden', 6000)) ? ok('nav: curtain leaves') : fail('nav: curtain never left');

// 2. A second click mid-transition is dropped.
await p.evaluate(() => {
  document.querySelector('a[href="/contact"]').click();
  setTimeout(() => document.querySelector('a[href="/careers"]').click(), 150);
});
await waitCurtain(p, 'hidden', 8000);
p.url().endsWith('/contact') ? ok('double click: stayed on the first target') : fail(`double click: ended on ${p.url()}`);

// 3. Back is instant: no curtain.
await p.goBack();
await p.waitForURL('**/studio', { timeout: 6000 });
(await curtain(p)) === 'hidden' ? ok('back: no curtain') : fail('back: curtain showed');

// 4. A same-page hash link: no curtain.
await p.goto(BASE + '/');
await waitCurtain(p, 'hidden', 6000);
await p.evaluate(() => document.querySelector('a[href="#work"]').click());
await p.waitForTimeout(400);
(await curtain(p)) === 'hidden' ? ok('hash link: no curtain') : fail('hash link: curtain showed');

// 5. A link inside the open menu: menu closes, curtain plays, page scrolls after.
await p.evaluate(() => scrollTo(0, 0));
await p.click('[data-ag-menu-btn]');
await p.waitForTimeout(700);
await p.click('[data-ag-menu-panel] a[href="/services"]');
await p.waitForURL('**/services', { timeout: 6000 }).catch(() => fail('menu link: never reached /services'));
await waitCurtain(p, 'hidden', 6000);
const locks = await p.evaluate(() => [document.documentElement.style.overflow, document.body.style.overflow]);
locks.every((v) => v === '') ? ok('menu link: scroll unlocked') : fail(`menu link: overflow still ${JSON.stringify(locks)}`);

// 6. A link to a missing page: curtain still leaves.
await p.evaluate(() => {
  const a = Object.assign(document.createElement('a'), { href: '/does-not-exist', textContent: 'x' });
  document.body.appendChild(a);
  a.click();
});
(await waitCurtain(p, 'visible', 1000)) ? ok('missing page: curtain shows') : fail('missing page: curtain did not show');
(await waitCurtain(p, 'hidden', 7000)) ? ok('missing page: curtain leaves') : fail('missing page: curtain stuck');

await b.close();
```

- [ ] **Step 2: Run it to verify it fails**

Run (dev server on 4600 already running, routes warmed):

```bash
node "$SCRATCH/transitions.mjs" 393
```

Expected: exits 1; the first lines fail with `Cannot read properties of null (reading 'visibility')` or `FAIL ... curtain never lifted` (there is no `[data-ag-curtain]` yet).

- [ ] **Step 3: Write `components/PageTransition.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cover, lockScroll, navTarget, reveal, settled, tween, wait } from '@/lib/curtain';

/** Hold the curtain at least HOLD_MIN after it has covered, and at most HOLD_MAX after the push (ms). */
const HOLD_MIN = 300, HOLD_MAX = 4000;

/** Fonts plus the images on the current page's first screen. */
const pageReady = () =>
  Promise.all([
    document.fonts.ready,
    ...Array.from(document.querySelectorAll<HTMLImageElement>('[data-ag-root] img'))
      .filter((img) => !img.complete && img.getBoundingClientRect().top < innerHeight)
      .map(settled),
  ]);

/**
 * The orange curtain between pages (docs/superpowers/specs/2026-09-30-page-transitions-design.md).
 * Catches internal link clicks, covers the screen with the destination's
 * name, navigates underneath, and lifts once the new page is ready. Back and
 * forward stay instant. Rendered covering, so a first page load stays hidden
 * until ready too, except when the home entrance (components/Intro.tsx)
 * takes that first reveal over.
 */
export default function PageTransition({ labels }: { labels: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(labels[pathname] ?? 'Arohance');
  const panel = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const booted = useRef(false); // survives StrictMode's effect replay
  const arrival = useRef<{ path: string; done: () => void } | null>(null);

  useEffect(() => {
    const a = arrival.current;
    if (a && a.path === pathname) { arrival.current = null; a.done(); }
  }, [pathname]);

  useEffect(() => {
    const el = panel.current!, label = word.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const enter = () => {
      el.style.visibility = 'visible';
      lockScroll(true);
      return reduce
        ? tween(el, [{ opacity: 0 }, { opacity: 1 }], 200)
        : Promise.all([
            tween(el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], 550),
            tween(label, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 550),
          ]);
    };
    const exit = async () => {
      reveal();
      await (reduce
        ? tween(el, [{ opacity: 1 }, { opacity: 0 }], 200)
        : tween(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], 600));
      el.style.visibility = 'hidden';
      lockScroll(false);
    };

    if (!booted.current) {
      booted.current = true;
      if (!document.documentElement.hasAttribute('data-intro-seen')) el.style.visibility = 'hidden'; // the intro reveals
      else { lockScroll(true); Promise.race([pageReady(), wait(HOLD_MAX)]).then(exit); }
    }

    const go = async (url: string) => {
      busy.current = true;
      const path = new URL(url, location.href).pathname;
      setText(labels[path] ?? 'Arohance');
      router.prefetch(url);
      cover();
      await enter();
      const arrived = new Promise<void>((done) => { arrival.current = { path, done }; });
      const start = performance.now();
      router.push(url);
      await Promise.race([arrived.then(pageReady), wait(HOLD_MAX)]);
      await wait(HOLD_MIN - (performance.now() - start));
      await exit();
      busy.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest('a[href]');
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = navTarget({ href: a.href, target: a.target, download: a.hasAttribute('download') }, e, location.href);
      if (!url) return;
      e.preventDefault(); // next/link skips its own navigation for a prevented click
      if (!busy.current) go(url);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [labels, router]);

  return (
    <div ref={panel} data-ag-curtain="" aria-hidden="true" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A]">
      <span className="block overflow-hidden px-[clamp(20px,4.4vw,64px)] pb-[.06em]">
        <span ref={word} className="block text-center [font-family:'Archivo',sans-serif] font-bold uppercase text-[clamp(2.5rem,10vw,9rem)] leading-[.9] tracking-[-0.045em] [font-variation-settings:'wdth'_106]">{text}</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into `app/layout.tsx`**

Add below `import './globals.css';`:

```tsx
import PageTransition from '@/components/PageTransition';
import { WORK, workHref } from '@/lib/work';
```

Add below the `metadata` export:

```tsx
/** The curtain's page names, built here so lib/work.ts stays out of the client bundle. */
const LABELS: Record<string, string> = {
  '/': 'Home', '/about': 'About', '/services': 'Services', '/studio': 'Studio',
  '/careers': 'Careers', '/contact': 'Contact',
  ...Object.fromEntries(WORK.map((w) => [workHref(w), w.client])),
};

/** Runs before first paint: the home entrance (components/Intro.tsx) plays
 *  once per tab session, and only when that session starts on `/`. */
const INTRO_GATE =
  "try{var s=sessionStorage,k='ag-visit';if(s.getItem(k)||location.pathname!=='/')document.documentElement.setAttribute('data-intro-seen','');s.setItem(k,'1')}catch(e){document.documentElement.setAttribute('data-intro-seen','')}";
```

Replace the `RootLayout` return with:

```tsx
  return (
    // data-ag-covered: every first load starts under an overlay (lib/curtain.ts).
    // suppressHydrationWarning: INTRO_GATE and the curtain change <html>'s attributes around hydration.
    <html lang="en" data-ag-covered="" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        <noscript dangerouslySetInnerHTML={{ __html: '<style>[data-ag-intro],[data-ag-curtain]{display:none}</style>' }} />
      </head>
      <body>
        {children}
        <PageTransition labels={LABELS} />
      </body>
    </html>
  );
```

- [ ] **Step 5: Run the browser check to verify it passes**

```bash
node "$SCRATCH/transitions.mjs" 393 && node "$SCRATCH/transitions.mjs" 1440
```

Expected: every line `ok`, exit code 0, at both widths.

- [ ] **Step 6: Type-check and lint**

Run: `npx tsc --noEmit -p . && npx eslint components/PageTransition.tsx app/layout.tsx`
Expected: no output.

- [ ] **Step 7: Commit** (only with the user's go-ahead)

```bash
git add components/PageTransition.tsx app/layout.tsx
git commit -m "feat: orange curtain page transitions"
```

---

### Task 3: Entrance animations wait for the reveal

**Files:**
- Modify: `lib/behaviors/reveal.ts` (the `io.observe` / guard block, lines 30–40)
- Modify: `lib/behaviors/text.ts` (line 170, `plays.forEach((_, el) => io.observe(el));`)
- Test: `$SCRATCH/wait-reveal.mjs` (not committed)

**Interfaces:**
- Consumes (Task 1): `whenRevealed(): Promise<void>` from `lib/curtain.ts` (import as `'../curtain'`, matching the behaviours' relative imports).
- Produces: nothing new.

- [ ] **Step 1: Write the failing browser check**

Create `$SCRATCH/wait-reveal.mjs`:

```js
// While the curtain covers a first load, the hero's [data-reveal] text must
// stay hidden; it animates in only after the reveal. Images are delayed so
// the curtain is guaranteed to still be up when we look.
import { chromium } from 'file:///D:/arohance-projects/Arohance-new-website/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4600';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
const p = await ctx.newPage();
await p.goto(BASE + '/about'); // mid-visit, so / skips the intro
await ctx.route(/\/_next\/image|\.(jpg|png)(\?|$)/, async (r) => { await new Promise((s) => setTimeout(s, 2500)); await r.continue(); });
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
// reveal.ts sets a transition on its elements at mount: wait for that, then give it time to (wrongly) fire.
await p.waitForFunction(() => document.querySelector('[data-reveal]')?.style.transition, null, { timeout: 8000 });
await p.waitForTimeout(700);
const during = await p.evaluate(() => ({
  covered: document.documentElement.hasAttribute('data-ag-covered'),
  opacity: document.querySelector('[data-reveal]').style.opacity,
}));
let failed = false;
if (!during.covered) { console.error('FAIL setup: curtain already gone, cannot check'); failed = true; }
else if (during.opacity !== '0') { console.error('FAIL: hero text revealed under the curtain, opacity', during.opacity); failed = true; }
else console.log('ok   hero text waits under the curtain');
await p.waitForFunction(() => !document.documentElement.hasAttribute('data-ag-covered'), null, { timeout: 8000 });
await p.waitForTimeout(1500);
const after = await p.evaluate(() => document.querySelector('[data-reveal]').style.opacity);
if (after !== '1') { console.error('FAIL: hero text never revealed, opacity', after); failed = true; }
else console.log('ok   hero text revealed after the curtain');
await b.close();
process.exitCode = failed ? 1 : 0;
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node "$SCRATCH/wait-reveal.mjs"`
Expected: `FAIL: hero text revealed under the curtain, opacity 1`, exit code 1.

- [ ] **Step 3: Make `reveal.ts` wait**

Add the import at the top of `lib/behaviors/reveal.ts`:

```ts
import { whenRevealed } from '../curtain';
```

Replace:

```ts
  els.forEach((el) => io.observe(el));
  const guard = setTimeout(() => {
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }, 1600);
  cleanups.push(() => {
    io.disconnect();
    clearTimeout(guard);
  });
```

with:

```ts
  // Start once the page transition's curtain is off (lib/curtain.ts), so the
  // entrances are seen rather than played underneath it.
  let disposed = false;
  let guard: ReturnType<typeof setTimeout> | undefined;
  whenRevealed().then(() => {
    if (disposed) return;
    els.forEach((el) => io.observe(el));
    guard = setTimeout(() => {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, 1600);
  });
  cleanups.push(() => {
    disposed = true;
    io.disconnect();
    clearTimeout(guard);
  });
```

- [ ] **Step 4: Make `text.ts` wait**

Add below the existing imports in `lib/behaviors/text.ts`:

```ts
import { whenRevealed } from '../curtain';
```

Replace:

```ts
  plays.forEach((_, el) => io.observe(el));
```

with:

```ts
  // After the page transition's curtain is off (lib/curtain.ts), so the entrances are seen.
  whenRevealed().then(() => { if (!disposed) plays.forEach((_, el) => io.observe(el)); });
```

(`disposed` is already declared above `io` in this file.)

- [ ] **Step 5: Run the checks to verify they pass**

Run: `node "$SCRATCH/wait-reveal.mjs" && node "$SCRATCH/transitions.mjs" 393`
Expected: both `ok` lines from `wait-reveal.mjs`, then every `transitions.mjs` line `ok`; exit code 0.

- [ ] **Step 6: Type-check, lint, unit tests**

Run: `npx tsc --noEmit -p . && npx eslint lib/behaviors/reveal.ts lib/behaviors/text.ts && npm test`
Expected: tsc and eslint silent; `npm test` reports the one known pre-existing failure only (`collision warning fires only for genuinely differing content`, in the unbundle tooling tests) and everything else passing, including `lib/curtain.test.mjs`.

- [ ] **Step 7: Commit** (only with the user's go-ahead)

```bash
git add lib/behaviors/reveal.ts lib/behaviors/text.ts
git commit -m "feat: start entrance animations after the curtain lifts"
```

---

### Task 4: `Intro` — the home entrance

**Files:**
- Create: `components/Intro.tsx`
- Modify: `app/page.tsx` (imports; the `return (` opening and the closing `</div>\n  );` of `Home`; one line in the header comment)
- Modify: `app/globals.css` (append one rule)
- Test: `$SCRATCH/intro.mjs` (not committed)

**Interfaces:**
- Consumes (Task 1): `lockScroll`, `reveal`, `settled`, `tween`, `wait` from `@/lib/curtain`. (Task 2): the `<html data-intro-seen>` gate and the curtain staying hidden while the intro plays.
- Produces: `<Intro />` (default export); DOM `[data-ag-intro]` containing `[data-intro-count]`.

- [ ] **Step 1: Write the failing browser check**

Create `$SCRATCH/intro.mjs`:

```js
// Browser check for the home entrance. Usage: node intro.mjs [width]
// Env REDUCED=1 runs with prefers-reduced-motion: reduce.
import { chromium } from 'file:///D:/arohance-projects/Arohance-new-website/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4600';
const width = +(process.argv[2] || 393);
const tag = `[${width}${process.env.REDUCED ? ' reduced' : ''}]`;
const fail = (m) => { console.error('FAIL', tag, m); process.exitCode = 1; };
const ok = (m) => console.log('ok  ', tag, m);
const opts = { viewport: { width, height: 852 }, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' };
const introShown = (p) => p.locator('[data-ag-intro]').isVisible().catch(() => false);

const b = await chromium.launch({ channel: 'chrome' });

// 1. First visit to /: intro shows, words change, counter reaches 100, intro goes.
let ctx = await b.newContext(opts);
let p = await ctx.newPage();
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
(await introShown(p)) ? ok('first visit: intro shows') : fail('first visit: intro missing');
const seen = await p.evaluate(() => new Promise((done) => {
  const out = new Set(), t0 = performance.now();
  const t = setInterval(() => {
    const n = document.querySelector('[data-intro-count]')?.textContent;
    if (n) out.add(n);
    if (n === '100' || performance.now() - t0 > 12000) { clearInterval(t); done([...out]); }
  }, 16);
}));
seen.includes('100') ? ok('first visit: counter reached 100') : fail(`first visit: counter stopped at ${seen.at(-1)}`);
seen.every((n) => /^\d{3}$/.test(n)) ? ok('first visit: counter is three digits') : fail(`first visit: odd counter values ${seen.join(',')}`);
await p.waitForFunction(() => document.documentElement.hasAttribute('data-intro-seen'), null, { timeout: 4000 })
  .then(() => ok('first visit: intro finished'), () => fail('first visit: intro never finished'));
(await introShown(p)) ? fail('first visit: intro still visible') : ok('first visit: intro hidden');
(await p.evaluate(() => document.documentElement.style.overflow)) === '' ? ok('first visit: page scrolls') : fail('first visit: scroll still locked');

// 2. Reload in the same tab: no intro, curtain lifts, page scrolls.
await p.reload({ waitUntil: 'domcontentloaded' });
(await introShown(p)) ? fail('reload: intro replayed') : ok('reload: no intro');
await p.waitForFunction(() => !document.documentElement.hasAttribute('data-ag-covered'), null, { timeout: 6000 })
  .then(() => ok('reload: curtain lifted'), () => fail('reload: curtain stuck'));
await p.waitForTimeout(800);
(await p.evaluate(() => document.documentElement.style.overflow)) === '' ? ok('reload: page scrolls') : fail('reload: scroll still locked');
await ctx.close();

// 3. A visit that starts on /about, then goes home: no intro either way.
ctx = await b.newContext(opts);
p = await ctx.newPage();
await p.goto(BASE + '/about', { waitUntil: 'domcontentloaded' });
(await introShown(p)) ? fail('/about landing: intro shown') : ok('/about landing: no intro');
await p.waitForFunction(() => !document.documentElement.hasAttribute('data-ag-covered'), null, { timeout: 6000 });
await p.evaluate(() => document.querySelector('a[href="/"]').click());
await p.waitForURL(BASE + '/', { timeout: 6000 });
await p.waitForTimeout(500);
(await introShown(p)) ? fail('/about then home: intro shown') : ok('/about then home: no intro');
await ctx.close();

await b.close();
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node "$SCRATCH/intro.mjs" 393`
Expected: exit code 1, starting with `FAIL [393] first visit: intro missing`.

- [ ] **Step 3: Write `components/Intro.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { lockScroll, reveal, settled, tween, wait } from '@/lib/curtain';

const WORDS = ['Design', 'Shoot', 'Engineer'];
/** The counter can't reach 100 sooner than MIN_MS, and stops waiting on assets at MAX_MS. */
const MIN_MS = 2400, MAX_MS = 8000;
const wordAt = (n: number) => (n <= 33 ? 0 : n <= 66 ? 1 : 2);

/**
 * The home entrance (docs/superpowers/specs/2026-09-30-page-transitions-design.md):
 * one word at a time over a 000→100 counter that follows real loading (fonts,
 * the page's eager images, window load), then the screen slides up. Rendered
 * covering; app/layout.tsx's head script hides it before first paint unless
 * this tab's visit started here, and globals.css keeps it hidden after.
 */
export default function Intro() {
  const box = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute('data-intro-seen')) return;
    const el = box.current!, counter = count.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    lockScroll(true);

    const assets: Promise<unknown>[] = [
      document.fonts.ready,
      document.readyState === 'complete' ? Promise.resolve() : new Promise((done) => addEventListener('load', done, { once: true })),
      ...Array.from(document.querySelectorAll<HTMLImageElement>('[data-ag-root] img'))
        .filter((img) => img.loading !== 'lazy')
        .map(settled),
    ];
    let loaded = 0;
    assets.forEach((a) => a.then(() => { loaded++; }));

    let dead = false, raf = 0, shown = 0, current = 0;
    const start = performance.now();

    const swap = (to: number) => {
      const out = words.current[current]!, next = words.current[to]!;
      current = to;
      if (reduce) { out.style.transform = 'translateY(110%)'; next.style.transform = 'none'; return; }
      tween(out, [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], 500);
      tween(next, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 500);
    };
    const finish = async () => {
      await wait(200);
      reveal();
      await (reduce
        ? tween(el, [{ opacity: 1 }, { opacity: 0 }], 200)
        : tween(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], 900));
      html.setAttribute('data-intro-seen', '');
      lockScroll(false);
    };
    const tick = (now: number) => {
      if (dead) return;
      const elapsed = now - start;
      const real = elapsed >= MAX_MS ? 1 : loaded / assets.length;
      const target = Math.min(real, elapsed / MIN_MS) * 100;
      shown = target - shown < 0.5 ? Math.max(shown, target) : shown + (target - shown) * 0.08;
      const n = Math.min(real < 1 ? 99 : 100, Math.floor(shown));
      counter.textContent = String(n).padStart(3, '0');
      if (wordAt(n) !== current) swap(wordAt(n));
      if (n === 100) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { dead = true; cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={box} data-ag-intro="" aria-hidden="true" className="fixed inset-0 z-[101] flex flex-col bg-[#0C0B0A] text-[#F5F2ED] pt-4 px-[clamp(20px,4.4vw,64px)] pb-[clamp(20px,4vh,48px)]">
      <Image src="/images/93c7aab596.png" alt="" width={422} height={133} priority className="h-[46px] w-auto self-start" />
      <div className="flex-1 flex items-center">
        <span className="relative block overflow-hidden [font-family:'Archivo',sans-serif] font-bold uppercase text-[clamp(3rem,12vw,11rem)] leading-[.9] tracking-[-0.045em] [font-variation-settings:'wdth'_106]">
          <span className="invisible">{WORDS[2]}</span>
          {WORDS.map((w, i) => (
            <span key={w} ref={(s) => { words.current[i] = s; }} className="absolute left-0 top-0" style={{ transform: i ? 'translateY(110%)' : 'none' }}>{w}</span>
          ))}
        </span>
      </div>
      <span ref={count} data-intro-count="" className="self-end [font-family:'Archivo',sans-serif] font-bold text-[clamp(4rem,14vw,12rem)] leading-[.8] tracking-[-0.04em] tabular-nums">000</span>
    </div>
  );
}
```

- [ ] **Step 4: Render it on the home page**

In `app/page.tsx`, add below `import ContactPill from '@/components/ContactPill';`:

```tsx
import Intro from '@/components/Intro';
```

Append one line to the header comment's "Content update" paragraph, just before `import type { Metadata } from 'next';`:

```tsx
// Also hand-added: `<Intro />` (components/Intro.tsx, the first-visit entrance) before the root.
```

Replace the opening of `Home`'s return:

```tsx
  return (
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">
```

with:

```tsx
  return (
<>
<Intro />
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">
```

and its end:

```tsx
<HomeRuntime />
</div>
  );
```

with:

```tsx
<HomeRuntime />
</div>
</>
  );
```

- [ ] **Step 5: Hide the intro once seen**

Append to `app/globals.css`:

```css

/* Home entrance (components/Intro.tsx): off once seen this visit.
 * app/layout.tsx's head script sets the flag before first paint. */
[data-intro-seen] [data-ag-intro] { display: none; }
```

- [ ] **Step 6: Run the browser checks to verify they pass**

```bash
node "$SCRATCH/intro.mjs" 393 && node "$SCRATCH/intro.mjs" 1440 && node "$SCRATCH/transitions.mjs" 393
```

Expected: every line `ok`, exit code 0.

- [ ] **Step 7: Look at it**

Take a screenshot mid-intro at 393px (`p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })`, wait 1200ms, `p.screenshot`) and confirm: logo top-left, one word left-aligned mid-screen, the three-digit counter bottom-right, nothing overflowing the screen width. Do the same at 1440px.

- [ ] **Step 8: Type-check and lint**

Run: `npx tsc --noEmit -p . && npx eslint components/Intro.tsx app/page.tsx`
Expected: no output.

- [ ] **Step 9: Commit** (only with the user's go-ahead)

```bash
git add components/Intro.tsx app/page.tsx app/globals.css
git commit -m "feat: first-visit home entrance with load counter"
```

---

### Task 5: Full verification, including reduced motion

**Files:** none changed (fix-forward in the owning task's files if anything fails).

**Interfaces:**
- Consumes: everything above.
- Produces: the verified feature.

- [ ] **Step 1: Run every browser check at both widths**

```bash
for w in 393 1440; do node "$SCRATCH/transitions.mjs" $w && node "$SCRATCH/intro.mjs" $w || echo "FAILED at $w"; done
node "$SCRATCH/wait-reveal.mjs"
```

Expected: only `ok` lines; no `FAILED at`.

- [ ] **Step 2: Run them under reduced motion**

```bash
REDUCED=1 node "$SCRATCH/transitions.mjs" 393 && REDUCED=1 node "$SCRATCH/intro.mjs" 393
```

Expected: only `ok` lines.

- [ ] **Step 3: Check the other pages still work after a transition**

Create `$SCRATCH/pages.mjs`:

```js
// Every page, reached through the curtain from /, ends up with its first heading visible.
import { chromium } from 'file:///D:/arohance-projects/Arohance-new-website/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4600';
const PAGES = ['/about', '/services', '/studio', '/careers', '/contact', '/case-study/daadis-on-screen-and-on-ground'];
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 393, height: 852 } })).newPage();
await p.goto(BASE + '/about'); // mid-visit: no intro
for (const path of PAGES) {
  await p.goto(BASE + '/');
  await p.waitForFunction(() => !document.documentElement.hasAttribute('data-ag-covered'), null, { timeout: 8000 });
  await p.evaluate((href) => {
    const a = Object.assign(document.createElement('a'), { href, textContent: 'go' });
    document.body.appendChild(a);
    a.click();
  }, path);
  await p.waitForURL('**' + path, { timeout: 8000 });
  await p.waitForFunction(() => getComputedStyle(document.querySelector('[data-ag-curtain]')).visibility === 'hidden', null, { timeout: 8000 });
  await p.waitForTimeout(1800); // entrance animations finish
  const shown = await p.evaluate(() => {
    const h = document.querySelector('[data-ag-root] h1, [data-ag-root] h2');
    const r = h.getBoundingClientRect(), mid = document.elementFromPoint(r.left + 4, r.top + r.height / 2);
    return getComputedStyle(h).visibility === 'visible' && !!mid && (h.contains(mid) || mid.contains(h));
  });
  console.log(shown ? 'ok  ' : 'FAIL', path, shown ? 'heading visible' : 'heading hidden or covered');
  if (!shown) process.exitCode = 1;
  await p.screenshot({ path: `C:/Users/MYPC~1/AppData/Local/Temp/claude/d--arohance-projects-Arohance-new-website/c599ed4f-da5c-4f69-b036-f20378d8a524/scratchpad/page${path.replace(/\//g, '_')}.png` });
}
await b.close();
```

Run: `node "$SCRATCH/pages.mjs"`
Expected: six `ok` lines. Open two or three of the screenshots and confirm the first screen looks normal.

- [ ] **Step 4: Project checks**

Run: `npx tsc --noEmit -p . && npm test && npx eslint components lib/curtain.ts lib/behaviors/reveal.ts lib/behaviors/text.ts app/layout.tsx app/page.tsx`
Expected: tsc silent; `npm test` shows only the known pre-existing `collision warning fires only for genuinely differing content` failure; eslint silent.

- [ ] **Step 5: Stop the dev server** started for these checks.
