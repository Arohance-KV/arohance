'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cover, lockScroll, navTarget, reveal, settled, tween, wait } from '@/lib/curtain';

/** Hold the curtain at least HOLD_MIN after it has covered, and at most HOLD_MAX after the push (ms). */
const HOLD_MIN = 300, HOLD_MAX = 4000;

/** Fonts plus the images on the current page's first screen. */
const pageReady = () =>
  Promise.all([
    document.fonts.ready,
    ...Array.from(document.querySelectorAll<HTMLImageElement>('[data-ag-root] img'))
      .filter((img) => {
        if (img.complete || !img.getClientRects().length) return false;
        const r = img.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      })
      .map(settled),
  ]);

/**
 * The orange curtain between pages (docs/superpowers/specs/2026-09-30-page-transitions-design.md).
 * Catches internal link clicks, covers the screen with the destination's
 * name, navigates underneath, and lifts once the new page is ready. Back and
 * forward stay instant. Rendered covering, so a first page load stays hidden
 * until ready too, except when the home entrance (components/Intro.tsx)
 * takes that first reveal over.
 */
export default function PageTransition({ labels }: { labels: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(labels[pathname] ?? 'Arohance');
  const panel = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const booted = useRef(false); // survives StrictMode's effect replay
  const arrival = useRef<{ path: string; done: () => void } | null>(null);

  useEffect(() => {
    const a = arrival.current;
    if (a && a.path === pathname) { arrival.current = null; a.done(); }
  }, [pathname]);

  useEffect(() => {
    const el = panel.current!, label = word.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const enter = async () => {
      el.style.visibility = 'visible';
      if (reduce) await tween(el, [{ opacity: 0 }, { opacity: 1 }], 200);
      else await Promise.all([
        tween(el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], 550),
        tween(label, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 550),
      ]);
      lockScroll(true); // after the tween(s), not before: locking only while fully covered avoids a mid-slide scrollbar reflow
    };
    const exit = async () => {
      reveal();
      lockScroll(false); // right after reveal(), not after the tween: the new page is already visible, so unlock while still covered by the curtain
      await (reduce
        ? tween(el, [{ opacity: 1 }, { opacity: 0 }], 200)
        : tween(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], 600));
      el.style.visibility = 'hidden';
    };

    if (!booted.current) {
      booted.current = true;
      (window as Window & { agUp?: boolean }).agUp = true;
      if (document.documentElement.hasAttribute('data-ag-failsafe')) {
        // JS booted late (past the layout script's 10s failsafe): whichever overlay was
        // showing already got hidden by the failsafe's CSS; just park the curtain and
        // clean up the attribute instead of running the normal first-load hold.
        el.style.visibility = 'hidden';
        reveal();
        document.documentElement.removeAttribute('data-ag-failsafe');
      } else if (!document.documentElement.hasAttribute('data-intro-seen')) el.style.visibility = 'hidden'; // the intro reveals
      else {
        lockScroll(true); // first-load boot lock: the page is already covered from SSR, so this stays up-front
        busy.current = true; // keeps a keyboard Enter on a link from starting go() while this exit() is still pending
        Promise.race([pageReady(), wait(HOLD_MAX)]).then(exit).finally(() => { busy.current = false; });
      }
    }

    const go = async (url: string) => {
      busy.current = true;
      try {
        const path = new URL(url, location.href).pathname;
        setText(labels[path] ?? 'Arohance');
        router.prefetch(url);
        cover();
        await enter();
        const arrived = new Promise<void>((done) => { arrival.current = { path, done }; });
        const start = performance.now();
        router.push(url);
        await Promise.race([arrived.then(pageReady), wait(HOLD_MAX)]);
        await wait(HOLD_MIN - (performance.now() - start));
        await exit();
      } finally {
        busy.current = false;
      }
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest('a[href]');
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = navTarget({ href: a.href, target: a.target, download: a.hasAttribute('download') }, e, location.href);
      if (!url) return;
      e.preventDefault(); // next/link skips its own navigation for a prevented click
      if (!busy.current) go(url);
    };
    // Bubble phase on <html>, not capture on document: this runs after native element
    // handlers (so a preventDefault() from e.g. lib/behaviors/verticals.ts is visible
    // here via e.defaultPrevented, and navTarget honours it) but still before React's
    // delegated handlers on document (Next hydrates into document), so next/link still
    // sees the prevented click and skips its own navigation.
    document.documentElement.addEventListener('click', onClick);
    return () => document.documentElement.removeEventListener('click', onClick);
  }, [labels, router]);

  return (
    <div ref={panel} data-ag-curtain="" aria-hidden="true" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] [[data-ag-failsafe]_&]:hidden">
      <span className="block overflow-hidden px-[clamp(20px,4.4vw,64px)] pb-[.06em]">
        <span ref={word} className="block text-center [font-family:'Archivo',sans-serif] font-bold uppercase text-[clamp(2.5rem,10vw,9rem)] leading-[.9] tracking-[-0.045em] [font-variation-settings:'wdth'_106]">{text}</span>
      </span>
    </div>
  );
}
