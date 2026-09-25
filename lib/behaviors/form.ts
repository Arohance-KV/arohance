import type { Behavior } from './types';

export const form: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const el = root.querySelector<HTMLFormElement>('[data-ag-form]');
  if (!el) return () => {};
  const onSubmit = (e: Event) => {
    e.preventDefault();
    const btn = el.querySelector<HTMLButtonElement>('[data-ag-submit]');
    if (!btn) return;
    btn.textContent = 'Thanks — we reply within a day';
    btn.style.color = 'var(--ag-accent,#F2600C)';
    btn.disabled = true;
  };
  el.addEventListener('submit', onSubmit);
  cleanups.push(() => el.removeEventListener('submit', onSubmit));
  return () => cleanups.forEach((fn) => fn());
};
