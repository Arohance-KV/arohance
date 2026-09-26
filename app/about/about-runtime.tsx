'use client';

import AgRuntime from '@/components/AgRuntime';
import { ABOUT_MODULES } from './modules';

/** Client boundary for the About page's behaviour modules. Keeps page.tsx
 *  a Server Component: only this wrapper ships to the client, not the
 *  markup. */
export default function AboutRuntime() {
  return <AgRuntime modules={ABOUT_MODULES} />;
}
