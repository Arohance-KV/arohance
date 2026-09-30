import type { Behavior } from './types';

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Home, "(01) Selected work": scrolling dives the camera into the full stop
 *  of THE WORK. until its ink fills the viewport, then the accent work grid
 *  follows. The GlyphPortal move (log-eased zoom, a small roll, handover once
 *  ink covers the view), done on the real heading so it keeps its size and
 *  design.
 *
 *  Markup: [data-ag-zoom] track > [data-ag-zoom-pin] > ... >
 *  [data-ag-zoom-frame] (the h2, scaled) > [data-ag-zoom-dot] (the "."),
 *  plus [data-ag-zoom-fade] (eyebrow, intro line) which fade out instead.
 *  Setting data-ag-zoom="on" pins it (globals.css), so without JS or with
 *  reduced motion the header lays out as before. Keep [data-reveal] off the
 *  frame and its ancestors: reveal's transform would fight this one. */
export const zoom: Behavior = (root) => {
  const track = root.querySelector<HTMLElement>('[data-ag-zoom]');
  const pin = track?.querySelector<HTMLElement>('[data-ag-zoom-pin]');
  const frame = track?.querySelector<HTMLElement>('[data-ag-zoom-frame]');
  const dot = frame?.querySelector<HTMLElement>('[data-ag-zoom-dot]');
  const ctx = document.createElement('canvas').getContext('2d');
  if (!track || !pin || !frame || !dot || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const fades = Array.from(track.querySelectorAll<HTMLElement>('[data-ag-zoom-fade]'));
  track.dataset.agZoom = 'on';
  let s1 = 2, raf = 0;

  // Fixed-point zoom: scaling about P carries the dot's ink centre g onto the
  // viewport centre F exactly when the scale reaches s1.
  const layout = () => {
    frame.style.transform = '';
    const cs = getComputedStyle(dot);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText('.');
    const range = document.createRange();
    range.selectNodeContents(dot);
    const box = range.getBoundingClientRect(); // pen origin, font ascent box
    const f = frame.getBoundingClientRect();
    const p = pin.getBoundingClientRect();
    const gx = box.left + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 - f.left;
    const gy = box.top + m.fontBoundingBoxAscent + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2 - f.top;
    const r = Math.min(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2;
    s1 = Math.max(2, Math.hypot(p.width, p.height) / Math.max(1, r)); // dot's disk spans the full diagonal
    const fx = p.left + p.width / 2 - f.left, fy = p.top + p.height / 2 - f.top;
    frame.style.transformOrigin = `${(s1 * gx - fx) / (s1 - 1)}px ${(s1 * gy - fy) / (s1 - 1)}px`;
  };

  const paint = () => {
    raf = 0;
    const t = clamp(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - pin.offsetHeight));
    const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
    const done = t > 0.97; // ink already covers the viewport: hand over, stop painting giant type
    frame.style.transform = t ? `scale(${Math.exp(Math.log(s1) * e)}) rotate(${roll}deg)` : '';
    frame.style.visibility = done ? 'hidden' : '';
    pin.style.background = done ? 'var(--ag-accent,#F2600C)' : '';
    const fade = String(1 - smooth(0, 0.12, t));
    fades.forEach((el) => { el.style.opacity = fade; });
  };

  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
  const relayout = () => { layout(); paint(); };
  const ro = new ResizeObserver(relayout);
  ro.observe(pin);
  window.addEventListener('scroll', schedule, { passive: true });
  document.fonts.ready.then(() => { if (track.dataset.agZoom === 'on') relayout(); }); // dot metrics need Archivo
  relayout();

  return () => {
    ro.disconnect();
    window.removeEventListener('scroll', schedule);
    cancelAnimationFrame(raf);
    track.dataset.agZoom = '';
    frame.style.transform = frame.style.transformOrigin = frame.style.visibility = pin.style.background = '';
    fades.forEach((el) => { el.style.opacity = ''; });
  };
};
