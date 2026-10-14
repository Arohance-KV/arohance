import type { Behavior } from './types';

/**
 * `<video data-ag-autoplay>`: muted, looped clips that only play while on
 * screen, so a gallery of them isn't streaming every file at once. Under
 * reduced motion they stay paused and get native controls instead. A
 * `[data-ag-sound]` toggle button beside a clip turns its sound on and off.
 */
export const autoplay: Behavior = (root) => {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-ag-autoplay]'));
  if (!videos.length) return () => {};
  const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-ag-sound]')).map((b) => {
    const v = b.parentElement?.querySelector('video');
    const flip = () => {
      if (!v) return;
      v.muted = !v.muted;
      b.setAttribute('aria-pressed', String(!v.muted));
      if (!v.muted) v.play().catch(() => {});
    };
    b.addEventListener('click', flip);
    return () => b.removeEventListener('click', flip);
  });
  const untoggle = () => toggles.forEach((fn) => fn());
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    videos.forEach((v) => { v.controls = true; });
    return untoggle;
  }
  const io = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    const v = target as HTMLVideoElement;
    if (isIntersecting) v.play().catch(() => {});
    else v.pause();
  }), { rootMargin: '200px 0px' });
  // React doesn't reliably render `muted` into server HTML, and browsers only autoplay muted video.
  videos.forEach((v) => { v.muted = true; io.observe(v); });
  return () => { io.disconnect(); untoggle(); };
};
