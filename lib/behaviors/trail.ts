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
  let len = 0, y0 = 0, H = 0, tp = 0, cp = 0, raf: number | null = null;
  const build = () => {
    const W = root.clientWidth; H = root.scrollHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    y0 = hero ? hero.offsetHeight * 0.82 : 0;
    const step = Math.max(520, window.innerHeight * 0.95);
    const xs = [0.86, 0.1, 0.72, 0.18, 0.92, 0.06, 0.64, 0.22];
    let x = W * 0.94, y = y0, d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1), i = 0;
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
    }
    line.setAttribute('d', d); ghost.setAttribute('d', d);
    len = line.getTotalLength();
    line.style.strokeDasharray = String(len); line.style.strokeDashoffset = String(len);
    cp = -1; update();
  };
  const target = () => {
    const vh = window.innerHeight, sy = window.scrollY || 0;
    const headY = sy + vh * 0.62;
    tp = Math.max(0, Math.min(1, (headY - y0) / Math.max(1, H - y0 - 120)));
  };
  const draw = (p: number) => {
    if (!len) return;
    line.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    const pt = line.getPointAtLength(len * p);
    [dot, halo].forEach((c) => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); });
    const o = p > 0.002 ? '1' : '0'; dot.style.opacity = o; halo.style.opacity = o;
  };
  const loop = () => {
    cp += (tp - cp) * 0.12;
    if (Math.abs(tp - cp) < 0.0005) cp = tp;
    draw(cp);
    halo.setAttribute('r', (16 + Math.sin(performance.now() / 380) * 4).toFixed(1));
    raf = requestAnimationFrame(loop);
  };
  const update = () => target();
  window.addEventListener('scroll', update, { passive: true });
  let rt: ReturnType<typeof setTimeout> | null = null;
  const ro = new ResizeObserver(() => { if (rt) clearTimeout(rt); rt = setTimeout(build, 150); });
  ro.observe(root);
  build(); cp = tp; raf = requestAnimationFrame(loop);
  cleanups.push(() => { window.removeEventListener('scroll', update); ro.disconnect(); cancelAnimationFrame(raf!); });
  return () => cleanups.forEach((fn) => fn());
};
