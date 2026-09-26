import type { Behavior } from './types';

export const video: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const lb = root.querySelector<HTMLElement>('[data-ag-lightbox]');
  if (!lb) return () => {};
  const img = lb.querySelector<HTMLImageElement>('[data-lb-img]');
  const quote = lb.querySelector<HTMLElement>('[data-lb-quote]');
  const name = lb.querySelector<HTMLElement>('[data-lb-name]');
  const open = (card: HTMLElement) => {
    // The original resolves `data-vt-poster="assets/*.jpg"` through the
    // artifact bundler's `window.__resources` table (same mechanism as the
    // old `loadMod`). That table does not exist here, and unlike
    // liquid-ether/stroke-text there is no prescribed replacement for it, so
    // this is ported as written — the cast only satisfies TypeScript. Flagged
    // in task-8-report.md: the lookup always misses and falls back to the
    // literal "assets/*.jpg" string, which will not resolve to a real image.
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
