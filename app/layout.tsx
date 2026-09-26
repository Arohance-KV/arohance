import type { Metadata } from 'next';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Arohance — Tech & Marketing',
  description:
    'An independent studio for brands, products and the technology underneath them.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
