import type { Behavior } from './types';

export const stroke: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-stroke]');
  if (!el) return () => {};
  let dispose: (() => void) | null = null;
  let dead = false;
  import('@/lib/stroke-text')
    .then((m) => {
      if (dead) return;
      dispose = m.mount(el, {
        text: 'AROHANCE',
        strokeColor:
          getComputedStyle(document.documentElement).getPropertyValue('--ag-accent').trim() || '#F2600C',
        fillColor: '#F5F2ED', strokeWidth: 1.6, drawDuration: 1.8, fillDelay: 0.15,
        stagger: 0.08, ease: 'power2.out', trigger: 'scroll', fillMode: 'wipe',
        fontSize: 200, fontWeight: 700, letterSpacing: -9,
        fontFamily: "'Archivo',sans-serif",
      });
      el.style.minHeight = '';
    })
    .catch((e) => console.warn('stroke-text', e));
  return () => { dead = true; dispose?.(); };
};
