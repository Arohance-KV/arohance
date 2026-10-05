import {
  SHARED, services, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, trail, text, stream, type Behavior,
} from '@/lib/behaviors';

/** Services page behaviour set: SHARED plus the page-specific effects, in
 *  the verified componentDidMount order from
 *  `.source/templates/services.html` (lines 673-692):
 *  applyTheme, initReveal, initParallax, initNav, initServices, initHovers,
 *  initCursor, initClock, initForm, initFlags, initVideo, initShell,
 *  initEther, initMagnet, initStroke, initReel, initTrail.
 *  Filtering to the page-specific (non-SHARED) calls, in the order they
 *  appear, gives exactly: services, hovers, cursor, flags, video, ether,
 *  magnet, stroke, reel, trail — identical to HOME_MODULES's page-specific
 *  order (services.html carries its own `[data-ag-trail]` SVG, confirmed
 *  present in `.source/jsx/services.jsx`).
 *
 *  `fanPointer` is NOT included, and does not exist as an export: grepped
 *  the entire `.source/templates/services.html` for `FanPointer`
 *  (case-insensitive) — the only hit is `initFanPointer`'s own method
 *  definition (line 897); it has no call site in componentDidMount or
 *  anywhere else. Its target `[data-ag-fan]` appears exactly twice in the
 *  whole document (lines 899, 903), both strictly inside that same method
 *  body as querySelector argument strings — never as markup. Dead in the
 *  source in the same two independent ways as the homepage (Task 8),
 *  independently re-verified here rather than assumed from that signal.
 *  `initFanPointer` was deleted from `lib/behaviors` entirely in Task 8, so
 *  it cannot be imported regardless.
 *
 *  `text` (last, not in the original) runs the heading and eyebrow entrances,
 *  lib/behaviors/text.ts. `stream` (also new) is the Content studio rail's
 *  hover-to-centre, lib/behaviors/stream.ts.
 *  Must stay a module-level constant: AgRuntime's effect deps are
 *  [modules], so a fresh array each render would remount every behaviour. */
export const SERVICES_MODULES: Behavior[] = [
  ...SHARED, services, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, trail, text, stream,
];
