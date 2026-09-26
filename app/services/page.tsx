// Generated + hand-augmented — read before editing.
//
// Starting point: `tools/convert.mjs services` (parses
// `.source/templates/services.html`, rewrites inline styles to Tailwind
// classes) -> `.source/jsx/services.jsx`, hand-merged into this file once
// (swapping `<img>` for `next/image`; the converter already emits
// `next/link`'s `<Link>` for internal anchors, so that part needed no
// manual swap; wiring up `ServicesRuntime`). Since that merge, 26 `max-lg:`
// responsive classes were hand-added directly in this file during the
// mobile responsive pass — `tools/convert.mjs` does not produce these and
// has no notion of a breakpoint at all.
//
// A wrong class string is a converter bug: fix `tools/tw.mjs`, not the
// string here. Do NOT "fix" a class by regenerating and pasting over this
// file — that silently deletes all 26 `max-lg:` classes, this page goes
// back to desktop-only, and neither `tools/compare.mjs` (checks 1440 only)
// nor a passing build says anything. See README.md, "Changing the
// converter", for the actual procedure.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import ServicesRuntime from './services-runtime';

// Derived from this page's own eyebrow ("+ (Services)") and h1 ("Six
// Disciplines. One Room.") — not invented marketing copy. `%s — Arohance`
// (root layout).
export const metadata: Metadata = {
  title: 'Six Disciplines, One Room',
};

