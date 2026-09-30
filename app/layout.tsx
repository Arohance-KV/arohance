import type { Metadata } from 'next';
import './globals.css';
import PageTransition from '@/components/PageTransition';
import { WORK, workHref } from '@/lib/work';

// No next/font here (Task 9 fix-round 4 reversal of the Task 2 decision):
// next/font/google defines faces under hashed internal names, reachable
// only via its CSS variables -- but the converted markup references these
// three families by their real names directly (`font-family:'Archivo',
// sans-serif` etc, 238+236+25 times across the seven pages), because
// that's exactly what the original's own CSS does. No amount of next/font
// configuration makes a hashed name answer to a literal one, so the real
// fonts, under their real names, are self-hosted via globals.css's
// @font-face rules instead (extracted verbatim from the original bundles
// by tools/unbundle.mjs). See task-9-report.md, Fix Round 4.

// Final fix wave, item 5: all seven routes used to share this one literal
// title verbatim (there was no per-route metadata at all) — every tab,
// bookmark, history entry and search result on the site was identical.
// `template` now lets each `app/**/page.tsx` supply its own short,
// content-derived title (its own `<h1>` or eyebrow label, not invented
// marketing copy — see each page's own `metadata` export) while this file
// still controls the shared site-name suffix in one place. `default` is
// used verbatim, template NOT re-applied to it, whenever a route doesn't
// define its own title — no route currently relies on that fallback (Home
// opts out of the template explicitly instead, see app/page.tsx), but it
// stays as the documented safety net for any future route that forgets to.
export const metadata: Metadata = {
  title: {
    default: 'Arohance — Tech & Marketing',
    template: '%s — Arohance',
  },
  description:
    'An independent studio for brands, products and the technology underneath them.',
};

/** The curtain's page names, built here so lib/work.ts stays out of the client bundle. */
const LABELS: Record<string, string> = {
  '/': 'Home', '/about': 'About', '/services': 'Services', '/studio': 'Studio',
  '/careers': 'Careers', '/contact': 'Contact',
  ...Object.fromEntries(WORK.map((w) => [workHref(w), w.client])),
};

/** Runs before first paint: the home entrance (components/Intro.tsx) plays on
 *  every full load of `/` (refresh, typed URL, new tab); reaching home by a
 *  link from another page gets the curtain instead. Also a
 *  failsafe for JS that boots but whose chunks never finish loading:
 *  PageTransition.tsx sets `window.agUp` at hydration, well under 10s on a
 *  working site, so this timer only ever fires when hydration didn't happen
 *  in time -- it then flags `<html>` so both overlays' `[[data-ag-failsafe]_&]:hidden`
 *  variant (in PageTransition.tsx and Intro.tsx) hides them, covering the
 *  case `<noscript>` alone doesn't: JS on, but its bundle blocked or broken. */
const INTRO_GATE =
  "if(location.pathname!=='/')document.documentElement.setAttribute('data-intro-seen','');" +
  "setTimeout(function(){if(!window.agUp)document.documentElement.setAttribute('data-ag-failsafe','')},10000);";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-ag-covered: every first load starts under an overlay (lib/curtain.ts).
    // suppressHydrationWarning: INTRO_GATE and the curtain change <html>'s attributes around hydration.
    <html lang="en" data-ag-covered="" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        <noscript dangerouslySetInnerHTML={{ __html: '<style>[data-ag-intro],[data-ag-curtain]{display:none}</style>' }} />
      </head>
      <body>
        {children}
        <PageTransition labels={LABELS} />
      </body>
    </html>
  );
}
