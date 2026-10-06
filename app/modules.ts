import {
  SHARED, services, verticals, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, trail, zoom, text, stream, roll, type Behavior,
} from '@/lib/behaviors';

/** Homepage behaviour set: SHARED plus the page-specific effects, in the
 *  verified original componentDidMount order (see task-8-report.md).
 *  `initFanPointer` was deliberately dropped (fix round 1): it has no call
 *  site anywhere in the source componentDidMount, and its target
 *  `[data-ag-fan]` does not appear in home.html's markup either — dead in
 *  the original in two independent ways, same category as nav.ts's dropped
 *  darks/onDark computation.
 *  Content update: `verticals` (not in the original) drives the new "Five
 *  verticals" rows. `services` stays although its section, What we do
 *  (originally (04)), is commented out in page.tsx: it no-ops without
 *  `[data-ag-services]`, and uncommenting the section then needs no change
 *  here. `zoom` (also new) drives the Selected work header dive.
 *  `text` (last, not in the original) runs the heading and eyebrow entrances,
 *  lib/behaviors/text.ts. `stream` (also new) is the Content studio rail's
 *  hover-to-centre, lib/behaviors/stream.ts. `roll` (also new) rolls the
 *  letters of the hero and Contact headings, lib/behaviors/roll.ts.
 *  Must stay a module-level constant: AgRuntime's effect deps are [modules],
 *  so a fresh array each render would remount every behaviour. */
export const HOME_MODULES: Behavior[] = [
  ...SHARED, services, verticals, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, trail, zoom, text, stream, roll,
];