export default function Services() {
  return (
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">
<svg data-ag-trail="" aria-hidden="true" className="absolute left-0 top-0 w-full h-full z-[0] pointer-events-none overflow-visible"><path data-ag-trail-ghost="" fill="none" stroke="rgba(245,242,237,.07)" strokeWidth="2" strokeLinecap="round"></path><path data-ag-trail-line="" fill="none" stroke="var(--ag-accent,#F2600C)" strokeWidth="2.4" strokeLinecap="round"></path><circle data-ag-trail-dot="" r="6" fill="var(--ag-accent,#F2600C)"></circle><circle data-ag-trail-halo="" r="18" fill="none" stroke="var(--ag-accent,#F2600C)" strokeOpacity=".35" strokeWidth="1.5"></circle></svg>

<nav data-ag-nav="" className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]">
  <a href="#top" className="flex items-center"><Image data-ag-logo="" src="/images/93c7aab596.png" alt="Arohance, Tech &amp; Marketing" width={422} height={133} priority className="h-[46px] w-auto block [filter:none] [transition:filter_.45s_ease,height_.45s_ease]" /></a>
  <div className="flex items-center gap-2.5">
    <button data-ag-news-btn="" type="button" aria-label="Studio news" className="w-[46px] h-[46px] border-0 rounded-[15px] bg-[#1F1E1C] text-[#EDE9E1] flex items-center justify-center cursor-pointer shadow-[0_10px_26px_rgba(0,0,0,.5)] [transition:background_.35s_ease,transform_.5s_cubic-bezier(.16,1,.3,1)] hover:bg-[var(--ag-accent,#F2600C)] hover:[transform:translate3d(0,-2px,0)]">
      <svg width="21" height="21" fill="none" stroke="currentColor" aria-hidden="true" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13c2.5 0 3-6 5.5-6S11 17 13.5 17 17 11 21 11"></path></svg>
    </button>
    <button data-ag-menu-btn="" type="button" aria-label="Menu" className="w-[46px] h-[46px] border-0 rounded-[15px] bg-[#1F1E1C] text-[#EDE9E1] flex items-center justify-center cursor-pointer shadow-[0_10px_26px_rgba(0,0,0,.5)] [transition:background_.35s_ease,transform_.5s_cubic-bezier(.16,1,.3,1)] hover:bg-[var(--ag-accent,#F2600C)] hover:[transform:translate3d(0,-2px,0)]">
      <span data-ag-burger="" className="flex flex-col gap-[5px] w-[19px]">
        <span className="block h-0.5 bg-[currentColor] rounded-[2px] [transition:transform_.45s_cubic-bezier(.16,1,.3,1),opacity_.3s]"></span>
        <span className="block h-0.5 bg-[currentColor] rounded-[2px] [transition:transform_.45s_cubic-bezier(.16,1,.3,1),opacity_.3s]"></span>
      </span>
    </button>
  </div>
</nav>

<div data-ag-overlay="" className="fixed inset-0 z-[65] bg-[rgba(14,13,12,.58)] [backdrop-filter:blur(18px)] [-webkit-backdrop-filter:blur(18px)] opacity-[0] invisible pointer-events-none [transition:opacity_.5s_ease,visibility_.5s_ease]">
  <div className="absolute inset-0 flex items-start justify-end gap-3.5 pt-[clamp(72px,10vh,86px)] px-[clamp(16px,4.4vw,64px)] pb-[clamp(20px,4vh,40px)] overflow-auto max-lg:flex-col max-lg:justify-start">

    <div data-ag-news-panel="" className="[flex:0_1_min(100%,430px)] flex flex-col gap-3 opacity-[0] [transform:translate3d(28px,0,0)] [transition:opacity_.5s_ease,transform_.6s_cubic-bezier(.16,1,.3,1)] pointer-events-none max-lg:w-full max-lg:flex-none">
      <article className="flex gap-4 justify-between bg-[#1F1E1C] rounded-[16px] pt-[18px] px-[18px] pb-3.5 text-[#EDE9E1]">
        <div className="flex flex-col justify-between gap-[18px] min-w-0">
          <div>
            <div className="flex items-baseline gap-[7px] flex-wrap [font-family:'Archivo',sans-serif] font-bold text-[16px] tracking-[-0.01em]"><span>Kyoorius</span><span className="text-[var(--ag-accent,#F2600C)]">→</span><span>Aug. 14</span><span className="[font-family:'Instrument_Sans',sans-serif] font-normal [font-style:italic] text-[13px] text-[#8A857B]">(2026)</span></div>
            <p className="mt-2 mx-0 mb-0 text-[13.5px] leading-[1.45] text-[#B7B1A6]">Agasti Realty took a Kyoorius Blue Elephant for craft in digital experience.</p>
          </div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B]">(Award)</div>
        </div>
        <div className="[flex:0_0_auto] w-[84px] h-[84px] rounded-[13px] bg-[var(--ag-accent,#F2600C)] flex items-center justify-center [font-family:'Archivo',sans-serif] font-bold text-[30px] text-[#0A0A0A]">K.</div>
      </article>
      <article className="flex gap-4 justify-between bg-[#1F1E1C] rounded-[16px] pt-[18px] px-[18px] pb-3.5 text-[#EDE9E1]">
        <div className="flex flex-col justify-between gap-[18px] min-w-0">
          <div>
            <div className="flex items-baseline gap-[7px] flex-wrap [font-family:'Archivo',sans-serif] font-bold text-[16px] tracking-[-0.01em]"><span>Awwwards</span><span className="text-[var(--ag-accent,#F2600C)]">→</span><span>Jun. 2</span><span className="[font-family:'Instrument_Sans',sans-serif] font-normal [font-style:italic] text-[13px] text-[#8A857B]">(2026)</span></div>
            <p className="mt-2 mx-0 mb-0 text-[13.5px] leading-[1.45] text-[#B7B1A6]">Orbital received a Site of the Day and a Developer award on Awwwards.</p>
          </div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B]">(Award)</div>
        </div>
        <div className="[flex:0_0_auto] w-[84px] h-[84px] rounded-[13px] bg-[var(--ag-accent,#F2600C)] flex items-center justify-center [font-family:'Archivo',sans-serif] font-bold text-[30px] text-[#0A0A0A]">W.</div>
      </article>
      <article className="flex gap-4 justify-between bg-[#1F1E1C] rounded-[16px] pt-[18px] px-[18px] pb-3.5 text-[#EDE9E1]">
        <div className="flex flex-col justify-between gap-[18px] min-w-0">
          <div>
            <div className="flex items-baseline gap-[7px] flex-wrap [font-family:'Archivo',sans-serif] font-bold text-[16px] tracking-[-0.01em]"><span>Mint</span><span className="text-[var(--ag-accent,#F2600C)]">→</span><span>Apr. 28</span><span className="[font-family:'Instrument_Sans',sans-serif] font-normal [font-style:italic] text-[13px] text-[#8A857B]">(2026)</span></div>
            <p className="mt-2 mx-0 mb-0 text-[13.5px] leading-[1.45] text-[#B7B1A6]">The studios building their own software instead of buying it.</p>
          </div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B]">(Publication)</div>
        </div>
        <div className="[flex:0_0_auto] w-[84px] h-[84px] rounded-[13px] bg-[#2A2825] flex items-center justify-center [font-family:'Archivo',sans-serif] font-bold text-[20px] text-[#EDE9E1]">Mint</div>
      </article>
      <Link href="/studio" className="flex items-center justify-between gap-4 bg-[#F5F2ED] text-[#0A0A0A] rounded-[16px] py-4 px-5 [font-family:'Archivo',sans-serif] font-semibold text-[16px] [transition:background_.35s_ease] hover:bg-[var(--ag-accent,#F2600C)]">More news <span>→</span></Link>
    </div>

    <div data-ag-menu-panel="" className="[flex:0_1_min(100%,420px)] flex flex-col justify-between gap-[clamp(30px,6vh,64px)] min-h-[min(560px,76vh)] bg-[#1F1E1C] text-[#EDE9E1] rounded-[16px] pt-5 px-[clamp(20px,2.4vw,30px)] pb-[clamp(24px,3vh,34px)] opacity-[0] [transform:translate3d(28px,0,0)] [transition:opacity_.5s_ease,transform_.6s_cubic-bezier(.16,1,.3,1)] pointer-events-none max-lg:w-full max-lg:flex-none">
      <div>
        <div className="flex items-center justify-between gap-4 text-[#8A857B]">
          <span className="text-[17px]">→</span>
          <button data-ag-close="" type="button" aria-label="Close menu" className="w-[30px] h-[30px] border-0 bg-[transparent] text-[#B7B1A6] flex items-center justify-center cursor-pointer text-[19px] leading-[1] [transition:color_.3s] hover:text-[#EDE9E1] max-lg:w-[40px] max-lg:h-[40px]">✕</button>
        </div>
        <div className="flex flex-col mt-[clamp(12px,2vh,22px)]">
          <Link data-ag-mlink="" href="/" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Home <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/#work" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Work <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/about" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">About <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/services" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Services <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/studio" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Studio <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/careers" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#F5F2ED] hover:pl-2.5">Careers <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/contact" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Contact <span className="text-[.5em] text-[#8A857B]">→</span></Link>
        </div>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-3.5">Media</div>
        <div className="flex flex-col gap-[7px] text-[14.5px] font-medium">
          <Link href="/contact" className="max-lg:py-3">LinkedIn</Link>
          <Link href="/contact" className="max-lg:py-3">Instagram</Link>
          <Link href="/contact" className="max-lg:py-3">X / Twitter</Link>
        </div>
      </div>
    </div>

  </div>
