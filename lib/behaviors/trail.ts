import type { Behavior } from './types';

export const trail: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const svg = root.querySelector<SVGSVGElement>('[data-ag-trail]');
  if (!svg) return () => {};
  // this.props.scrollTrail -> true (frozen, porting table). The cast keeps
  // the comparison's shape without tripping TS2367 ("true" and "false"
  // literal types never overlap) — see task-8-report.md for detail.
  if ((true as boolean) === false) {
    svg.style.display = 'none';
    return () => {};
  }
  const line = svg.querySelector<SVGPathElement>('[data-ag-trail-line]');
  const ghost = svg.querySelector<SVGPathElement>('[data-ag-trail-ghost]');
  const dot = svg.querySelector<SVGCircleElement>('[data-ag-trail-dot]');
  const halo = svg.querySelector<SVGCircleElement>('[data-ag-trail-halo]');
  // The original queries these four without a null guard (unlike every other
  // early return in this file). Guarding them together mirrors the shape
  // `initShell` uses elsewhere in the same source for the same situation
  // (`if (!ov || !news || !menu) return;`).
  if (!line || !ghost || !dot || !halo) return () => {};
  const hero = root.querySelector<HTMLElement>('header');
  // Progress is a length along the path (px), and its target comes from the segment the
  // reader is in. So when the page grows below them (a homepage vertical opening) and the
  // path rebuilds, the drawn line stays exactly where it was.
  let len = 0, y0 = 0, tl = 0, cl = 0, k = 1, raf: number | null = null, marks: number[][] = [];
  const build = () => {
    // No viewBox: user units are page px, so a taller page never rescales the line.
    const W = root.clientWidth, H = root.scrollHeight;
    y0 = hero ? hero.offsetHeight * 0.82 : 0;
    // Below lg the content is full-bleed: swing gutter to gutter (smaller dot), so
    // the line runs in the margins and only crosses the text on the diagonals.
    k = W < 1024 ? 0.5 : 1;
    dot.setAttribute('r', String(6 * k));
    const g = (hero ? parseFloat(getComputedStyle(hero).paddingRight) : 20) / 2 / W;
    const step = Math.max(520, window.innerHeight * 0.95);
    const xs = k < 1 ? [1 - g, g] : [0.86, 0.1, 0.72, 0.18, 0.92, 0.06, 0.64, 0.22];
    let x = W * (k < 1 ? 1 - g : 0.94), y = y0, d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1), i = 0;
    marks = [[y, 0]]; // [y, path length] at each segment end
    while (y < H - 200) {
      const nx = W * xs[i % xs.length], ny = Math.min(H - 120, y + step);
      if (i % 3 === 1) {
        const mx = (x + nx) / 2, my = (y + ny) / 2, r = Math.min(120, W * 0.08);
        d += ' C' + x.toFixed(1) + ' ' + (y + step * 0.35).toFixed(1) + ' ' + (mx + r * 2).toFixed(1) + ' ' + (my - r).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + (my - r).toFixed(1);
        d += ' C' + (mx - r * 1.4).toFixed(1) + ' ' + (my - r).toFixed(1) + ' ' + (mx - r * 1.4).toFixed(1) + ' ' + (my + r).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + (my + r).toFixed(1);
        d += ' C' + (mx + r * 2).toFixed(1) + ' ' + (my + r).toFixed(1) + ' ' + nx.toFixed(1) + ' ' + (ny - step * 0.35).toFixed(1) + ' ' + nx.toFixed(1) + ' ' + ny.toFixed(1);
      } else {
        d += ' C' + x.toFixed(1) + ' ' + (y + step * 0.55).toFixed(1) + ' ' + nx.toFixed(1) + ' ' + (ny - step * 0.55).toFixed(1) + ' ' + nx.toFixed(1) + ' ' + ny.toFixed(1);
      }
      x = nx; y = ny; i++;
      line.setAttribute('d', d); marks.push([y, line.getTotalLength()]);
    }
    line.setAttribute('d', d); ghost.setAttribute('d', d);
    len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    update(); draw(cl);
  };
  const target = () => {
    const vh = window.innerHeight, sy = window.scrollY || 0;
    const headY = sy + vh * 0.62;
    const i = marks.findIndex((m) => m[0] >= headY);
    if (i <= 0) { tl = i ? len : 0; return; } // below the path's end : above its start
    const [ya, la] = marks[i - 1], [yb, lb] = marks[i];
    tl = la + ((lb - la) * (headY - ya)) / (yb - ya);
  };
  const draw = (l: number) => {
    if (!len) return;
    l = Math.min(Math.max(l, 0), len);
    line.style.strokeDashoffset = (len - l).toFixed(1);
    const pt = line.getPointAtLength(l);
    [dot, halo].forEach((c) => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); });
    const o = l > len * 0.002 ? '1' : '0'; dot.style.opacity = o; halo.style.opacity = o;
  };
  const loop = () => {
    cl += (tl - cl) * 0.12;
    if (Math.abs(tl - cl) < len * 0.0005) cl = tl;
    draw(cl);
    halo.setAttribute('r', ((16 + Math.sin(performance.now() / 380) * 4) * k).toFixed(1));
    raf = requestAnimationFrame(loop);
  };
  const update = () => target();
  window.addEventListener('scroll', update, { passive: true });
  let rt: ReturnType<typeof setTimeout> | null = null;
  const ro = new ResizeObserver(() => { if (rt) clearTimeout(rt); rt = setTimeout(build, 150); });
  ro.observe(root);
  build(); cl = tl; raf = requestAnimationFrame(loop);
  cleanups.push(() => { window.removeEventListener('scroll', update); ro.disconnect(); cancelAnimationFrame(raf!); });
  return () => cleanups.forEach((fn) => fn());
};
