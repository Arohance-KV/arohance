import type { Behavior } from './types';

export const clock: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const el = root.querySelector<HTMLElement>('[data-ag-clock]');
  if (!el) return () => {};
  const tick = () => {
    try {
      const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
      el.textContent = t + ' IST';
    } catch (e) { el.textContent = new Date().toLocaleTimeString(); }
  };
  tick();
  const id = setInterval(tick, 1000);
  cleanups.push(() => clearInterval(id));
  return () => cleanups.forEach((fn) => fn());
};
