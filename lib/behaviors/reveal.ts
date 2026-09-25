import { MOTION, type Behavior } from './types';

export const reveal: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const { y, dur } = MOTION;
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!('IntersectionObserver' in window) || document.visibilityState !== 'visible') {
    return () => {};
  }
  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0,' + y + 'px,0)';
    el.style.transition =
      'opacity ' + dur + 'ms cubic-bezier(.16,1,.3,1), transform ' + dur + 'ms cubic-bezier(.16,1,.3,1)';
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0,0,0)';
        }, delay);
        io.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  const guard = setTimeout(() => {
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }, 1600);
  cleanups.push(() => {
    io.disconnect();
    clearTimeout(guard);
  });
  return () => cleanups.forEach((fn) => fn());
};