</div>

<header id="top" className="relative z-[2] min-h-[88svh] flex items-end pt-[clamp(120px,18vh,200px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(40px,6vh,80px)] overflow-hidden">
  <div data-ag-ether="" className="absolute inset-0 z-[0] bg-[#0C0B0A] overflow-hidden"></div>
  <div className="relative z-[2] [flex:1_1_auto] flex flex-col gap-[clamp(26px,4vh,52px)] pointer-events-none">
    <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">+ (Services)</div>
    <h1 className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.5rem,9vw,10rem)] leading-[.86] tracking-[-0.048em] [font-variation-settings:'wdth'_106]">
      <span data-reveal="" data-delay="0" className="block">SIX DISCIPLINES.</span>
      <span data-reveal="" data-delay="90" className="block text-[var(--ag-accent,#F2600C)]">ONE ROOM.</span>
    </h1>
    <div className="flex justify-between items-end gap-[clamp(20px,5vw,60px)] flex-wrap">
      <p data-reveal="" className="m-0 max-w-[50ch] text-[clamp(15px,1.35vw,19px)] leading-[1.55] text-[#A9A39A]">Strategy, creative, film, design, engineering and growth. Hire us for one, or for the whole thing, it&apos;s the same team either way.</p>
      <a href="#services" className="flex items-center gap-2.5 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] pointer-events-auto">What we do <span className="text-[var(--ag-accent,#F2600C)]">↓</span></a>
    </div>
  </div>
