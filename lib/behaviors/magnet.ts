import type { Behavior } from './types';

export const magnet: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const el = root.querySelector<HTMLElement>('[data-ag-magnet]');
  if (!el) return () => {};
  if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return () => {};
  let tx = 0, ty = 0, cx = 0, cy = 0, raf: number | null = null;
  const move = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy), R = Math.max(r.width, 420);
    const k = d < R ? 1 - d / R : 0;
    tx = dx * 0.14 * k; ty = dy * 0.22 * k;
  };
  const loop = () => {
    cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
    el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
    raf = requestAnimationFrame(loop);
  };
  window.addEventListener('mousemove', move, { passive: true });
  raf = requestAnimationFrame(loop);
  cleanups.push(() => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf!); });
  return () => cleanups.forEach((fn) => fn());
};
