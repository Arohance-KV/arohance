import {
  applyTheme, reveal, parallax, cursor, clock, form,
  shellMinimal, navOnDark, hoverLift, type Behavior,
} from '@/lib/behaviors';

/** Case Study page behaviour set, in the verified componentDidMount order
 *  from `.source/templates/case-study.html` (lines 451-560). Like Studio,
 *  Case Study inlines everything in one componentDidMount body rather
 *  than splitting into `initX()` methods (aside from `applyTheme`/
 *  `shell`). A direct diff of the two pages' entire componentDidMount +
 *  shell() text (`.source/templates/studio.html:524-667` vs
 *  `case-study.html:451-605`) comes back byte-identical except for one
 *  addition — Case Study's block ends with a `data-ag-form` submit
 *  handler Studio's does not have. So this list is Studio's list, in the
 *  same order, plus `form` appended at the end:
 *
 *   1. `this.applyTheme()` -> `applyTheme` (unmodified, reused)
 *   2. `this.shell()` -> `shellMinimal` (page-specific port, NOT
 *      `shell.ts` — confirmed byte-identical to Studio's and Contact's own
 *      `shell()`, all three missing the close-on-link-click wiring
 *      `shell.ts` has. See shellMinimal.ts.)
 *   3. reveal setup -> `reveal` (unmodified, reused; same P values, same
 *      IntersectionObserver options)
 *   4. fused parallax+nav, split:
 *      - `parallax` (unmodified, reused)
 *      - `navOnDark` (page-specific port, NOT `nav.ts` — this is the
 *        pairing Ruling 1 calls out by name: Studio's and Case Study's own
 *        nav blocks are byte-identical, confirmed by direct diff, both
 *        reading the live `darks`/`onDark` computation `nav.ts` drops as
 *        dead code. See navOnDark.ts.)
 *   5. `[data-hover-group]` loop -> `hoverLift` (page-specific port, NOT
 *      `hovers.ts` — 12px title shift, confirmed byte-identical to
 *      Studio's own block, vs `hovers.ts`'s verified-10px home/about/
 *      services behaviour. See hoverLift.ts.)
 *   6. custom-cursor block -> `cursor` (unmodified, reused)
 *   7. `[data-ag-clock]` interval -> `clock` (unmodified, reused)
 *   8. `[data-ag-form]` submit handler -> `form` (unmodified, reused —
 *      see below for why this is included despite being dormant)
 *
 *  On `form`: the call site in source is real (`const form =
 *  root.querySelector('[data-ag-form]'); if (form) {...}`, textually
 *  identical to `form.ts` — same "Thanks — we reply within a day" message,
 *  confirmed by grep, unlike Contact's "a working day") but Case Study's
 *  own markup has NO `<form data-ag-form>` element anywhere (grepped
 *  `.source/templates/case-study.html` for `data-ag-form`: exactly one
 *  hit, the JS querySelector call itself — zero markup occurrences. By
 *  contrast Studio has zero hits at all — no call site, no markup — and
 *  Contact has two, one in markup and one in JS: a real, wired-up form).
 *  So in the rendered Case Study page this querySelector always resolves
 *  to null and the block never fires — the
 *  call is real but permanently dormant. Included here anyway, per
 *  Ruling 2's instruction to derive the list from what componentDidMount
 *  actually calls: the block genuinely exists in source and is textually
 *  identical to `form.ts`, so including it is a faithful port of that
 *  call site, and it is provably harmless (`form.ts`'s own `if (!el)
 *  return () => {}` guard no-ops it, identical to omitting it). Reported
 *  here for the reviewer to override if a stricter "only what can
 *  possibly run" reading is preferred.
 *
 *  Confirmed absent from Case Study's source entirely, same census as
 *  Studio: `initServices`/`data-svc`, `initMagnet`/`data-ag-magnet`,
 *  `initEther`/`data-ag-ether`, `initStroke`/`data-ag-stroke`,
 *  `initReel`/`data-vt-`, `initTrail`/`data-ag-trail`,
 *  `initVideo`/`data-ag-lightbox`, `initFlags`, `FanPointer`/`data-ag-fan`,
 *  `initRoles`/`data-role`. Does not spread `SHARED` (would pull in `nav`,
 *  wrong for this page's live onDark logic).
 *
 *  Must stay a module-level constant: AgRuntime's effect deps are
 *  [modules], so a fresh array each render would remount every behaviour. */
export const CASE_STUDY_MODULES: Behavior[] = [
  applyTheme, shellMinimal, reveal, parallax, navOnDark, hoverLift, cursor, clock, form,
];
