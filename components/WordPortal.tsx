'use client';

import { useEffect, useState, type ReactNode } from 'react';
import GlyphPortal from '@/components/ui/glyph-portal';

const FONT = "'Archivo', sans-serif";
const WEIGHT = 800;

type WordPortalProps = {
  word: string;
  /** The caption's skip link, straight to `children`. */
  enterLabel: string;
  /** The opening frame, around the word. Position against `--gp-word-top` / `--gp-word-bottom`. */
  front: ReactNode;
  /** What the camera lands in, over the accent field. */
  children: ReactNode;
};

/** GlyphPortal in the site's type and colours: the camera dives through a
 *  letter of `word` into the accent field. About ("Our story").
 *
 *  GlyphPortal freezes whichever face is loaded when it mounts, and stays
 *  static for good if that face is still pending — which Archivo can be on a
 *  hard load (globals.css self-hosts it, `font-display: swap`). So it is
 *  remounted once Archivo is ready.
 *
 *  `background={false}`, not undefined: skips the component's default green
 *  gradient, leaving the field plain `--gp-field`. Paper is transparent so
 *  the page's own background shows behind the word. */
export default function WordPortal({ word, enterLabel, front, children }: WordPortalProps) {
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts.load(`${WEIGHT} 100px ${FONT}`, word).then(() => { if (live) setFontReady(true); });
    return () => { live = false; };
  }, [word]);

  return (
    <GlyphPortal
      key={fontReady ? 'archivo' : 'pending'}
      word={word}
      fontFamily={FONT}
      fontWeight={WEIGHT}
      enterLabel={enterLabel}
      front={front}
      background={false}
      className="ag-portal"
      style={{
        '--gp-paper': 'transparent',
        '--gp-ink': '#8C877E',
        '--gp-field': 'var(--ag-accent,#F2600C)',
        '--gp-foreground': '#0C0B0A',
        // Inline, not Tailwind: the component's own rules are unlayered, so
        // they beat utility classes. Gives its caption the site's mono label.
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: 'uppercase',
        letterSpacing: '.14em',
      }}
    >
      {children}
    </GlyphPortal>
  );
}
