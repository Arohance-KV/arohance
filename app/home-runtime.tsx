'use client';

import AgRuntime from '@/components/AgRuntime';
import { HOME_MODULES } from './modules';

/** Client boundary for the homepage's behaviour modules. Keeps page.tsx a
 *  Server Component: only this wrapper ships to the client, not the markup. */
export default function HomeRuntime() {
  return <AgRuntime modules={HOME_MODULES} />;
}
