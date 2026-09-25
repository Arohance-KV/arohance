import { MOTION, type Behavior } from './types';

export const parallax: Behavior = (root) => {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!els.length) return () => {};
  const amp = MOTION.amp;
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      const f = parseFloat(el.dataset.parallax || '') || 0.3;
      el.style.transform = 'translate3d(0,' + (p * amp * f).toFixed(2) + 'px,0)';
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};
