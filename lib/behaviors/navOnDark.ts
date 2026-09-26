import type { Behavior } from './types';

/**
 * Studio and Case Study's own nav — color/padding/logo-height on scroll,
 * PLUS live `onDark`-conditional button recolouring. Ported verbatim from
 * the nav-handling half of each page's fused parallax+nav scroll handler:
 * `.source/templates/studio.html:565-578`, `case-study.html:492-505` —
 * diffed directly, byte-identical between the two pages.
 *
 * Split out from `parallax` (the `px.forEach(...)` half of that same fused
 * `frame()` in source) into its own Behavior, matching how this codebase
 * already treats "nav" and "parallax" as independent concerns everywhere
 * else (`nav.ts` / `parallax.ts`, each attaching its own scroll/resize
 * listeners). The two halves touch disjoint elements (`[data-parallax]`
 * vs `[data-ag-nav]`) and neither reads a value the other writes, so
 * nothing observable depends on them sharing one requestAnimationFrame
 * callback.
 *
 * This is deliberately NOT `lib/behaviors/nav.ts`. `nav.ts` hardcodes the
 * button background/color (`#1A1815`/`#F5F2ED`) and documents dropping the
 * `darks`/`onDark` computation as dead code — correct for the homepage,
 * where the computed value was never read. Studio and Case Study's own
 * source DOES read it: every scroll/resize tick, it probes whether the
 * nav's vertical midpoint currently overlies a `[data-dark]` section and
 * recolours every nav `<button>` accordingly (`#F5F2ED`/`#F5F2ED` on dark,
 * `#1F1E1C`/`#EDE9E1` otherwise — matching each page's static resting
 * classes exactly, so there is no first-paint flash either way). Because
 * `nav.ts` writes `button.style.background`/`.color` as *inline* styles,
 * and these nav buttons carry `hover:bg-[var(--ag-accent,#F2600C)]`, an
 * inline style would beat that hover rule regardless of specificity —
 * reusing `nav.ts` here would both freeze the wrong resting colour (never
 * re-checking `onDark`) AND silently kill the hover after the first
 * scroll event. Same failure mode flagged for Careers in the previous
 * task; this page pair gets its own module instead of composing `nav.ts`
 * plus a delta.
 */
export const navOnDark: Behavior = (root) => {
  const nav = root.querySelector<HTMLElement>('[data-ag-nav]');
  if (!nav) return () => {};
  const darks = Array.from(root.querySelectorAll<HTMLElement>('[data-dark]'));
  const logo = nav.querySelector<HTMLElement>('[data-ag-logo]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const stuck = (window.scrollY || 0) > 40;
    const probe = nav.getBoundingClientRect().height * 0.6;
    const onDark = darks.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    nav.style.color = '#F5F2ED';
    if (logo) logo.style.filter = 'none';
    nav.style.padding = (stuck ? '11px ' : '16px ') + 'clamp(20px,4.4vw,64px)';
    if (logo) logo.style.height = stuck ? '36px' : '46px';
    Array.from(nav.querySelectorAll<HTMLButtonElement>('button')).forEach((b) => {
      b.style.background = onDark ? '#F5F2ED' : '#1F1E1C';
      b.style.color = onDark ? '#F5F2ED' : '#EDE9E1';
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};
