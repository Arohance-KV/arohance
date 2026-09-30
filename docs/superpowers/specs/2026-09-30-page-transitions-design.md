# Page transitions and home entrance — design

Date: 2026-09-30. Status: approved in chat, awaiting spec review.

## Goal

1. Every internal page-to-page navigation plays a transition that covers the
   screen, holds until the next page is ready, then reveals it.
2. A visit that starts on the home page opens with an entrance: the words
   DESIGN, SHOOT, ENGINEER and a 0→100 counter that follows real loading.

Success: no flash of a half-loaded page; fast loads don't feel slow;
back/forward keeps working; entrance animations on the page are seen, not
played underneath an overlay.

## Decisions (from the brainstorm)

| Question | Answer |
|---|---|
| Entrance frequency | Every full page load of `/` (refresh, typed URL, new tab); reaching `/` by a link from another page gets the curtain (changed 2026-09-30 from once per tab session, at the user's request) |
| Transition look | Accent-orange curtain, destination name large in the middle |
| Entrance look | One huge word at a time sliding up out of a mask; big counter bottom-right; screen slides up at 100 |
| Approach | One persistent transition layer in the root layout that intercepts link clicks |

Rejected: Next's experimental View Transitions (cannot hold until the page is
loaded, experimental flag) and `template.tsx` (enter only, waits for nothing).

## Units

### `lib/curtain.ts` (no imports, so node tests can transpile it)

- `navTarget(link, click, current)` → the URL string to navigate to, or `null`
  to leave the click alone. `link` is `{ href, target, download }`, `click` is
  `{ button, metaKey, ctrlKey, shiftKey, altKey, defaultPrevented }`,
  `current` is `location.href`. Returns `null` when: not a primary click, any
  modifier held, already prevented, `target` set to anything but `_self`,
  `download` present, different origin, or pathname and search equal the
  current URL's (same-page links, with or without a hash). Otherwise returns
  `pathname + search + hash` of the resolved link.
- `cover()` sets `data-ag-covered` on `<html>`; `reveal()` removes it and
  dispatches `ag:reveal` on `window`; `whenRevealed()` resolves at once when
  `<html>` has no `data-ag-covered`, otherwise on the next `ag:reveal`.

### `components/PageTransition.tsx` (client, rendered once in `app/layout.tsx`)

Props: `labels: Record<string, string>` — pathname → display name, built in
`app/layout.tsx` on the server: `/` Home, `/about` About, `/services`
Services, `/studio` Studio, `/careers` Careers, `/contact` Contact, and every
case study's `workHref(w)` → `w.client`. Built server-side so `lib/work.ts`
stays out of the client bundle. Unknown paths show "Arohance".

Markup: a fixed full-screen accent (`var(--ag-accent)`) panel, `z-[100]`,
`aria-hidden`, holding the label in Archivo bold, uppercase,
`clamp(2.5rem,10vw,9rem)`, colour `#0A0A0A`, inside an overflow mask.
Server-rendered in the covering position with the label for the current
path (from `usePathname()`), so a direct landing is covered from first paint.

Behaviour:
- Mount: if the home entrance is playing (`<html>` lacks `data-intro-seen`),
  move the curtain off-screen instantly and leave the first reveal to the
  intro. Otherwise wait for readiness (below), then play the exit.
- Click (one capture-phase `click` listener on `document`, closest `a[href]`):
  if `navTarget` returns a URL, `preventDefault()`, `router.prefetch(url)`,
  `cover()`, set the label, play the enter (panel from `translateY(100%)` to
  `0`, 0.55s, `cubic-bezier(.76,0,.24,1)`, label slides up from its mask),
  then `router.push(url)`. Link clicks during a transition are prevented
  and dropped, not queued.
- Ready = pathname (from `usePathname()`) equals the target's pathname, then
  `document.fonts.ready`, then every `img` inside `[data-ag-root]` whose top
  is within the first viewport and is not `complete` has fired `load` or
  `error` (only the first screen: lazy images further down may not start
  loading while covered, and would always hit the cap). At least 0.3s after
  the enter finished; at most 4s after the push.
- Exit: `reveal()`, then panel to `translateY(-100%)`, 0.6s, same easing;
  then park it at `translateY(100%)` for the next enter.
