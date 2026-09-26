import type { Behavior } from './types';

export const hovers: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  Array.from(root.querySelectorAll<HTMLElement>('[data-hover-group]')).forEach((group) => {
    const img = group.querySelector<HTMLElement>('[data-hover-img]');
    const title = group.querySelector<HTMLElement>('[data-hover-title]');
    const enter = () => {
      if (img) img.style.scale = '1.045';
      if (title) title.style.transform = 'translate3d(10px,0,0)';
    };
    const leave = () => {
      if (img) img.style.scale = '1';
      if (title) title.style.transform = 'translate3d(0,0,0)';
    };
    if (img) img.style.transition = (img.style.transition || '') + ', scale .9s cubic-bezier(.16,1,.3,1)';
    group.addEventListener('mouseenter', enter);
    group.addEventListener('mouseleave', leave);
    cleanups.push(() => {
      group.removeEventListener('mouseenter', enter);
      group.removeEventListener('mouseleave', leave);
    });
  });
  return () => cleanups.forEach((fn) => fn());
};
