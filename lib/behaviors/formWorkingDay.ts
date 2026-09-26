import type { Behavior } from './types';

/**
 * Contact's own form-submit handler. Structurally identical to `form.ts`
 * except for the confirmation message text: Contact's copy reads "Thanks
 * — we reply within a **working** day" (`.source/templates/contact.html:
 * 487-496`), matching the promise already made in the page's own intro
 * paragraph ("we'll come back within a working day with either a plan or
 * an honest no"). `form.ts` hardcodes "Thanks — we reply within a day"
 * (no "working") — verified as the right text for Home/About/Services,
 * all three grepped directly and all say "a day", not "a working day".
 * Reusing `form.ts` on Contact would show the wrong confirmation message.
 *
 * (Careers' own copy differs a third way — "Thanks, we reply within a
 * week" — which is notable because Careers' shipped page does NOT show
 * that text: `app/careers/modules.ts` composes the shared `form.ts`
 * instead of a page-specific port, so Careers currently displays "Thanks
 * — we reply within a day" on submit, not its own source's "a week".
 * Careers is out of this task's scope and untouched here — flagged in
 * task-13-report.md instead, per instructions not to modify other pages
 * or existing behaviour modules.)
 */
export const formWorkingDay: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const el = root.querySelector<HTMLFormElement>('[data-ag-form]');
  if (!el) return () => {};
  const onSubmit = (e: Event) => {
    e.preventDefault();
    const btn = el.querySelector<HTMLButtonElement>('[data-ag-submit]');
    if (!btn) return;
    btn.textContent = 'Thanks — we reply within a working day';
    btn.style.color = 'var(--ag-accent,#F2600C)';
    btn.disabled = true;
  };
  el.addEventListener('submit', onSubmit);
  cleanups.push(() => el.removeEventListener('submit', onSubmit));
  return () => cleanups.forEach((fn) => fn());
};
