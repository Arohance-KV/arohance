import Image from 'next/image';
import Link from 'next/link';
import { WORK, workHref } from '@/lib/work';

/**
 * Selected work beside the menu, shown whenever the burger opens the overlay
 * (lib/behaviors/shell.ts and shellMinimal.ts). It keeps the
 * `data-ag-news-panel` hook those behaviours look for from when it held
 * studio news.
 *
 * Link colours: globals.css's unlayered `a { color: inherit }` beats any
 * text-* utility on an <a>, so the button's dark text needs `!`.
 */
export default function WorksPanel() {
  return (
    <div data-ag-news-panel="" className="[flex:0_1_min(100%,430px)] flex flex-col gap-3 opacity-[0] [transform:translate3d(28px,0,0)] [transition:opacity_.5s_ease,transform_.6s_cubic-bezier(.16,1,.3,1)] pointer-events-none max-lg:w-full max-lg:flex-none">
      {WORK.slice(0, 3).map((w) => (
        <Link key={w.slug} href={workHref(w)} className="flex gap-4 justify-between bg-[#1F1E1C] rounded-[16px] pt-[18px] px-[18px] pb-3.5 [transition:background_.35s_ease] hover:bg-[#2A2825]">
          <div className="flex flex-col justify-between gap-[18px] min-w-0">
            <div>
              <div className="flex items-baseline gap-[7px] [font-family:'Archivo',sans-serif] font-bold text-[16px] tracking-[-0.01em]"><span>{w.client}</span><span className="text-[var(--ag-accent,#F2600C)]">→</span></div>
              <p className="mt-2 mx-0 mb-0 text-[13.5px] leading-[1.45] text-[#B7B1A6] line-clamp-2">{w.summary}</p>
            </div>
            <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B]">({w.tags})</div>
          </div>
          <Image src={w.image.src} alt="" width={w.image.width} height={w.image.height} sizes="84px" className="[flex:0_0_auto] w-[84px] h-[84px] rounded-[13px] object-cover" />
        </Link>
      ))}
      <Link href="/#work" className="flex items-center justify-between gap-4 bg-[#F5F2ED] text-[#0A0A0A]! rounded-[16px] py-4 px-5 [font-family:'Archivo',sans-serif] font-semibold text-[16px] [transition:background_.35s_ease] hover:bg-[var(--ag-accent,#F2600C)]">View more works <span aria-hidden="true">→</span></Link>
    </div>
  );
}
