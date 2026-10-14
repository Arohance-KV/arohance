import Image from 'next/image';
import type { Media } from '@/lib/verticals';

/** `.mp4` as a muted looping clip (played while on screen by lib/behaviors/autoplay.ts), anything else as an image. */
export function MediaItem({ m, sizes, className, priority }: { m: Media; sizes: string; className: string; priority?: boolean }) {
  return m.src.endsWith('.mp4') ? (
    <video data-ag-autoplay="" src={m.src} width={m.w} height={m.h} style={{ aspectRatio: `${m.w} / ${m.h}` }} loop muted playsInline preload="metadata" className={`${className} object-cover`} />
  ) : (
    <Image src={m.src} alt="" width={m.w} height={m.h} sizes={sizes} priority={priority} className={className} />
  );
}

/** Sound on/off for the clip in the same positioned parent, wired in lib/behaviors/autoplay.ts; aria-pressed swaps the icon. */
export function SoundToggle({ className = 'right-5 bottom-5' }: { className?: string }) {
  return (
    <button data-ag-sound="" type="button" aria-pressed="false" aria-label="Sound" className={`group absolute ${className} w-11 h-11 border-0 rounded-full bg-[rgba(12,11,10,.6)] [backdrop-filter:blur(8px)] [-webkit-backdrop-filter:blur(8px)] text-[#F5F2ED] flex items-center justify-center cursor-pointer [transition:background_.35s_ease] hover:bg-[var(--ag-accent,#F2600C)]`}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path className="group-aria-pressed:hidden" d="m22 9-6 6m0-6 6 6" />
        <path className="hidden group-aria-pressed:block" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      </svg>
    </button>
  );
}
