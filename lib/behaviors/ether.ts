import type { Behavior } from './types';

export const ether: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-ether]');
  if (!el) return () => {};
  let dispose: (() => void) | null = null;
  let dead = false;
  import('@/lib/liquid-ether')
    .then((m) => {
      if (dead) return;
      dispose = m.mount(el, {
        colors: ['#B8410A', '#F2600C', '#FFC89E'],
        mouseForce: 22, cursorSize: 110, resolution: 0.5,
        autoDemo: true, autoSpeed: 0.6, autoIntensity: 2.8,
        takeoverDuration: 0.25, autoResumeDelay: 900, autoRampDuration: 0.6,
      });
    })
    .catch((e) => console.warn('liquid-ether', e));
  return () => { dead = true; dispose?.(); };
};
