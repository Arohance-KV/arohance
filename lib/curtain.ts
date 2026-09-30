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
