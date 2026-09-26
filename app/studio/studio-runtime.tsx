'use client';

import AgRuntime from '@/components/AgRuntime';
import { STUDIO_MODULES } from './modules';

/** Client boundary for the Studio page's behaviour modules. Keeps
 *  page.tsx a Server Component: only this wrapper ships to the client,
 *  not the markup. */
export default function StudioRuntime() {
  return <AgRuntime modules={STUDIO_MODULES} />;
}
