'use client';

import AgRuntime from '@/components/AgRuntime';
import { CASE_STUDY_MODULES } from './modules';

/** Client boundary for the Case Study page's behaviour modules. Keeps
 *  page.tsx a Server Component: only this wrapper ships to the client,
 *  not the markup. */
export default function CaseStudyRuntime() {
  return <AgRuntime modules={CASE_STUDY_MODULES} />;
}