</header>

<section id="services" className="relative z-[1] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(30px,5vw,64px)]">
    <span>(01) What we do</span>
    <span>Six disciplines, one team</span>
  </div>

  <div data-ag-services="">
    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">01</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">SOCIAL &amp; CONTENT</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">Always-on content built by the people who shoot it. Monthly creative direction, a production calendar, and enough footage that the feed never runs dry.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Content strategy</span><span>Always-on social</span><span>Community &amp; copy</span><span>Paid creative</span><span>Reporting</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">02</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">CREATIVE DIRECTION</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">One director across the campaign, the shoot and the site, so the brand reads the same on a billboard, a phone and a checkout page.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Campaign concepts</span><span>Art direction</span><span>Photography</span><span>Film &amp; motion</span><span>Post &amp; grade</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">03</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">BRAND</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">Identity built to be used, not presented. Every system ships with the templates, type licences and working files the team needs on Monday.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Positioning &amp; naming</span><span>Identity systems</span><span>Typography</span><span>Packaging &amp; print</span><span>Guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">04</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">DIGITAL</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">Sites and storefronts that load fast, rank, and hold their art direction on a three-year-old phone.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Websites</span><span>E-commerce</span><span>Digital experiences</span><span>UX / UI</span><span>Design systems</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">05</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">SOFTWARE</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">The part clients usually have to go elsewhere for. Applications, internal tools and the integrations that quietly keep a business running.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Custom applications</span><span>Internal tools</span><span>APIs &amp; integrations</span><span>Automation</span><span>Infrastructure</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-svc="" className="[border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)]">
      <div data-svc-head="" className="flex items-baseline gap-[clamp(12px,2.4vw,34px)] py-[clamp(14px,1.8vw,24px)] px-0 cursor-pointer">
        <span data-svc-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s]">06</span>
        <h3 className="m-0 [flex:1] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.042em] [font-variation-settings:'wdth'_104]">PRODUCT</h3>
        <span data-svc-sign="" className="text-[clamp(14px,1.4vw,20px)] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]">+</span>
      </div>
      <div data-svc-panel="" className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] pt-0 pr-0 pb-[clamp(26px,3.5vw,48px)] pl-[clamp(24px,5vw,86px)]">
            <p className="[flex:2_1_min(100%,300px)] m-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">For founders: the shortest honest route from an idea to something real people can pay for. We build the first version and the story around it.</p>
            <div className="[flex:1_1_min(100%,200px)] flex flex-col gap-[9px] text-[14px] tracking-[.02em] text-[#A9A39A]">
              <span>Product strategy</span><span>MVP development</span><span>Prototyping</span><span>Launch</span><span>Growth infrastructure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="relative z-[1] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(24px,5vw,80px)] items-start mb-[clamp(36px,6vw,80px)]">
    <div className="[flex:1_1_min(100%,260px)]">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] [border-top:1px_solid_rgba(245,242,237,.15)] pt-3">(02) In-house</div>
      <h2 data-reveal="" className="mt-[clamp(18px,2.4vw,32px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.1rem,6vw,5.4rem)] leading-[.92] tracking-[-0.045em]">ONE TEAM.<br />SEVEN ROOMS.<br /><span className="text-[var(--ag-accent,#F2600C)]">NO HANDOFFS.</span></h2>
    </div>
    <p className="[flex:1_1_min(100%,280px)] m-0 [align-self:flex-end] max-w-[44ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#A9A39A]">Most agencies subcontract the half they can&apos;t do. Every stage below happens under one roof, with the same people accountable from the first conversation to the thing being live.</p>
  </div>

  <div data-ag-process="">
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[0%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">01</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">STRATEGY</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">What are we actually trying to move</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[2.4%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">02</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">CREATIVE</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">The idea, and the reason it holds</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[4.8%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">03</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">SHOOT</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">Our studio, our crew, our kit</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[7.2%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">04</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">CONTENT</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">Cut for every place it will live</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[9.6%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">05</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">DESIGN</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">Drawn against the real build</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pl-[12%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">06</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">DEVELOPMENT</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">Engineers who were in the kickoff</span>
      </div>
    </div>
    <div data-step="" className="[border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)] pl-[14.4%] [transition:padding-left_.6s_cubic-bezier(.16,1,.3,1)]">
      <div className="flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(10px,1.2vw,16px)] px-0">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">07</span>
        <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em] text-[var(--ag-accent,#F2600C)]">LAUNCH</span>
        <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[30ch]">And the first month after it</span>
      </div>
    </div>
  </div>
</section>

<section data-dark="" data-ag-flip="" className="relative z-[1] text-[#F7F4EF] pt-[clamp(60px,9vw,130px)] px-0 pb-[clamp(70px,10vw,150px)]">
  <div className="py-0 px-[clamp(20px,4.4vw,64px)]">
    <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
      <span>(03) Content studio</span>
      <span className="text-[var(--ag-accent,#F2600C)]">Shot in-house</span>
    </div>
    <h2 data-reveal="" className="mt-[clamp(22px,3vw,44px)] mx-0 mb-[clamp(18px,2.4vw,32px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,7.4vw,6.6rem)] leading-[.92] tracking-[-0.045em] max-w-[16ch]">THE <span className="text-[var(--ag-accent,#F2600C)]">CAMERA</span> NEVER LEAVES THE BUILDING.</h2>
    <p className="m-0 max-w-[52ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#B7B1A6]">A permanent studio, a standing crew and an edit suite down the hall. A campaign can be conceived on Monday, shot on Wednesday and running by Friday, without a single external booking.</p>
  </div>

  <div data-ag-stream="" className="relative mt-[clamp(34px,5vw,70px)] h-[clamp(320px,62vh,680px)] overflow-hidden [container-type:inline-size]">
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none [perspective:30cqw] [perspective-origin:50%_50%]">
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-0.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-2.00s]"><img src="/images/b7afa59dc4.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-4.00s]"><img src="/images/3143905490.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-6.00s]"><img src="/images/ce6c217cd9.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-8.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-10.00s]"><img src="/images/b7afa59dc4.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-12.00s]"><img src="/images/3143905490.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-14.00s]"><img src="/images/ce6c217cd9.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-r_18s_linear_infinite] [animation-delay:-16.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-0.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-2.00s]"><img src="/images/b7afa59dc4.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-4.00s]"><img src="/images/3143905490.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-6.00s]"><img src="/images/ce6c217cd9.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-8.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-10.00s]"><img src="/images/b7afa59dc4.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-12.00s]"><img src="/images/3143905490.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-14.00s]"><img src="/images/ce6c217cd9.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
        <div data-ag-card="" className="absolute left-[50%] top-[50%] w-[18cqw] h-[25cqw] ml-[-9cqw] mt-[-12.5cqw] rounded-[.4cqw] overflow-hidden [backface-visibility:hidden] [animation:ag-rail-l_18s_linear_infinite] [animation-delay:-16.00s]"><img src="/images/df2ee54140.jpg" alt="" loading="lazy" decoding="async" draggable="false" className="w-full h-full object-cover block" /></div>
      </div>
    </div>
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_34%_42%_at_50%_50%,rgba(12,11,10,.92)_0%,rgba(12,11,10,.55)_45%,rgba(12,11,10,0)_72%)]"></div>
    <div className="absolute left-0 right-0 bottom-[clamp(14px,2.4vw,28px)] flex justify-center [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">Selected frames, 2024–2026</div>
  </div>
