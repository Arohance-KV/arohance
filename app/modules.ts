import {
  SHARED, services, hovers, cursor, flags, video, ether, magnet,
  stroke, reel, trail, fanPointer, type Behavior,
} from '@/lib/behaviors';

/** Homepage behaviour set: SHARED plus the page-specific effects, in the
 *  verified original componentDidMount order (see task-8-report.md).
 *  `fanPointer` has no call site in the source componentDidMount at all
 *  (dead code there) but is included per explicit task instruction; it is a
 *  guaranteed no-op since [data-ag-fan] does not exist in the markup either.
 *  Must stay a module-level constant: AgRuntime's effect deps are [modules],
 *  so a fresh array each render would remount every behaviour. */
export const HOME_MODULES: Behavior[] = [
  ...SHARED, services, hovers, cursor, flags, video,
  ether, magnet, stroke, reel, trail, fanPointer,
];
