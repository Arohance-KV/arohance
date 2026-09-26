import type { Behavior } from './types';

export const cursor: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  // this.props.customCursor -> true (frozen, porting table). The cast keeps
  // the comparison's shape without tripping TS2367 ("true" and "false"
  // literal types never overlap) — see task-8-report.md for detail.
  if ((true as boolean) === false) return () => {};
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return () => {};
  // The dot is appended to document.body, not `root`: `root` has
  // `overflow-clip` and parallax-transformed descendants (see app/page.tsx),
  // either of which would clip or reposition a `position:fixed` child. The
  // original does the same, for the same reason — kept as written.
  const dot = document.createElement('div');
  dot.setAttribute('data-ag-cursor', '');
  dot.style.cssText = 'position:fixed;top:0;left:0;width:11px;height:11px;border-radius:50%;background:#F5F2ED;mix-blend-mode:difference;pointer-events:none;z-index:95;display:flex;align-items:center;justify-content:center;font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:transparent;transform:translate3d(-50%,-50%,0);transition:width .45s cubic-bezier(.16,1,.3,1),height .45s cubic-bezier(.16,1,.3,1),color .3s ease;opacity:0';
  document.body.appendChild(dot);
  let x = 0, y = 0, tx = 0, ty = 0, raf: number | null = null;
  const loop = () => {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    dot.style.transform = 'translate3d(' + (x - dot.offsetWidth / 2) + 'px,' + (y - dot.offsetHeight / 2) + 'px,0)';
    raf = requestAnimationFrame(loop);
  };
  const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; dot.style.opacity = '1'; };
  window.addEventListener('mousemove', move, { passive: true });
  raf = requestAnimationFrame(loop);
  Array.from(root.querySelectorAll<HTMLElement>('[data-cursor]')).forEach((el) => {
    const enter = () => { dot.style.width = '84px'; dot.style.height = '84px'; dot.style.color = '#F5F2ED'; dot.textContent = el.dataset.cursor || ''; };
    const leave = () => { dot.style.width = '11px'; dot.style.height = '11px'; dot.style.color = 'transparent'; dot.textContent = ''; };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    cleanups.push(() => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); });
  });
  cleanups.push(() => { window.removeEventListener('mousemove', move); if (raf) cancelAnimationFrame(raf); dot.remove(); });
  return () => cleanups.forEach((fn) => fn());
};