</section>

<section data-dark="" className="relative z-[1] text-[#F7F4EF] py-[clamp(72px,11vw,170px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(237,233,225,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(04) Technology</span>
    <span>Built, not assembled</span>
  </div>

  <h2 data-reveal="" className="mt-[clamp(26px,4vw,60px)] mx-0 mb-[clamp(34px,5vw,80px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,6.6vw,6rem)] leading-[.94] tracking-[-0.045em] max-w-[18ch]">WE DON&apos;T JUST DESIGN THE INTERFACE. WE BUILD THE <span className="text-[var(--ag-accent,#F2600C)]">MACHINE</span> BEHIND IT.</h2>

  <div className="flex flex-wrap gap-[0_clamp(28px,6vw,100px)]">
    <div className="[flex:1_1_min(100%,280px)]">
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Custom applications</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Replacing the spreadsheet a business runs on</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Commerce</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Storefronts that survive a campaign spike</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Platforms</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Multi-tenant, multi-team, still fast</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] [border-bottom:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Internal tools</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">The unglamorous software that saves the week</span></div>
    </div>
    <div className="[flex:1_1_min(100%,280px)]">
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>APIs &amp; integrations</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Making systems that ignore each other talk</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Automation</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Hours back, every month</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>AI in production</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Shipped features, not demos</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(237,233,225,.18)] [border-bottom:1px_solid_rgba(237,233,225,.18)] py-[15px] px-0 text-[clamp(15px,1.4vw,19px)]"><span>Infrastructure</span><span className="[flex:0_1_auto] max-w-[24ch] text-[12px] text-[#8A857B] text-right">Owned by you, documented, handed over</span></div>
    </div>
  </div>

  <p className="mt-[clamp(30px,4vw,56px)] mx-0 mb-0 max-w-[52ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#B7B1A6]">We&apos;ll happily talk through the stack if you want to, but you&apos;re buying an outcome that works in three years, not a list of frameworks.</p>
</section>

<section data-dark="" className="relative z-[1] text-[#F7F4EF] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(26px,5vw,90px)] items-start">
    <div className="[flex:1_1_min(100%,280px)] sticky top-[110px]">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B] [border-top:1px_solid_rgba(247,244,239,.16)] pt-3">(05) For founders</div>
      <h2 data-reveal="" className="mt-[clamp(18px,2.4vw,32px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,5.2vw,4.6rem)] leading-[.92] tracking-[-0.045em]">ZERO<br />TO<br /><span className="text-[var(--ag-accent,#F2600C)]">LAUNCH.</span></h2>
      <p className="mt-[clamp(18px,2.4vw,30px)] mx-0 mb-0 max-w-[40ch] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#B7B1A6]">Founders don&apos;t need six suppliers and a project manager to coordinate them. They need one team that can name the thing, build it, film it and put it in front of people, in weeks.</p>
      <a href="#contact" className="inline-flex items-center gap-2.5 mt-[clamp(22px,3vw,38px)] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.4vw,19px)] [border-bottom:1px_solid_currentColor] pb-[3px] max-lg:py-3">Start something <span>→</span></a>
    </div>
    <div className="[flex:1_1_min(100%,300px)]">
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[0%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1]">IDEA</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Week 00</span></div>
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[6%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1]">BRAND</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Week 02</span></div>
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[12%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1]">PRODUCT</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Week 04</span></div>
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[18%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1]">CONTENT</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Week 08</span></div>
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[24%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1] text-[var(--ag-accent,#F2600C)]">LAUNCH</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Week 10</span></div>
      <div data-reveal="" className="[border-top:1px_solid_rgba(247,244,239,.16)] [border-bottom:1px_solid_rgba(247,244,239,.16)] py-[clamp(10px,1.2vw,16px)] px-0 ml-[30%]"><span className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.6rem,4.6vw,3.6rem)] tracking-[-0.04em] leading-[1]">GROWTH</span><span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] ml-3.5">Ongoing</span></div>
    </div>
  </div>
