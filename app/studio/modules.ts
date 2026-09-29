import {
  applyTheme, reveal, parallax, cursor, clock,
  shellMinimal, navOnDark, hoverLift, text, type Behavior,
} from '@/lib/behaviors';

/** Studio page behaviour set, in the verified componentDidMount order from
 *  `.source/templates/studio.html` (lines 524-622). Unlike every page
 *  converted before it, Studio's componentDidMount never splits its logic
 *  into `initX()` methods (aside from `applyTheme`/`shell`, which every
 *  page keeps as separate methods) — everything else is inlined directly,
 *  so this list is built by identifying each logical block in that one
 *  body, in the order it runs, not by lifting named methods:
 *
 *   1. `this.applyTheme()`               -> `applyTheme` (unmodified, reused)
 *   2. `this.shell()`                    -> `shellMinimal` (page-specific port,
 *      NOT `shell.ts` — see shellMinimal.ts: Studio's own `shell()` never
 *      wires a close-on-link-click listener over the overlay's anchors,
 *      which `shell.ts` (ported from home) does. Confirmed byte-identical
 *      to Case Study's and Contact's own `shell()`.)
 *   3. reveal setup + IntersectionObserver -> `reveal` (unmodified, reused
 *      — same rootMargin/threshold/1600ms guard, and the frozen "Expressive"
 *      P values {y:46,d:1100,a:96} match `MOTION` exactly)
 *   4. the fused parallax+nav scroll handler, split into two independent
 *      Behaviors matching how this codebase already treats them elsewhere:
 *      - the `px.forEach(...)` half                 -> `parallax` (unmodified,
 *        reused — identical transform formula and 0.3 fallback)
 *      - the `if (nav) {...}` half                  -> `navOnDark`
 *        (page-specific port, NOT `nav.ts` — Studio's nav reads the
 *        `darks`/`onDark` computation live to recolour every nav button;
 *        `nav.ts` hardcodes the resting colour and drops that computation
 *        as dead code, which is only correct for the homepage. See
 *        navOnDark.ts and Ruling 1.)
 *   5. the `[data-hover-group]` mouseenter/mouseleave loop -> `hoverLift`
 *      (page-specific port, NOT `hovers.ts` — Studio shifts the title 12px
 *      on hover; `hovers.ts` (verified against home/about/services) uses
 *      10px. See hoverLift.ts.)
 *   6. the custom-cursor block (`this.props.customCursor !== false...`)
 *      -> `cursor` (unmodified, reused — same guard, same 11px/84px dot,
 *      same enter/leave labelling; the only textual differences from
 *      cursor.ts — an added `data-ag-cursor` marker attribute, a redundant
 *      declarative `-50%,-50%` initial transform overwritten on the first
 *      animation frame regardless, and an implicit vs explicit `ease`
 *      timing keyword — have no observable effect)
 *   7. the `[data-ag-clock]` interval -> `clock` (unmodified, reused —
 *      identical Intl options and 'IST' suffix)
 *
 *  Studio has NO form (Task 13 fix round 1, re-confirmed): grepped the
 *  whole template for `data-ag-form`, `data-ag-submit`, `<form` and
 *  `submit` — zero hits for all four, neither a call site nor a markup
 *  element nor even a "Thanks" success string (unlike Case Study, which
 *  has a dead call site with no markup — see case-study/modules.ts). So
 *  `form`/`makeForm` is not in this list at all, not even dormant —
 *  confirmed this was already correct in the original submission, not a
 *  fix made this round.
 *
 *  Confirmed absent from Studio's source entirely (zero grep hits for the
 *  method name or its target data-attribute): `initServices`/`data-svc`,
 *  `initMagnet`/`data-ag-magnet`, `initEther`/`data-ag-ether`,
 *  `initStroke`/`data-ag-stroke`, `initReel`/`data-vt-`,
 *  `initTrail`/`data-ag-trail`, `initVideo`/`data-ag-lightbox`,
 *  `initFlags`, `FanPointer`/`data-ag-fan`, `initRoles`/`data-role`. So
 *  this list does not spread `SHARED` (which would pull in `nav` and
 *  `form`, neither ported nor matching Studio's own nav) and does not
 *  import `services`, `magnet`, `ether`, `stroke`, `reel`, `trail`,
 *  `video`, `flags`, or `roles` at all.
 *
 *  `text` (last, not in the original) runs the heading and eyebrow entrances,
 *  lib/behaviors/text.ts.
 *  Must stay a module-level constant: AgRuntime's effect deps are
 *  [modules], so a fresh array each render would remount every behaviour. */
export const STUDIO_MODULES: Behavior[] = [
  applyTheme, shellMinimal, reveal, parallax, navOnDark, hoverLift, cursor, clock, text,
];
