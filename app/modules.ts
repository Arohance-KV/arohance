import { SHARED, type Behavior } from '@/lib/behaviors';

/** Homepage behaviour set. Task 8 appends the page-specific effects.
 *  Must stay a module-level constant: AgRuntime's effect deps are [modules],
 *  so a fresh array each render would remount every behaviour. */
export const HOME_MODULES: Behavior[] = [...SHARED];
