import type { Behavior } from './types';

export const services: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const wrap = root.querySelector<HTMLElement>('[data-ag-services]');
  if (!wrap) return () => {};
  const items = Array.from(wrap.querySelectorAll<HTMLElement>('[data-svc]'));
  const setOpen = (item: HTMLElement, open: boolean) => {
    const panel = item.querySelector<HTMLElement>('[data-svc-panel]');
    const sign = item.querySelector<HTMLElement>('[data-svc-sign]');
    const idx = item.querySelector<HTMLElement>('[data-svc-idx]');
    if (panel) { panel.style.gridTemplateRows = open ? '1fr' : '0fr'; panel.style.opacity = open ? '1' : '0'; }
    if (sign) sign.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
    if (idx) idx.style.color = open ? 'var(--ag-accent,#F2600C)' : '#8C877E';
  };
  items.forEach((item, i) => {
    const head = item.querySelector<HTMLElement>('[data-svc-head]');
    setOpen(item, i === 0);
    if (!head) return;
    const onClick = () => {
      const panel = item.querySelector<HTMLElement>('[data-svc-panel]');
      const isOpen = panel && panel.style.gridTemplateRows === '1fr';
      items.forEach((other) => setOpen(other, false));
      setOpen(item, !isOpen);
    };
    head.addEventListener('click', onClick);
    cleanups.push(() => head.removeEventListener('click', onClick));
  });
  return () => cleanups.forEach((fn) => fn());
};
