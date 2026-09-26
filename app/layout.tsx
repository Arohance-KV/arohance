import type { Metadata } from 'next';
import { Archivo, Instrument_Sans } from 'next/font/google';
import './globals.css';

// The original's Archivo @font-face declares `font-weight: 100 900` and
// `font-stretch: 62% 125%` -- a variable font with both a weight and a
// width (`wdth`) axis, and the design applies `font-variation-settings:
// 'wdth' 100/104/106` in 36 places across all seven pages. Requesting an
// explicit `weight` array (as this used to) makes next/font/google serve
// static per-weight instances, which have no `wdth` axis at all, so every
// one of those 36 declarations was silently inert. Omitting `weight`
// entirely requests the variable font, and `axes: ['wdth']` adds the
// width axis alongside it.
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arohance — Tech & Marketing',
  description:
    'An independent studio for brands, products and the technology underneath them.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
