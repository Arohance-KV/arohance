import type { Behavior } from './types';

/**
 * "Open roles" nav CTA, unique to careers — ported from careers' own
 * `initNav` in `.source/templates/careers.html` (lines 642-657).
 *
 * That function is `nav.ts`'s logic plus this toggle, minus a few
 * assignments that are no-ops on careers specifically, confirmed against
 * `.source/jsx/careers.jsx`: careers' menu button is already
 * `bg-[#1A1815] text-[#F5F2ED]` in its static markup — the exact values
 * `nav.ts`'s button loop would otherwise set — and its logo's transition
 * list carries no `filter` to reset (unlike every other page's logo, which
 * lists `filter .45s ease`). Careers' version also drops the dead
 * dark-section probe `nav.ts` already excludes as dead code. None of that
 * is a loss of visible behaviour; running the existing `nav` behaviour
 * unmodified alongside this one reproduces careers' nav exactly, so this
 * stays a small addition rather than a fork of `nav.ts`.
 *
 * Mounted after `nav` in `CAREERS_MODULES` (Ruling 1) — not a conditional
 * inside `nav.ts`, which every other page also mounts and which has no
 * `[data-ag-navcta]` element to act on.
 */
export const navCta: Behavior = (root) => {
  const nav = root.querySelector<HTMLElement>('[data-ag-nav]');
  const cta = nav?.querySelector<HTMLElement>('[data-ag-navcta]');
  if (!nav || !cta) return () => {};
  const onScroll = () => {
    const stuck = (window.scrollY || 0) > 40;
    cta.style.display = stuck && window.innerWidth > 720 ? 'flex' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};
