import type { Behavior } from './types';

export const video: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const lb = root.querySelector<HTMLElement>('[data-ag-lightbox]');
  if (!lb) return () => {};
  const img = lb.querySelector<HTMLImageElement>('[data-lb-img]');
  const quote = lb.querySelector<HTMLElement>('[data-lb-quote]');
  const name = lb.querySelector<HTMLElement>('[data-lb-name]');
  const open = (card: HTMLElement) => {
    // The original resolved `data-vt-poster="assets/*.jpg"` through the
    // artifact bundler's `window.__resources` table (same mechanism as the
    // old `loadMod`) — that table does not exist here, and unlike
    // liquid-ether/stroke-text there was no prescribed replacement for it, so
    // this was ported as written, cast only to satisfy TypeScript.
    //
    // Corrected (was flagged as broken in task-8-report.md, before Task 8's
    // own converter fix): `tools/convert.mjs` now rewrites `data-vt-poster`
    // in the markup itself, so by the time this runs the attribute already
    // holds a real, resolvable path (e.g. "/images/df2ee54140.jpg" — see
    // app/page.tsx), never the bundle-relative "assets/*.jpg" string. The
    // regex below only ever matched that literal bundle-relative form, so it
    // no longer matches anything, `.replace()` is a no-op, and the real path
    // is used as-is — the four testimonial posters all resolve correctly.
    // The `window.__resources` branch is therefore dead code: it can never
    // run (the replacer callback only fires on a match), so it is harmless,
    // not a latent bug. Left in deliberately for source fidelity rather than
    // deleted, matching how this project treats other verbatim-ported
    // dead code elsewhere (e.g. `reel.ts`'s unread `q`).
    if (img) img.setAttribute('src', card.getAttribute('data-vt-poster')?.replace(/^assets\/(.+)\.jpg$/, (m, k) => ((window as Window & { __resources?: Record<string, string> }).__resources || {})[k] || m) || '');
    if (quote) quote.innerHTML = card.getAttribute('data-vt-quote') || '';
    if (name) name.innerHTML = card.getAttribute('data-vt-name') || '';
    lb.style.visibility = 'visible';
    lb.style.pointerEvents = 'auto';
    lb.style.opacity = '1';
  };
  const close = () => {
    lb.style.opacity = '0';
    lb.style.pointerEvents = 'none';
    setTimeout(() => { lb.style.visibility = 'hidden'; }, 400);
  };
  Array.from(root.querySelectorAll<HTMLElement>('[data-vt-card]')).forEach((c) => {
    const h = () => open(c);
    c.addEventListener('click', h);
    cleanups.push(() => c.removeEventListener('click', h));
  });
  lb.addEventListener('click', close);
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', esc);
  cleanups.push(() => { lb.removeEventListener('click', close); window.removeEventListener('keydown', esc); });
  return () => cleanups.forEach((fn) => fn());
};
