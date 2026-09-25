'use client';

import { useEffect } from 'react';
import type { Behavior } from '@/lib/behaviors';

type AgRuntimeProps = {
  /**
   * The behaviour modules to mount for this page. Must be a stable
   * reference — a module-level constant (e.g. `HOME_MODULES`), never an
   * inline array literal such as `modules={[...SHARED, foo]}`.
   *
   * The effect below has a dependency array of `[modules]`. A fresh array
   * identity on every render would re-run that effect on every render too,
   * tearing down and remounting every behaviour, restarting animations and
   * churning listeners.
   */
  modules: Behavior[];
};

/**
 * Mounts a page's behaviour modules against [data-ag-root] and disposes
 * them on unmount. One effect, one pass, matching the original
 * componentDidMount / componentWillUnmount pair.
 */
export default function AgRuntime({ modules }: AgRuntimeProps) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-ag-root]');
    if (!root) return;
    const disposers = modules.map((m) => m(root));
    return () => disposers.forEach((d) => {
      try { d(); } catch { /* isolate: one bad disposer must not strand the rest */ }
    });
  }, [modules]);

  return null;
}
