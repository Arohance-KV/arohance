// Vanilla port of React Bits <StrokeText /> (GSAP outline draw + fill wipe). mount(el, opts) -> dispose()
import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

export type StrokeOpts = {
  text: string; strokeColor: string; fillColor: string; strokeWidth: number;
  drawDuration: number; fillDelay: number; stagger: number; ease: string;
  trigger: string; fillMode: string; fontSize: number; fontWeight: number;
  letterSpacing: number; fontFamily: string;
};

export function mount(root: HTMLElement, o: StrokeOpts): () => void {
  const p = Object.assign({
    text: 'Draw Attention', strokeColor: '#A78BFA', fillColor: '#F8FAFC', strokeWidth: 1.4, drawDuration: 1.6,
    fillDelay: 0.2, stagger: 0.05, ease: 'power2.out', trigger: 'mount', fillMode: 'wipe', fontSize: 128,
    fontWeight: 800, letterSpacing: -4, fontFamily: 'inherit', reverse: false, height: null
  }, o);
  const chars = Array.from(String(p.text));
  const dash = Math.max(p.fontSize * 7, 200);
  const wipeId = 'stroke-wipe-' + (++uid);
  root.innerHTML = '';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', p.text);
  root.style.display = 'block'; root.style.width = '100%'; root.style.lineHeight = '0';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.display = 'block'; svg.style.width = '100%'; svg.style.height = p.height || 'auto'; svg.style.overflow = 'visible';
  const font = (t: any) => { t.setAttribute('x', '0'); t.setAttribute('y', '0'); Object.assign(t.style, { fontSize: p.fontSize + 'px', fontWeight: p.fontWeight, letterSpacing: p.letterSpacing + 'px', fontFamily: p.fontFamily, userSelect: 'none' }); };
  const mk = (attr: any, data: any) => {
    const t = document.createElementNS(NS, 'text'); font(t);
    Object.entries(attr).forEach(([k, v]: [string, any]) => t.setAttribute(k, v));
    chars.forEach(c => { const s = document.createElementNS(NS, 'tspan'); s.setAttribute(data, ''); s.textContent = c; t.appendChild(s); });
    return t;
  };
  const stroke = mk({ fill: 'none', stroke: p.strokeColor, 'stroke-width': p.strokeWidth, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, 'data-stroke-char');
  const fill = mk({ fill: p.fillColor, stroke: 'none' }, 'data-fill-char');
  const defs = document.createElementNS(NS, 'defs');
  const clip = document.createElementNS(NS, 'clipPath'); clip.setAttribute('id', wipeId); clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
  const rect = document.createElementNS(NS, 'rect'); rect.setAttribute('width', '0');
  clip.appendChild(rect); defs.appendChild(clip);
  svg.appendChild(defs); svg.appendChild(stroke); svg.appendChild(fill);
  root.appendChild(svg);

  let box: any = null, tl: any = null, io: any = null, killed = false;
  const strokes = () => Array.from(root.querySelectorAll('[data-stroke-char]'));
  const fills = () => Array.from(root.querySelectorAll('[data-fill-char]'));
  const useWipe = p.fillMode === 'wipe', fillOn = p.fillMode !== 'none';

  const measure = () => {
    let b; try { b = stroke.getBBox(); } catch (e) { return false; }
    if (!b || !b.width) return false;
    const pad = Math.max(Number(p.strokeWidth) || 1, p.fontSize * 0.1);
    box = { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    rect.setAttribute('x', box.x); rect.setAttribute('y', box.y); rect.setAttribute('height', box.height);
    if (useWipe) fill.setAttribute('clip-path', `url(#${wipeId})`);
    return true;
  };
  const setStart = () => {
    gsap.set(strokes(), { strokeDasharray: dash, strokeDashoffset: dash });
    gsap.set(fills(), { opacity: useWipe ? 1 : 0 });
    gsap.set(rect, { attr: { width: 0 } });
  };
  const setEnd = () => {
    gsap.set(strokes(), { strokeDasharray: dash, strokeDashoffset: 0 });
    gsap.set(fills(), { opacity: fillOn ? 1 : 0 });
    gsap.set(rect, { attr: { width: fillOn ? box.width : 0 } });
  };
  const build = () => {
    setStart();
    const st: any = p.reverse ? { each: p.stagger, from: 'end' } : p.stagger;
    const fd = Math.max(0.4, p.drawDuration * 0.5);
    const t = gsap.timeline({ paused: true, repeat: p.trigger === 'loop' ? -1 : 0, repeatDelay: p.trigger === 'loop' ? 0.9 : 0 });
    t.to(strokes(), { strokeDashoffset: 0, duration: p.drawDuration, ease: p.ease, stagger: st }, 0);
    const at = p.drawDuration + p.fillDelay + (chars.length - 1) * p.stagger;
    if (useWipe) t.to(rect, { attr: { width: box.width }, duration: fd, ease: 'power2.inOut' }, at);
    else if (fillOn) t.to(fills(), { opacity: 1, duration: fd, ease: 'power2.out', stagger: st }, at);
    return t;
  };
  const play = () => { if (tl) tl.kill(); tl = build(); tl.play(0); };

  const init = () => {
    if (killed || !measure()) return;
    if ((window.matchMedia as any) && matchMedia('(prefers-reduced-motion: reduce)').matches) { setEnd(); return; }
    if (p.trigger === 'hover') { setEnd(); root.style.cursor = 'pointer'; root.addEventListener('pointerenter', play); }
    else if (p.trigger === 'scroll') {
      setStart();
      io = new IntersectionObserver(es => { if (es[0].isIntersecting) { play(); io.disconnect(); } }, { rootMargin: '0px 0px -18% 0px' });
      io.observe(root);
    } else play();
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(init));

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    killed = true; if (tl) tl.kill(); if (io) io.disconnect(); root.removeEventListener('pointerenter', play); gsap.killTweensOf([...strokes(), ...fills(), rect]);
  };
}
