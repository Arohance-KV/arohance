import type { Behavior } from './types';

/**
 * Open-roles accordion and pay-range display, ported from careers' own
 * `initRoles` and `applyPay` in `.source/templates/careers.html` (lines
 * 701-728 and 605-609 respectively). The accordion is structurally
 * identical to `services.ts`'s `[data-svc]` handling, applied here to
 * `[data-role]`.
 *
 * `applyPay` was gated on the frozen prop `showPay`, which never varied
 * from `true` (Ruling 2): the `show` conditional is deleted and every
 * `[data-pay]` element is unconditionally shown (`display = ''`, the
 * source's `show ? '' : 'none'` with `show` fixed `true`). That's one
 * inline-style assignment, not a listener, so it needs no cleanup and runs
 * before the accordion wiring below (matching `applyPay` being called from
 * `applyTheme`, itself called before `initRoles`, in the original
 * `componentDidMount`).
 */
export const roles: Behavior = (root) => {
  const cleanups: (() => void)[] = [];

  Array.from(root.querySelectorAll<HTMLElement>('[data-pay]')).forEach((el) => {
    el.style.display = '';
  });

  const wrap = root.querySelector<HTMLElement>('[data-ag-roles]');
  if (!wrap) return () => cleanups.forEach((fn) => fn());

  const items = Array.from(wrap.querySelectorAll<HTMLElement>('[data-role]'));
  const setOpen = (item: HTMLElement, open: boolean) => {
    const panel = item.querySelector<HTMLElement>('[data-role-panel]');
    const sign = item.querySelector<HTMLElement>('[data-role-sign]');
    const idx = item.querySelector<HTMLElement>('[data-role-idx]');
    if (panel) {
      panel.style.gridTemplateRows = open ? '1fr' : '0fr';
      panel.style.opacity = open ? '1' : '0';
    }
    if (sign) sign.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
    if (idx) idx.style.color = open ? 'var(--ag-accent,#F2600C)' : '#8C877E';
  };
  items.forEach((item, i) => {
    setOpen(item, i === 0);
    const head = item.querySelector<HTMLElement>('[data-role-head]');
    if (!head) return;
    const onClick = () => {
      const panel = item.querySelector<HTMLElement>('[data-role-panel]');
      const isOpen = panel?.style.gridTemplateRows === '1fr';
      items.forEach((other) => setOpen(other, false));
      setOpen(item, !isOpen);
    };
    head.addEventListener('click', onClick);
    cleanups.push(() => head.removeEventListener('click', onClick));
  });

  const count = root.querySelector<HTMLElement>('[data-ag-count]');
  if (count) count.textContent = items.length + ' roles open';

  return () => cleanups.forEach((fn) => fn());
};
