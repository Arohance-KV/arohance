import type { Behavior } from './types';

/** Pull radius (px, floor) and strength (share of the cursor offset) per axis. */
const RADIUS = 260, PULL_X = 0.2, PULL_Y = 0.26;

/**
 * Pulls the letters of `[data-ag-magnet]` toward the cursor. Each
 * `[data-ag-magnet-letter]` moves by how close the cursor is to that letter,
 * so the word bends toward the pointer rather than sliding as one block
 * (an element with no letter spans is pulled whole, by the same rule).
 * Mouse-only, and off under reduced motion.
 */
export const magnet: Behavior = (root) => {
  const el = root.querySelector<HTMLElement>('[data-ag-magnet]');
  if (!el) return () => {};
  if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const letters = Array.from(el.querySelectorAll<HTMLElement>('[data-ag-magnet-letter]'));
  const parts = (letters.length ? letters : [el]).map((node) => ({ node, x: 0, y: 0, tx: 0, ty: 0 }));
  let mx = -1e5, my = -1e5, inView = true, raf = 0;

  const aim = () => {
    for (const p of parts) {
      if (!inView) { p.tx = 0; p.ty = 0; continue; }
      // The rect already includes this letter's current pull; subtract it to
      // measure from where the letter rests, or the pull feeds back on itself.
      const r = p.node.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2 - p.x), dy = my - (r.top + r.height / 2 - p.y);
      const reach = Math.max(RADIUS, r.height * 2.4);
      const k = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
      p.tx = dx * PULL_X * k; p.ty = dy * PULL_Y * k;
    }
  };
  const loop = () => {
    raf = 0;
    aim();
    let moving = false;
    for (const p of parts) {
      p.x += (p.tx - p.x) * 0.12; p.y += (p.ty - p.y) * 0.12;
      if (Math.abs(p.tx - p.x) > 0.05 || Math.abs(p.ty - p.y) > 0.05) moving = true;
      else { p.x = p.tx; p.y = p.ty; }
      p.node.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0)';
    }
    if (moving) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; kick(); };
  const release = () => { mx = my = -1e5; kick(); };
  const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; kick(); });
  io.observe(el);
  window.addEventListener('mousemove', move, { passive: true });
  document.documentElement.addEventListener('mouseleave', release);
  return () => {
    io.disconnect();
    window.removeEventListener('mousemove', move);
    document.documentElement.removeEventListener('mouseleave', release);
    cancelAnimationFrame(raf);
  };
};
