import type { Behavior } from './types';

/**
 * Burger-menu overlay shell for Studio, Case Study and Contact — ported
 * from each page's own `shell()` method. All three are byte-identical:
 * diffed directly against `.source/templates/studio.html:627-667`,
 * `case-study.html:565-605` and `contact.html:502-542` — zero differences
 * beyond surrounding line numbers.
 *
 * This is deliberately NOT `lib/behaviors/shell.ts`. That module was
 * ported from the homepage's `initShell`, and is also reused (correctly —
 * independently verified) by About, Services and Careers: all three share
 * home's one extra feature, a click listener on every `<a>` inside the
 * open overlay that closes it (`Array.from(ov.querySelectorAll('a'))
 * .forEach(...)`). Studio, Case Study and Contact's own `shell()` methods
 * never do this — grepped all three templates for `querySelectorAll('a')`
 * inside the shell/overlay logic: zero hits in any of the three, versus a
 * confirmed hit in home, about, services and careers. The omission is
 * real, not a reading error, and the menu panel here does contain real
 * anchors (the nav links, converted to `next/link`, plus three "Media"
 * links), so it is not a theoretical difference either. Composing
 * `shell.ts` in for these three would silently add a behaviour their
 * originals never had: clicking any link inside the open overlay would
 * immediately animate it closed, when the source only closes it via the
 * explicit close button, a background click, or Escape.
 *
 * Everything else matches `shell.ts`: same paint()/state machine, same
 * body-scroll-lock-with-unconditional-release-on-unmount safety net, and
 * the same "guard on `!ov || !menu`, treat the news panel as optional"
 * shape — all three of these pages do have a real news panel and news
 * button (confirmed present in each page's own markup and JS, so this
 * branch is not actually exercised either way here), kept only for
 * consistency with the sibling module.
 */
export const shellMinimal: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const ov = root.querySelector<HTMLElement>('[data-ag-overlay]');
  const news = root.querySelector<HTMLElement>('[data-ag-news-panel]');
  const menu = root.querySelector<HTMLElement>('[data-ag-menu-panel]');
  const nBtn = root.querySelector<HTMLElement>('[data-ag-news-btn]');
  const mBtn = root.querySelector<HTMLElement>('[data-ag-menu-btn]');
  const burger = root.querySelector<HTMLElement>('[data-ag-burger]');
  const close = root.querySelector<HTMLElement>('[data-ag-close]');
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
  // No `ov.querySelectorAll('a')` close-on-click wiring here — see the
  // module doc comment above. This is the one deliberate omission versus
  // `shell.ts`.
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && state) { state = null; paint(); } };
  window.addEventListener('keydown', esc);
  cleanups.push(() => {
    ov.removeEventListener('click', bg);
    window.removeEventListener('keydown', esc);
  });
  paint();

  return () => {
    cleanups.forEach((fn) => fn());
    document.body.style.overflow = '';
  };
};
