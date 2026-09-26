'use client';

import AgRuntime from '@/components/AgRuntime';
import { CONTACT_MODULES } from './modules';

/** Client boundary for the Contact page's behaviour modules. Keeps
 *  page.tsx a Server Component: only this wrapper ships to the client,
 *  not the markup. */
export default function ContactRuntime() {
  return <AgRuntime modules={CONTACT_MODULES} />;
}
