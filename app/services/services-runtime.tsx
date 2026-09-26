'use client';

import AgRuntime from '@/components/AgRuntime';
import { SERVICES_MODULES } from './modules';

/** Client boundary for the Services page's behaviour modules. Keeps
 *  page.tsx a Server Component: only this wrapper ships to the client,
 *  not the markup. */
export default function ServicesRuntime() {
  return <AgRuntime modules={SERVICES_MODULES} />;
}
