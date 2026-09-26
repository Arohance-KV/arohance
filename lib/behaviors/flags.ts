import type { Behavior } from './types';

/** `initFlags()` in the original is an empty method body — ported verbatim (no-op). */
export const flags: Behavior = () => {
  return () => {};
};
