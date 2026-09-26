import type { Behavior } from './types';

/**
 * Ported from `initFanPointer` in home.html. Note for the record (see
 * task-8-report.md): this method is never called from `componentDidMount`
 * in the source, and its target `[data-ag-fan]` does not appear anywhere in
 * home.html's markup or in app/page.tsx either — so this behaviour is inert
 * both in the original artifact and here (the guard below always returns
 * early). Ported and wired in anyway per explicit instruction; flagged
 * rather than dropped on my own judgement.
 */
export const fanPointer: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const fan = root.querySelector<HTMLElement>('[data-ag-fan]');
  if (!fan) return () => {};
  const vid = fan.querySelector<HTMLVideoElement>('[data-ag-flagvid]');
  if (!vid) return () => {};
  const hint = root.querySelector<HTMLElement>('[data-ag-flaghint]');
  const fallback = root.querySelector<HTMLElement>('[data-ag-fanfallback]');
  const host = fan.closest('header') || fan;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf: number | null = null, over = false, scrub: number | null = null, dur = 0;

  vid.muted = true; vid.defaultMuted = true; vid.loop = true; vid.playsInline = true; vid.autoplay = true;
  const play = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
  // `dur` is assigned here but never read again — a dead computation in the
  // original (like nav.ts's dropped darks/onDark). Ported verbatim per
  // instructions: report, don't remove on my own judgement.
  const meta = () => { dur = vid.duration || 0; };
  const live = () => {
    vid.style.mixBlendMode = 'multiply';
    vid.style.opacity = '1';
    vid.style.transition = 'opacity .8s ease,transform .9s cubic-bezier(.16,1,.3,1),filter .6s ease';
    const h = root.querySelector<HTMLElement>('[data-ag-flaghint]');
    if (h && !over) h.style.opacity = '1';
    if (fallback) { fallback.style.opacity = '0'; fallback.style.pointerEvents = 'none'; }
  };
  vid.addEventListener('loadedmetadata', meta);
  vid.addEventListener('loadeddata', live);
  vid.addEventListener('playing', live);
  play();
  cleanups.push(() => { vid.removeEventListener('loadeddata', live); vid.removeEventListener('playing', live); });

  const loop = () => {
    cx += (tx - cx) * 0.075;
    cy += (ty - cy) * 0.075;
    vid.style.transform = 'translate3d(' + (cx * -26).toFixed(1) + 'px,' + (cy * -16).toFixed(1) + 'px,0) rotateY(' + (cx * 5.5).toFixed(2) + 'deg) rotateX(' + (cy * -4).toFixed(2) + 'deg) scale(' + (over ? 1.035 : 1) + ')';
    if (fallback) fallback.style.transform = 'translate3d(' + (cx * -14).toFixed(1) + 'px,' + (cy * -9).toFixed(1) + 'px,0) rotate(' + (cx * 1.4).toFixed(2) + 'deg)';
    const wantRate = over && scrub !== null ? 0.35 + scrub * 1.85 : 1;
    const rate = vid.playbackRate + (wantRate - vid.playbackRate) * 0.08;
    if (Math.abs(rate - vid.playbackRate) > 0.004) vid.playbackRate = Math.max(0.25, Math.min(2.4, rate));
    if (vid.paused && vid.readyState > 2) play();
    raf = requestAnimationFrame(loop);
  };

  const move = (e: MouseEvent) => {
    const r = host.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    const f = vid.getBoundingClientRect();
    if (over) scrub = Math.max(0, Math.min(1, (e.clientX - f.left) / f.width));
  };
  const enter = () => {
    over = true;
    vid.style.filter = 'contrast(1.04) saturate(1.06)';
    if (hint) hint.style.opacity = '0';
  };
  const leave = () => {
    over = false;
    vid.playbackRate = 1;
    vid.style.filter = 'none';
    if (hint) hint.style.opacity = '1';
    play();
  };
  const blur = () => { tx = 0; ty = 0; };

  window.addEventListener('mousemove', move, { passive: true });
  window.addEventListener('blur', blur);
  fan.addEventListener('mouseenter', enter);
  fan.addEventListener('mouseleave', leave);
  raf = requestAnimationFrame(loop);
  cleanups.push(() => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('blur', blur);
    fan.removeEventListener('mouseenter', enter);
    fan.removeEventListener('mouseleave', leave);
    vid.removeEventListener('loadedmetadata', meta);
    if (raf) cancelAnimationFrame(raf);
  });
  return () => cleanups.forEach((fn) => fn());
};
