import type { Behavior } from './types';

/**
 * Studio and Case Study's own `[data-hover-group]` interaction —
 * structurally the same idea as `hovers.ts` (image scale + title shift on
 * hover) but with different constants. Confirmed by a direct byte diff of
 * each page's block: `.source/templates/studio.html:586-594`,
 * `case-study.html:513-521` — identical between the two pages.
 *
 * Deliberately NOT a reuse of `hovers.ts`, which was ported verbatim from
 * the homepage's `initHovers` (also reused correctly by About and
 * Services — both grepped directly and confirmed to share home's exact
 * constants). Three concrete differences from `hovers.ts`, all confirmed
 * against source:
 *   - the title's hover-shift is `translate3d(12px,0,0)` here, not
 *     `hovers.ts`'s `translate3d(10px,0,0)` — home/about/services all use
 *     10px (grepped every template directly; only studio/case-study use
 *     12px). This is the one that actually changes what renders.
 *   - the leave state resets the title's transform to `'none'`, not
 *     `hovers.ts`'s `'translate3d(0,0,0)'`. (The two render identically —
 *     `none` is treated as the identity transform and interpolates the
 *     same as an explicit zero translate — so this alone would not force
 *     a split, but it is a real textual difference, recorded for
 *     completeness.)
 *   - the image's transition is assigned outright
 *     (`img.style.transition = 'scale .9s cubic-bezier(.16,1,.3,1)'`),
 *     not appended to any prior value the way `hovers.ts` does
 *     (`(img.style.transition || '') + ', scale .9s ...'`).
 * The 12px constant alone is a real, visible behaviour difference, so
 * this block is ported as its own module rather than reused.
 */
export const hoverLift: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  Array.from(root.querySelectorAll<HTMLElement>('[data-hover-group]')).forEach((group) => {
    const img = group.querySelector<HTMLElement>('[data-hover-img]');
    const title = group.querySelector<HTMLElement>('[data-hover-title]');
    if (img) img.style.transition = 'scale .9s cubic-bezier(.16,1,.3,1)';
    const enter = () => {
      if (img) img.style.scale = '1.045';
      if (title) title.style.transform = 'translate3d(12px,0,0)';
    };
    const leave = () => {
      if (img) img.style.scale = '1';
      if (title) title.style.transform = 'none';
    };
    group.addEventListener('mouseenter', enter);
    group.addEventListener('mouseleave', leave);
    cleanups.push(() => {
      group.removeEventListener('mouseenter', enter);
      group.removeEventListener('mouseleave', leave);
    });
  });
  return () => cleanups.forEach((fn) => fn());
};
