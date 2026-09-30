'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { lockScroll, reveal, settled, tween, wait } from '@/lib/curtain';

const WORDS = ['Design', 'Shoot', 'Engineer'];
/** The counter can't reach 100 sooner than MIN_MS, and stops waiting on assets at MAX_MS. */
const MIN_MS = 2400, MAX_MS = 8000;
const wordAt = (n: number) => (n <= 33 ? 0 : n <= 66 ? 1 : 2);

/**
 * The home entrance (docs/superpowers/specs/2026-09-30-page-transitions-design.md):
 * one word at a time over a 000→100 counter that follows real loading (fonts,
 * the page's eager images, window load), then the screen slides up. Rendered
 * covering; app/layout.tsx's head script hides it before first paint unless
 * this tab's visit started here, and the root element's own
 * `[data-intro-seen]` variant keeps it hidden after.
 */
export default function Intro() {
  const box = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute('data-ag-failsafe')) { html.setAttribute('data-intro-seen', ''); return; } // failsafe already fired: never plays, stays hidden once PageTransition clears the attribute
    if (html.hasAttribute('data-intro-seen')) return;
    const el = box.current!, counter = count.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    lockScroll(true);

    const assets: Promise<unknown>[] = [
      document.fonts.ready,
      document.readyState === 'complete' ? Promise.resolve() : new Promise((done) => addEventListener('load', done, { once: true })),
      ...Array.from(document.querySelectorAll<HTMLImageElement>('[data-ag-root] img'))
        .filter((img) => img.loading !== 'lazy')
        .map(settled),
    ];
    let loaded = 0;
    assets.forEach((a) => a.then(() => { loaded++; }));

    let dead = false, raf = 0, shown = 0, current = 0;
    const start = performance.now();

    const swap = (to: number) => {
      const out = words.current[current]!, next = words.current[to]!;
      current = to;
      if (reduce) { out.style.transform = 'translateY(110%)'; next.style.transform = 'none'; return; }
      tween(out, [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], 500);
      tween(next, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 500);
    };
    const finish = async () => {
      await wait(200);
      reveal();
      lockScroll(false); // right after reveal(), not after the slide: the page is already visible, so unlock while still covered by the intro
      await (reduce
        ? tween(el, [{ opacity: 1 }, { opacity: 0 }], 200)
        : tween(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], 900));
      html.setAttribute('data-intro-seen', '');
    };
    const tick = (now: number) => {
      if (dead) return;
      const elapsed = now - start;
      const real = elapsed >= MAX_MS ? 1 : loaded / assets.length;
      const target = Math.min(real, elapsed / MIN_MS) * 100;
      shown = target - shown < 0.5 ? Math.max(shown, target) : shown + (target - shown) * 0.08;
      const n = Math.min(real < 1 ? 99 : 100, Math.floor(shown));
      counter.textContent = String(n).padStart(3, '0');
      if (wordAt(n) !== current) swap(wordAt(n));
      if (n === 100) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { dead = true; cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={box} data-ag-intro="" aria-hidden="true" className="fixed inset-0 z-[101] flex flex-col bg-[#0C0B0A] text-[#F5F2ED] pt-4 px-[clamp(20px,4.4vw,64px)] pb-[clamp(20px,4vh,48px)] [[data-intro-seen]_&]:hidden [[data-ag-failsafe]_&]:hidden">
      <Image src="/images/93c7aab596.png" alt="" width={422} height={133} priority className="h-[46px] w-auto self-start" />
      <div className="flex-1 flex items-center">
        <span className="relative block overflow-hidden [font-family:'Archivo',sans-serif] font-bold uppercase text-[clamp(3rem,12vw,11rem)] leading-[.9] tracking-[-0.045em] [font-variation-settings:'wdth'_106]">
          <span className="invisible">{WORDS[2]}</span>
          {WORDS.map((w, i) => (
            <span key={w} ref={(s) => { words.current[i] = s; }} className="absolute left-0 top-0" style={{ transform: i ? 'translateY(110%)' : 'none' }}>{w}</span>
          ))}
        </span>
      </div>
      <span ref={count} data-intro-count="" className="self-end [font-family:'Archivo',sans-serif] font-bold text-[clamp(4rem,14vw,12rem)] leading-[.8] tracking-[-0.04em] tabular-nums">000</span>
    </div>
  );
}
