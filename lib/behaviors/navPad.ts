import type { Behavior } from './types';

/**
 * Contact's own nav — padding and logo-height on scroll, nothing else.
 * Ported verbatim from `.source/templates/contact.html:452-465`.
 *
 * Even more minimal than Careers' `navCareers.ts`. Contact's nav never
 * touches `<button>` at all (confirmed: no button loop anywhere in its
 * source) — its nav buttons rest permanently at the static
 * `bg-[#1F1E1C] text-[#EDE9E1]` classes, matching Ruling 1 (Contact's
 * buttons rest at `#1F1E1C`, not `#1A1815`). There is also no
 * `[data-ag-navcta]` CTA to toggle (confirmed: zero occurrences of
 * `data-ag-navcta` anywhere in `contact.html`, unlike careers.html), and
 * the source attaches only a `scroll` listener, never `resize`
 * (`navCareers.ts` attaches both). Reusing `navCareers.ts` here would add
 * a `resize` listener Contact's original never had, plus a null-guarded
 * but pointless CTA branch ported from a page this one bears no relation
 * to. A distinct, single-purpose module is more honest about what
 * Contact's nav actually does.
 */
export const navPad: Behavior = (root) => {
  const nav = root.querySelector<HTMLElement>('[data-ag-nav]');
  if (!nav) return () => {};
  const logo = nav.querySelector<HTMLElement>('[data-ag-logo]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const stuck = (window.scrollY || 0) > 40;
    nav.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  frame();
  return () => window.removeEventListener('scroll', onScroll);
};
