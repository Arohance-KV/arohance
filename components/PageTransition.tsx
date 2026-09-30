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
      .filter((img) => !img.complete && img.getBoundingClientRect().top < innerHeight)
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

    const enter = () => {
      el.style.visibility = 'visible';
      lockScroll(true);
      return reduce
        ? tween(el, [{ opacity: 0 }, { opacity: 1 }], 200)
        : Promise.all([
            tween(el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], 550),
            tween(label, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 550),
          ]);
    };
    const exit = async () => {
      reveal();
      await (reduce
        ? tween(el, [{ opacity: 1 }, { opacity: 0 }], 200)
        : tween(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], 600));
      el.style.visibility = 'hidden';
      lockScroll(false);
    };

    if (!booted.current) {
      booted.current = true;
      if (!document.documentElement.hasAttribute('data-intro-seen')) el.style.visibility = 'hidden'; // the intro reveals
      else { lockScroll(true); Promise.race([pageReady(), wait(HOLD_MAX)]).then(exit); }
    }

    const go = async (url: string) => {
      busy.current = true;
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
      busy.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest('a[href]');
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = navTarget({ href: a.href, target: a.target, download: a.hasAttribute('download') }, e, location.href);
      if (!url) return;
      e.preventDefault(); // next/link skips its own navigation for a prevented click
      if (!busy.current) go(url);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [labels, router]);

  return (
    <div ref={panel} data-ag-curtain="" aria-hidden="true" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A]">
      <span className="block overflow-hidden px-[clamp(20px,4.4vw,64px)] pb-[.06em]">
        <span ref={word} className="block text-center [font-family:'Archivo',sans-serif] font-bold uppercase text-[clamp(2.5rem,10vw,9rem)] leading-[.9] tracking-[-0.045em] [font-variation-settings:'wdth'_106]">{text}</span>
      </span>
    </div>
  );
}
