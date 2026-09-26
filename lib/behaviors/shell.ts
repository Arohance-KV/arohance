import type { Behavior } from './types';

/**
 * Nav burger / overlay menu, ported from `initShell` in the homepage script.
 *
 * Careers has no news panel or news button (its `initShell` never queries
 * `[data-ag-news-panel]` / `[data-ag-news-btn]` at all — confirmed against
 * `.source/templates/careers.html`). The original guard bailed out unless
 * the news panel was also found, which would strand careers with no menu at
 * all. Here the news panel and its button are wired only when present; the
 * overlay and the menu panel are the only required elements.
 */
export const shell: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const ov = root.querySelector<HTMLElement>('[data-ag-overlay]');
  const news = root.querySelector<HTMLElement>('[data-ag-news-panel]');
  const menu = root.querySelector<HTMLElement>('[data-ag-menu-panel]');
  const nBtn = root.querySelector<HTMLElement>('[data-ag-news-btn]');
  const mBtn = root.querySelector<HTMLElement>('[data-ag-menu-btn]');
  const burger = root.querySelector<HTMLElement>('[data-ag-burger]');
  const close = root.querySelector<HTMLElement>('[data-ag-close]');
  // The lock this behaviour may have engaged must never survive past this
  // mount, even on the path that wires up nothing — a page that navigates
  // away must not inherit a stuck `overflow:hidden` from here.
  if (!ov || !menu) return () => { document.body.style.overflow = ''; };

  const bars = burger ? (Array.from(burger.children) as HTMLElement[]) : [];
  let state: 'news' | 'menu' | null = null;

  const paint = () => {
    const open = !!state;
    ov.style.opacity = open ? '1' : '0';
    ov.style.visibility = open ? 'visible' : 'hidden';
    ov.style.pointerEvents = open ? 'auto' : 'none';
    const panels: Array<[HTMLElement, boolean]> = news
      ? [
          [news, state === 'news' || state === 'menu'],
          [menu, state === 'menu'],
        ]
      : [[menu, state === 'menu']];
    panels.forEach(([el, on], i) => {
      el.style.opacity = on ? '1' : '0';
      el.style.transform = on ? 'none' : 'translate3d(28px,0,0)';
      el.style.transitionDelay = on ? i * 70 + 'ms' : '0ms';
      el.style.pointerEvents = on ? 'auto' : 'none';
    });
    if (bars.length === 2) {
      bars[0].style.transform = state === 'menu' ? 'translateY(3.5px) rotate(45deg)' : 'none';
      bars[1].style.transform = state === 'menu' ? 'translateY(-3.5px) rotate(-45deg)' : 'none';
    }
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const set = (next: 'news' | 'menu') => { state = state === next ? null : next; paint(); };
  const on = (el: HTMLElement | null, fn: () => void) => {
    if (!el) return;
    el.addEventListener('click', fn);
    cleanups.push(() => el.removeEventListener('click', fn));
  };
  on(nBtn, () => set('news'));
  on(mBtn, () => set('menu'));
  on(close, () => { state = null; paint(); });

  const bg = (e: Event) => { if (e.target === ov) { state = null; paint(); } };
  ov.addEventListener('click', bg);
  Array.from(ov.querySelectorAll('a')).forEach((a) => {
    const h = () => { state = null; paint(); };
    a.addEventListener('click', h);
    cleanups.push(() => a.removeEventListener('click', h));
  });
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && state) { state = null; paint(); } };
  window.addEventListener('keydown', esc);
  cleanups.push(() => {
    ov.removeEventListener('click', bg);
    window.removeEventListener('keydown', esc);
  });
  paint();

  // Review Focus 4 / Fact 1: release the scroll lock unconditionally. If the
  // menu happened to be open when the route changed, the next page must not
  // inherit a stuck `overflow:hidden` on <body>.
  //
  // Final fix wave, item 7a: `try/finally`, not a bare sequence. Nothing in
  // `cleanups` can throw today (each entry is a plain `removeEventListener`
  // call) — this is not a live defect — but a bare `cleanups.forEach(...)`
  // followed by the reset means one future throwing cleanup would skip the
  // reset and strand the user on an unscrollable page with no recovery but a
  // reload. `AgRuntime` isolates disposers from *different* behaviour
  // modules from each other; it does not reach inside this one module's own
  // `forEach` to protect its own last line. `finally` does that here.
  return () => {
    try {
      cleanups.forEach((fn) => fn());
    } finally {
      document.body.style.overflow = '';
    }
  };
};