</section>

<section id="contact" data-dark="" className="relative z-[1] text-[#F7F4EF] pt-[clamp(72px,11vw,170px)] px-[clamp(20px,4.4vw,64px)] pb-0">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(06) Contact</span>
    <span>Taking projects for Q1 2027</span>
  </div>

  <h2 data-reveal="" className="mt-[clamp(34px,6vw,90px)] mx-0 mb-[clamp(30px,4vw,60px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,9.6vw,9.5rem)] leading-[.88] tracking-[-0.048em] [font-variation-settings:'wdth'_104]">HAVE A THING<br />WORTH <span className="text-[var(--ag-accent,#F2600C)]">BUILDING?</span></h2>

  <div className="flex flex-wrap gap-[clamp(30px,6vw,110px)] items-start pb-[clamp(50px,8vw,110px)]">
    <form data-ag-form="" className="[flex:2_1_min(100%,320px)] flex flex-col gap-[clamp(18px,2.4vw,30px)]">
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">Name</span>
        <input type="text" name="name" placeholder="Your name" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-2 px-0 text-[clamp(16px,1.5vw,20px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">Email</span>
        <input type="email" name="email" placeholder="you@company.com" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-2 px-0 text-[clamp(16px,1.5vw,20px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">What are you building</span>
        <textarea name="brief" rows={3} placeholder="A sentence is enough." className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-2 px-0 text-[clamp(16px,1.5vw,20px)] [outline:none] [resize:vertical] [font-family:inherit] focus:[border-bottom-color:var(--ag-accent,#F2600C)]"></textarea>
      </label>
      <button data-ag-submit="" type="submit" className="[align-self:flex-start] mt-1.5 bg-[transparent] border-0 [border-bottom:1px_solid_currentColor] pt-0 px-0 pb-1 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(17px,2vw,26px)] tracking-[-0.02em] cursor-pointer [transition:color_.3s] hover:text-[var(--ag-accent,#F2600C)] max-lg:py-2.5">Send it →</button>
    </form>

    <div className="[flex:1_1_min(100%,240px)] flex flex-col gap-[clamp(20px,3vw,34px)]">
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-[9px]">Direct</div>
        <a href="mailto:hello@arohance.com" className="text-[clamp(16px,1.5vw,21px)] [border-bottom:1px_solid_rgba(237,233,225,.3)] pb-0.5 max-lg:inline-block max-lg:py-3">hello@arohance.com</a>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-[9px]">Elsewhere</div>
        <div className="flex flex-col gap-[7px] text-[clamp(15px,1.4vw,19px)]">
          <a href="#contact" className="max-lg:py-3">Instagram, @arohance</a>
          <a href="#contact" className="max-lg:py-3">LinkedIn, /company/arohance</a>
        </div>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-[9px]">Studio</div>
        <div className="text-[clamp(15px,1.4vw,19px)] leading-[1.5]">Level 4, Prestige Atrium<br />Bengaluru 560001, India</div>
      </div>
    </div>
  </div>

  <footer className="[border-top:1px_solid_rgba(247,244,239,.18)]">
    <div className="flex justify-between gap-4 flex-wrap py-4 px-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] max-lg:items-center">
      <span>© 2026 Arohance</span>
      <span className="flex gap-[18px]"><a href="#contact" className="max-lg:px-2 max-lg:py-4">Privacy</a><a href="#contact" className="max-lg:px-2 max-lg:py-4">Terms</a><a href="#top" className="max-lg:px-2 max-lg:py-4">Back to top ↑</a></span>
    </div>
    <div className="pt-[clamp(10px,2vw,28px)] px-0 pb-[clamp(14px,2.4vw,34px)]">
      <div data-ag-stroke="" aria-label="AROHANCE" className="block w-full min-h-[clamp(60px,16vw,260px)]"></div>
    </div>
  </footer>
</section>

<div data-ag-lightbox="" className="fixed inset-0 z-[92] bg-[rgba(10,10,9,.95)] flex items-center justify-center p-[clamp(20px,5vw,80px)] opacity-[0] invisible pointer-events-none [transition:opacity_.4s_ease] cursor-pointer">
  <div className="w-full max-w-[min(1120px,100%)] flex flex-col gap-[clamp(14px,2.2vw,28px)]">
    <img data-lb-img="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Testimonial" className="w-full [aspect-ratio:16/9] object-cover block bg-[#1d1c1a]" />
    <div className="flex justify-between items-start gap-[clamp(18px,4vw,50px)] flex-wrap">
      <p data-lb-quote="" className="[flex:2_1_min(100%,320px)] m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.1rem,2.2vw,1.9rem)] leading-[1.18] tracking-[-0.025em] text-[#EDE9E1]"></p>
      <div className="[flex:1_1_min(100%,200px)] text-right [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase text-[#8A857B] leading-[1.9]"><span data-lb-name="" className="text-[#EDE9E1]"></span><br />Click anywhere or press esc to close</div>
    </div>
  </div>
</div>

<ContactPill />
<ServicesRuntime />
</div>
  );
}