- Back/forward (`popstate`) is not intercepted: instant, no curtain.
- While covered, `document.documentElement.style.overflow = 'hidden'`
  (on `<html>`, so it never fights the menu's lock on `<body>`).
- Animations use the Web Animations API (`element.animate`, awaiting
  `.finished`): native, and nothing to load before the first frame.

### `components/Intro.tsx` (client, rendered at the top of `app/page.tsx`)

Markup, server-rendered covering (`z-[101]`, `aria-hidden`, background
`#0C0B0A`): the logo (`/images/93c7aab596.png`) top-left where the nav logo
sits; one word at a time in Archivo bold uppercase
`clamp(3rem,12vw,11rem)` inside an overflow mask, left-aligned in the page
gutter; a three-digit counter (`000`) bottom-right in Archivo bold,
`clamp(4rem,14vw,12rem)`, `tabular-nums`.

Words by displayed value: DESIGN 0–33, SHOOT 34–66, ENGINEER 67–100. On a
change the old word slides up out of the mask and the new one slides up in
(0.5s).

Counter:
- Real progress = finished / total over: `document.fonts.ready`, each `img`
  inside `[data-ag-root]` without `loading="lazy"`, and `window` `load`.
- Each frame: `target = min(real × 100, elapsed / 2400ms × 100)`, then
  `shown += (target − shown) × 0.08`, never decreasing, held at 99 until
  real progress is complete. After 8s real progress is treated as complete.
- At 100: pause 0.2s, call `reveal()`, slide the intro to
  `translateY(-100%)` (0.9s, `cubic-bezier(.76,0,.24,1)`), then set
  `data-intro-seen` on `<html>` (CSS hides it from then on, including when
  the home page is revisited by client navigation).
- Locks scroll on `<html>` while playing, like the curtain.

### Entrance gate (inline script in `app/layout.tsx` `<head>`)

Runs before first paint: every full load of a page other than `/` marks the
intro as seen, so it only ever plays when the document itself loads on `/`.
Client navigations to `/` never replay it (the attribute persists on `<html>`).

```js
if (location.pathname !== '/') document.documentElement.setAttribute('data-intro-seen', '');
```

`<html>` is rendered with `data-ag-covered=""` (so `whenRevealed()` waits
from the first script onward) and `suppressHydrationWarning` (the gate and
`cover()`/`reveal()` change its attributes before and after hydration).

### `app/globals.css`

```css
[data-intro-seen] [data-ag-intro] { display: none; }
```

Plus, in `app/layout.tsx`, a no-JS fallback:
`<noscript><style>[data-ag-intro],[data-ag-curtain]{display:none}</style></noscript>`.

### Entrance animations wait for the reveal

`lib/behaviors/text.ts` and `lib/behaviors/reveal.ts` start observing
(`io.observe(...)`) only after `whenRevealed()` resolves. Their hidden
starting states are still set at mount, so nothing flashes. On back/forward
nothing is covered, so they start at once as today.

## Reduced motion

Curtain and intro fade (opacity, 0.2s) instead of sliding; words swap
without the slide; the counter still runs.

## Failure handling

- JavaScript off: the `<noscript>` rule hides both overlays.
- A stuck asset: the 4s (transition) and 8s (intro) caps.
- A navigation that never changes the pathname (e.g. an error): the 4s cap
  still runs the exit.

## Trade-off

Covering the first paint delays Lighthouse's Largest Contentful Paint on
direct landings.

## Testing

- `lib/curtain.test.mjs` (node, transpiling `lib/curtain.ts` like
  `lib/work.test.mjs` does): `navTarget` returns `null` for modifier clicks,
  middle clicks, `target="_blank"`, `download`, other origins and same-page
  hash links; returns the path for internal links, including `/#work` from
  `/about`.
- A Playwright check script in the session scratchpad (not committed),
  against `next dev`, at 393px and 1440px:
  first visit to `/` shows the intro, the counter reaches `100`, the intro
  hides; a reload in the same tab skips it; clicking a nav link shows the
  curtain with the right label, lands on the new route, and the curtain
  leaves; a same-page `#` link does not show the curtain; the back button
  returns without a curtain; landing directly on `/about` shows no intro.
- `npx tsc --noEmit`, `npm test`, eslint on the touched files.

## Files

New: `lib/curtain.ts`, `lib/curtain.test.mjs`,
`components/PageTransition.tsx`, `components/Intro.tsx`.
Edited: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`,
`lib/behaviors/text.ts`, `lib/behaviors/reveal.ts`.
