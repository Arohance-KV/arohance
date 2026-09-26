'use client';

import AgRuntime from '@/components/AgRuntime';
import { CAREERS_MODULES } from './modules';

/** Client boundary for the Careers page's behaviour modules. Keeps
 *  page.tsx a Server Component: only this wrapper ships to the client,
 *  not the markup. */
export default function CareersRuntime() {
  return <AgRuntime modules={CAREERS_MODULES} />;
}
