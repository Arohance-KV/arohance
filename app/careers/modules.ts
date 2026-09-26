import {
  applyTheme, reveal, navCareers, shell, roles, form, type Behavior,
} from '@/lib/behaviors';

/** Careers page behaviour set, in the verified componentDidMount order from
 *  `.source/templates/careers.html` (lines 588-596):
 *  applyTheme, initReveal, initNav, initShell, initRoles, initForm.
 *
 *  Unlike every other converted page, careers' own componentDidMount never
 *  calls initParallax or initClock — confirmed by grepping the entire
 *  template for `initParallax`, `initClock`, `[data-ag-parallax]` and
 *  `[data-ag-clock]`: zero hits, and the page's one `<script
 *  type="text/x-dc">` block (lines 586-747) is the whole component, so
 *  there's nowhere else those calls could be hiding. So this list does NOT
 *  spread `SHARED` (`[applyTheme, reveal, parallax, nav, shell, clock,
 *  form]`) — that would pull in two behaviours careers never mounted and
 *  has no matching markup for. Built explicitly instead, keeping only what
 *  careers' own source actually calls, in that order, plus:
 *   - `navCareers` in place of `nav` for `initNav` (Ruling, fix round 1):
 *     careers' bespoke `initNav` does padding/logo-height/CTA-toggle only
 *     and never touches `<button>`. The shared `nav.ts` also loops over
 *     every nav `<button>` setting inline `background`/`color` — careers'
 *     menu button's values already match, but the write is inline, and an
 *     inline style beats the button's own `hover:bg-[var(--ag-accent,...)]`
 *     class regardless of specificity. Composing `nav` in would silently
 *     kill that hover after the first scroll event, a behaviour careers'
 *     original never had. So careers gets a verbatim port of its own
 *     `initNav` (`navCareers.ts`) instead of `nav` plus a delta module —
 *     `nav` is dropped from this list entirely. See `navCareers.ts` for
 *     the full reasoning and diff.
 *   - `roles` in place of `initRoles`, also folding in `applyPay` (ported
 *     always-on per Ruling 2 — see `roles.ts`).
 *
 *  `fanPointer` was checked too: careers.html has no reference to it at
 *  all, not even a dead method definition (unlike services/about) — and it
 *  cannot appear here regardless, since it was deleted from `lib/behaviors`
 *  entirely in Task 8.
 *
 *  Must stay a module-level constant: AgRuntime's effect deps are
 *  [modules], so a fresh array each render would remount every behaviour. */
export const CAREERS_MODULES: Behavior[] = [
  applyTheme, reveal, navCareers, shell, roles, form,
];
