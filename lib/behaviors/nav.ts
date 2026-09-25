import type { Behavior } from './types';

export const nav: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-nav]');
  if (!el) return () => {};
  // The original also computed a dark-section "probe" here and ran it through
  // Array.some() over every [data-dark] element on each scroll event, but only
  // ever discarded the result — the nav colour below is hardcoded regardless.
  // That's dead code (and a forced layout reflow per [data-dark] element per
  // scroll), so it is not ported.
  const onScroll = () => {
    const y = window.scrollY || 0;
    const stuck = y > 40;
    el.style.color = '#F5F2ED';
    const logo = el.querySelector<HTMLElement>('[data-ag-logo]');
    if (logo) logo.style.filter = 'none';
    el.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    Array.from(el.querySelectorAll('button')).forEach((b) => {
      b.style.background = '#1A1815';
      b.style.color = '#F5F2ED';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
};
