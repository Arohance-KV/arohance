import type { Behavior } from './types';

/**
 * Form-submit handler factory. Every page's own source runs the identical
 * sequence — `preventDefault`, find `[data-ag-submit]`, set its text/color,
 * disable it — and differs from every other page in exactly one datum: the
 * confirmation message. That is parameterising a literal, not a behaviour,
 * so one factory replaces what would otherwise be near-duplicate modules
 * (unlike the nav variants, which differ in actual statements/listeners and
 * so are genuinely separate modules — see navOnDark.ts / navPad.ts).
 *
 * Confirmed per page (grepped each template's own `btn.textContent =`
 * line directly, not assumed from another page's copy):
 *   - home, about, services, case-study: "Thanks — we reply within a day"
 *   - careers:  "Thanks, we reply within a week"
 *   - contact:  "Thanks — we reply within a working day"
 *   - studio:   no `data-ag-form`/`data-ag-submit`/`<form` anywhere in the
 *     template at all — no message, because there is no form. `form`/
 *     `makeForm` is not mounted on Studio at all (see studio/modules.ts).
 * Source escapes the em dash as `—`; the ported string below uses a
 * literal '—' — same rendered character, different source bytes (Task 5).
 */
export const makeForm = (message: string): Behavior => (root) => {
  const cleanups: (() => void)[] = [];
  const el = root.querySelector<HTMLFormElement>('[data-ag-form]');
  if (!el) return () => {};
  // Posts the fields to app/api/contact/route.ts, which emails them to
  // info@arohance.com. The confirmation only shows once that succeeds.
  const onSubmit = async (e: Event) => {
    e.preventDefault();
    const btn = el.querySelector<HTMLButtonElement>('[data-ag-submit]');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    const res = await fetch('/api/contact', { method: 'POST', body: new FormData(el) }).catch(() => null);
    if (res?.ok) {
      btn.textContent = message;
      btn.style.color = 'var(--ag-accent,#F2600C)';
    } else {
      btn.textContent = 'Couldn’t send, email info@arohance.com';
      btn.disabled = false;
    }
  };
  el.addEventListener('submit', onSubmit);
  cleanups.push(() => el.removeEventListener('submit', onSubmit));
  return () => cleanups.forEach((fn) => fn());
};

/** The default instance: home/about/services/case-study's shared copy.
 *  Created once at module load, so every page that imports `form` (whether
 *  directly or via `SHARED`) gets the same stable function reference —
 *  required by `AgRuntime`'s `[modules]` dependency array. */
export const form: Behavior = makeForm('Thanks — we reply within a day');
