import type { Behavior } from './types';

/**
 * Careers' own nav — padding/logo-height on scroll, plus the
 * `[data-ag-navcta]` toggle — ported verbatim from careers' own `initNav`
 * in `.source/templates/careers.html:642-657`.
 *
 * This is careers' whole `initNav`, not the shared `nav.ts` plus an
 * add-on. An earlier pass split it that way (`navCta.ts`, now deleted),
 * reasoning that everything `nav.ts` does beyond padding/logo-height was a
 * no-op on careers' static markup: careers' nav text colour and logo
 * filter already equal the values `nav.ts` sets, and its menu button is
 * already `bg-[#1A1815] text-[#F5F2ED]`. Colour and filter really are
 * no-ops. The button loop is not, and the reason is specificity, not
 * value — `nav.ts` sets `b.style.background` / `b.style.color` as
 * *inline* styles, and an inline style beats a stylesheet rule regardless
 * of specificity, including the menu button's own
 * `hover:bg-[var(--ag-accent,#F2600C)] hover:text-[#0A0A0A]`. Composing
 * `nav.ts` in would silently kill that hover after the first scroll event
 * — a behaviour careers' original never had, since its own `initNav`
 * never touches `<button>` at all. (Home's original *does* run that loop
 * over buttons that also carry a `hover:bg-` class, so `nav.ts`
 * suppressing their hover after first scroll faithfully reproduces an
 * existing quirk of home's own original — correct for home, but not one
 * to export to a page that never had it.) A verbatim port needs no proof
 * that composition reproduces the original; it just is the original.
 */
export const navCareers: Behavior = (root) => {
  const nav = root.querySelector<HTMLElement>('[data-ag-nav]');
  if (!nav) return () => {};
  const logo = nav.querySelector<HTMLElement>('[data-ag-logo]');
  const cta = nav.querySelector<HTMLElement>('[data-ag-navcta]');
  const onScroll = () => {
    const stuck = (window.scrollY || 0) > 40;
    nav.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    if (cta) cta.style.display = stuck && window.innerWidth > 720 ? 'flex' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};
