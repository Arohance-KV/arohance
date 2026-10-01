// Generated + hand-augmented — read before editing.
//
// Starting point: `tools/convert.mjs home` (parses
// `.source/templates/home.html`, rewrites inline styles to Tailwind
// classes) -> `.source/jsx/home.jsx`, hand-merged into this file once
// (swapping `<img>` for `next/image`; the converter already emits
// `next/link`'s `<Link>` for internal anchors, so that part needed no
// manual swap; wiring up `HomeRuntime`). Since that merge, 26 `max-lg:`
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
//
// Content update: the hero (`header#top`), `section#intro`,
// `section#verticals` and `section#work` (header zoom, accent case-study grid
// rendered from lib/work.ts by `WorkCard` below)
// are hand-written to the new content brief, not converter output, so they deliberately no longer match
// `Arohance Homepage.html`; the What we do, In-house and Technology sections
// are commented out below, and the visible eyebrows renumbered (01)-(06). A
// regenerate-and-paste would silently revert all of it.
// Also hand-added: `<Intro />` (components/Intro.tsx, the first-visit entrance) before the root.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import Intro from '@/components/Intro';
import { VERTICALS, verticalHref, serviceHref } from '@/lib/verticals';
import { WORK, workHref, type Work } from '@/lib/work';
import HomeRuntime from './home-runtime';

// Home keeps the site's own canonical title (also the logo's alt text,
// sitewide) as an explicit `absolute` value — bypassing the root layout's
// `%s — Arohance` template on purpose, so it reads as "Arohance — Tech &
// Marketing", not the template applied twice.
export const metadata: Metadata = {
  title: { absolute: 'Arohance — Tech & Marketing' },
};

export default function Home() {
  return (
<>
<Intro />
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
          <a data-ag-mlink="" href="#top" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Home <span className="text-[.5em] text-[#8A857B]">→</span></a>
          <a data-ag-mlink="" href="#work" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Work <span className="text-[.5em] text-[#8A857B]">→</span></a>
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

<header id="top" className="relative z-[2] min-h-[100svh] flex flex-col justify-end pt-[clamp(104px,14vh,160px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(26px,4vh,48px)] overflow-hidden">
  <div data-ag-ether="" className="absolute inset-0 z-[0] bg-[#0C0B0A] overflow-hidden"></div>

  <div className="absolute left-0 top-0 bottom-0 w-[min(78%,1100px)] z-[1] bg-[linear-gradient(100deg,rgba(12,11,10,.72)_0%,rgba(12,11,10,.38)_45%,rgba(12,11,10,0)_80%)] pointer-events-none"></div>

  <div className="relative z-[2] max-w-[min(62%,880px)] flex flex-col gap-[clamp(22px,3.4vh,40px)] max-lg:max-w-none">
  {/* Read as one heading: the letters of MAGNETIC are separate spans for the magnet effect. */}
  <h1 aria-label="We make you magnetic" className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.5rem,8vw,9.5rem)] leading-[.86] tracking-[-0.048em] [font-variation-settings:'wdth'_106] max-lg:text-[clamp(2.5rem,13vw,5.5rem)]">
    <span aria-hidden="true" className="block whitespace-nowrap">WE MAKE</span>
    <span aria-hidden="true" className="block whitespace-nowrap">YOU</span>
    <span aria-hidden="true" className="block whitespace-nowrap"><span data-ag-magnet="" className="inline-block text-[var(--ag-accent,#F2600C)]">{[...'MAGNETIC'].map((letter, i) => <span key={i} data-ag-magnet-letter="" className="inline-block [will-change:transform]">{letter}</span>)}</span></span>
  </h1>
  <p data-reveal="" data-delay="270" className="m-0 max-w-[44ch] text-[clamp(15px,1.35vw,19px)] leading-[1.5] text-[#D9D3C8]">One accountable team behind every step, from strategy and creative to film, design and technology.</p>
  </div>

  <div className="relative z-[2] mt-[clamp(26px,4vh,44px)] flex items-end justify-between gap-5 flex-wrap">
    <div data-reveal="" data-delay="360" className="flex flex-wrap items-center gap-3">
      {/* Link colours: globals.css's unlayered `a { color: inherit }` and `a:hover` beat any
          text-* utility on an <a>, so links here take their colour from a parent, and the
          one that must stay dark in every state (on orange, then on paper) uses `!`. */}
      <a href="#work" className="inline-flex items-center gap-3 bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A]! rounded-[999px] py-3.5 px-6 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.3vw,18px)] [transition:background_.35s_ease] hover:bg-[#F5F2ED]">See Our Work <span aria-hidden="true">→</span></a>
      <Link href="/contact" className="inline-flex items-center rounded-[999px] py-3.5 px-6 [border:1px_solid_rgba(245,242,237,.34)] bg-[rgba(12,11,10,.28)] [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.3vw,18px)] [transition:border-color_.35s_ease,color_.35s_ease] hover:[border-color:var(--ag-accent,#F2600C)]">Let&apos;s Talk</Link>
    </div>
  </div>
</header>

<section id="intro" className="relative z-[1] pt-[clamp(70px,11vw,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(56px,8vw,120px)]">
  <div className="flex gap-[clamp(26px,5vw,90px)] flex-wrap items-start">
    <div data-eyebrow="" className="[flex:1_1_min(100%,190px)] [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] pt-2.5">+ (Who we are)</div>
    <div className="[flex:4_1_min(100%,520px)]">
      <h2 className="m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.55rem,3.9vw,3.5rem)] leading-[1.08] tracking-[-0.03em] [font-variation-settings:'wdth'_100] [text-wrap:pretty]">We don&apos;t market brands. We make them <em className="text-[var(--ag-accent,#F2600C)]">magnetic</em>, on screen, on ground and everywhere in between.</h2>
      <p data-reveal="" className="mt-[clamp(24px,3.4vw,44px)] mx-0 mb-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#A9A39A]">Five specialised verticals, one in-house team, working together from first idea to final launch.</p>
    </div>
  </div>
</section>

<section id="verticals" className="relative z-[1] pt-0 px-[clamp(20px,4.4vw,64px)] pb-[clamp(70px,11vw,170px)]">
  <h2 className="mt-0 mx-0 mb-[clamp(30px,4.4vw,64px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,4.4vw,4rem)] leading-[.94] tracking-[-0.045em]">FIVE VERTICALS.<br />ONE TEAM.<br /><span className="text-[var(--ag-accent,#F2600C)]">ONE RESPONSIBILITY.</span></h2>

  {/* Rows open one at a time (lib/behaviors/verticals.ts sets `data-open`); everything below styles off it. */}
  <div data-ag-verticals="" className="[border-bottom:1px_solid_rgba(245,242,237,.15)]">
    {VERTICALS.map((v, i) => (
      <div key={v.slug} data-vx="" className="group [border-top:1px_solid_rgba(245,242,237,.15)]">
        <div data-vx-head="" className="grid grid-cols-[clamp(24px,2.6vw,40px)_auto_minmax(12ch,1fr)_auto] items-baseline gap-x-[clamp(12px,2.4vw,34px)] py-[clamp(16px,2vw,28px)] max-lg:grid-cols-[clamp(24px,2.6vw,40px)_minmax(0,1fr)_auto] max-lg:gap-y-2">
          <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E] [transition:color_.35s_ease] group-data-[open]:text-[var(--ag-accent,#F2600C)]">{String(i + 1).padStart(2, '0')}</span>
          {/* The name link inherits its colour from the h3 (see the hero's note on link colours). */}
          <h3 className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,4.8vw,5rem)] leading-[.95] tracking-[-0.045em] [font-variation-settings:'wdth'_104] uppercase group-data-[open]:text-[var(--ag-accent,#F2600C)] max-lg:text-[clamp(2rem,6.4vw,3.2rem)]">
            <Link href={verticalHref(v)} className="inline-block [transition:transform_.6s_cubic-bezier(.16,1,.3,1),color_.35s_ease] group-data-[open]:[transform:translate3d(clamp(6px,1vw,14px),0,0)] max-lg:min-h-11"><span className="text-[#6B665F]">Arohance</span> {v.name}</Link>
          </h3>
          <p className="m-0 justify-self-end max-w-[30ch] text-right text-[clamp(14px,1.2vw,17px)] leading-[1.4] text-[#A9A39A] max-lg:col-start-2 max-lg:row-start-2 max-lg:justify-self-start max-lg:text-left">{v.tagline}</p>
          <Link href={verticalHref(v)} data-vx-go="" aria-hidden="true" tabIndex={-1} className="self-center flex items-center justify-center w-[clamp(42px,3.6vw,52px)] h-[clamp(42px,3.6vw,52px)] rounded-[50%] [border:1px_solid_rgba(245,242,237,.22)] [transition:background_.35s_ease,border-color_.35s_ease] group-data-[open]:bg-[var(--ag-accent,#F2600C)] group-data-[open]:[border-color:var(--ag-accent,#F2600C)] max-lg:col-start-3 max-lg:row-start-1">
            <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="[transition:color_.35s_ease] group-data-[open]:text-[#0A0A0A]"><path d="M7 17 17 7"></path><path d="M8 7h9v9"></path></svg>
          </Link>
        </div>
        <div className="grid [grid-template-rows:0fr] opacity-[0] [transition:grid-template-rows_.6s_cubic-bezier(.16,1,.3,1),opacity_.45s_ease] group-data-[open]:[grid-template-rows:1fr] group-data-[open]:opacity-[1]">
          <div className="overflow-hidden">
            <div className="flex flex-col gap-[clamp(14px,1.6vw,20px)] pl-[calc(clamp(24px,2.6vw,40px)+clamp(12px,2.4vw,34px))] pb-[clamp(22px,3vw,40px)]">
              <p className="m-0 max-w-[40ch] text-[clamp(16px,1.5vw,21px)] leading-[1.4] text-[#D9D3C8]">{v.description}</p>
              <ul className="m-0 p-0 list-none flex flex-wrap gap-2 text-[#CFC9BF]">
                {v.services.map((service) => (
                  <li key={service}><Link href={serviceHref(v, service)} className="inline-flex items-center gap-2 rounded-[999px] [border:1px_solid_rgba(245,242,237,.2)] py-2 px-3.5 text-[13.5px] leading-[1.2] [transition:border-color_.3s_ease,color_.3s_ease] hover:[border-color:var(--ag-accent,#F2600C)] max-lg:py-3">{service}<span aria-hidden="true" className="[font-family:'JetBrains_Mono',monospace] text-[11px]">↗</span></Link></li>
                ))}
              </ul>
              {/* Touch has no cursor to trail, so the preview sits in the row instead. */}
              <div className="relative w-[min(100%,360px)] [aspect-ratio:16/10] rounded-[6px] overflow-hidden bg-[#1A1815] pointer-fine:hidden">
                <Image src={v.preview} alt="" fill sizes="360px" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

{/* The verticals' cursor-trailing preview. A direct child of [data-ag-root], not
    inside #verticals: that section's z-[1] stacking context would let the next
    section paint over the card wherever it trails past the section's bottom. */}
<div data-vx-preview="" aria-hidden="true" className="fixed left-0 top-0 z-[60] w-[clamp(180px,15vw,240px)] [aspect-ratio:4/3] rounded-[6px] overflow-hidden bg-[#1A1815] shadow-[0_24px_60px_rgba(0,0,0,.5)] pointer-events-none opacity-[0] [transition:opacity_.35s_ease] pointer-coarse:hidden">
  {VERTICALS.map((v) => (
    <div key={v.slug} data-vx-frame="" className="absolute inset-0 opacity-[0] [transition:opacity_.45s_ease]">
      <Image src={v.preview} alt="" fill sizes="240px" className="object-cover" />
    </div>
  ))}
</div>

<div className="relative z-[1] overflow-hidden py-[clamp(54px,7vw,104px)] px-0">
  <div className="relative h-[clamp(132px,15vw,220px)]">
    <div className="absolute left-[-6%] right-[-6%] top-[50%] [transform:translateY(-50%)_rotate(-5deg)]">
      <div className="overflow-hidden bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] py-[clamp(9px,1.1vw,15px)] px-0 shadow-[0_22px_50px_rgba(0,0,0,.55)]">
        <div data-ag-ribbon="" className="flex w-max [animation:ag-marquee_32s_linear_infinite] [font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.6vw,26px)] tracking-[.06em] uppercase whitespace-nowrap">
          <span className="pr-[34px]">Social — Content — Creative direction — Photography — Film — Brand &nbsp;</span>
          <span className="pr-[34px]">Websites — Commerce — Custom software — Platforms — Product — Launch &nbsp;</span>
          <span className="pr-[34px]">Social — Content — Creative direction — Photography — Film — Brand &nbsp;</span>
          <span className="pr-[34px]">Websites — Commerce — Custom software — Platforms — Product — Launch &nbsp;</span>
        </div>
      </div>
    </div>
    <div className="absolute left-[-6%] right-[-6%] top-[50%] [transform:translateY(-50%)_rotate(5deg)]">
      <div className="overflow-hidden bg-[#F5F2ED] text-[#0A0A0A] py-[clamp(9px,1.1vw,15px)] px-0 shadow-[0_22px_50px_rgba(0,0,0,.55)]">
        <div data-ag-ribbon="" className="flex w-max [animation:ag-marquee-rev_32s_linear_infinite] [font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.6vw,26px)] tracking-[.06em] uppercase whitespace-nowrap">
          <span className="pr-[34px]">One team — No handoffs — In-house crew — Zero to launch &nbsp;</span>
          <span className="pr-[34px]">Strategy — Design — Engineering — Growth &nbsp;</span>
          <span className="pr-[34px]">One team — No handoffs — In-house crew — Zero to launch &nbsp;</span>
          <span className="pr-[34px]">Strategy — Design — Engineering — Growth &nbsp;</span>
        </div>
      </div>
    </div>
  </div>
</div>

<section id="work" className="relative z-[1]">
{/* Scrolling dives the header into the full stop of WORK. (lib/behaviors/zoom.ts),
    landing in the accent case-study grid below. */}
<div data-ag-zoom="">
  <div data-ag-zoom-pin="" className="pt-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(34px,5vw,80px)]">
    <div data-ag-zoom-fade="" data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
      <span>(01) Selected work</span>
      <span>Four case studies</span>
    </div>
    <div className="flex flex-wrap gap-[clamp(20px,4vw,64px)] items-end justify-between mt-[clamp(30px,4.5vw,64px)]">
      <h2 data-ag-zoom-frame="" className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,10vw,10rem)] leading-[.86] tracking-[-0.05em] [font-variation-settings:'wdth'_106]">THE <span className="text-[var(--ag-accent,#F2600C)]">WORK<span data-ag-zoom-dot="">.</span></span></h2>
      <p data-ag-zoom-fade="" className="m-0 max-w-[38ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#A9A39A]">Every project below was strategised, made and delivered by one in-house team.</p>
    </div>
  </div>
</div>
<div className="bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] pt-[clamp(60px,8vw,120px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(60px,8vw,120px)]">
  {/* Cards render from lib/work.ts: a lead card, then rows of two that
      alternate a staggered tall pair with a wide + side pair; the call to
      action takes the slot after the last card. */}
  <WorkCard w={WORK[0]} n={1} shape="lead" />
  {WORK_ROWS.map((row, r) => (
    <div key={r} className={`flex flex-wrap gap-[clamp(20px,3vw,48px)] mt-[clamp(44px,6vw,96px)] ${r % 2 ? 'items-end' : 'items-start'}`}>
      {row.map((w, j) => w ? (
        <WorkCard key={w.slug} w={w} n={2 + r * 2 + j} shape={ROW_SHAPES[r % 2][j]} />
      ) : (
        <div key="cta" className={`${SHAPES[ROW_SHAPES[r % 2][j]][0]} flex flex-col gap-[18px] pb-[clamp(10px,2vw,30px)]`}>
          <p data-split="" className="m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.2rem,2.2vw,2rem)] leading-[1.12] tracking-[-0.025em]">Your brand could be next.</p>
          <a href="#contact" className="group [align-self:flex-start] inline-flex items-center gap-3 bg-[#0A0A0A] rounded-[999px] py-3.5 px-6 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.3vw,18px)] [transition:background_.35s_ease] hover:bg-[#F5F2ED]">{/* Colour on the span: the sitewide unlayered `a { color: inherit }` beats utilities on <a>. */}<span className="text-[#F5F2ED] [transition:color_.35s_ease] group-hover:text-[#0A0A0A]">Start a project →</span></a>
        </div>
      ))}
    </div>
  ))}
</div>
</section>

<section id="clients" className="relative z-[1] py-[clamp(60px,9vw,130px)] px-[clamp(20px,4.4vw,64px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(26px,4vw,56px)]">
    <span>(02) Clients</span>
    <span>Selected, 2021–2026</span>
  </div>
  <h2 className="mt-0 mx-0 mb-[clamp(28px,4vw,56px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,6.4vw,5.6rem)] leading-[.94] tracking-[-0.045em] max-w-[20ch]">BRANDS WE MADE <span className="text-[var(--ag-accent,#F2600C)]">MAGNETIC.</span></h2>
  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] max-sm:grid-cols-2 [border-bottom:1px_solid_rgba(245,242,237,.15)]">
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/9fcd96b10a.png" alt="Diadora" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/d0569aa348.png" alt="Mountain Dew" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/31d793b210.png" alt="Justin Bieber" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/fc59ba71ce.png" alt="Under Armour" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/21267148b3.png" alt="Pepsi" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/1383b4b3b1.png" alt="Dove" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/8e3b2eaad5.png" alt="Disney" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/81404900fd.png" alt="Twitch" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/622209aa27.png" alt="Dude Perfect" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/d0c48a6eef.png" alt="Sony" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/cbef105623.png" alt="Nokia" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/9174328433.png" alt="Universal" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
      <div data-hover-group="" className="flex items-center justify-center min-h-[clamp(110px,12vw,160px)] p-[clamp(18px,2vw,30px)] [border-top:1px_solid_rgba(245,242,237,.15)] [transition:background_.4s_ease] hover:bg-[rgba(242,96,12,.08)]">
        <img data-hover-img="" src="/images/3b648b62d6.png" alt="Taco Bell" className="block max-w-[min(78%,150px)] max-h-[52px] w-auto h-auto object-contain [filter:brightness(0)_invert(1)] opacity-[.62] [transition:opacity_.4s_ease] hover:opacity-[1]" />
      </div>
  </div>
  <p className="mt-[clamp(24px,3.5vw,44px)] mx-0 mb-0 max-w-[46ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#A9A39A]">Most came back for a second engagement. Several started as a single shoot and ended up as the whole platform.</p>
</section>

<section id="testimonials" data-dark="" className="relative z-[1] bg-[#131110] text-[#F7F4EF] py-[clamp(70px,11vw,160px)] px-[clamp(20px,4.4vw,64px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(237,233,225,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(03) Testimonials</span>
    <span>On camera, unscripted</span>
  </div>

  <div className="flex flex-wrap gap-[clamp(24px,4vw,64px)] items-end mt-[clamp(30px,4.5vw,64px)]">
    <h2 className="[flex:2_1_min(100%,340px)] m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,6vw,5.2rem)] leading-[.94] tracking-[-0.045em]">DON&apos;T TAKE OUR <span className="text-[var(--ag-accent,#F2600C)]">WORD</span> FOR IT.</h2>
    <p className="[flex:1_1_min(100%,260px)] m-0 max-w-[40ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#B7B1A6]">We film every wrap-up conversation in the studio. No script, no approval round, press play.</p>
  </div>

  <div data-vt-reel="" className="flex flex-wrap gap-[clamp(18px,2.6vw,40px)] mt-[clamp(30px,5vw,70px)] items-stretch">
    <div data-vt-stage="" className="[flex:3_1_min(100%,560px)] relative overflow-hidden [aspect-ratio:16/10] max-h-[78vh] bg-[#1A1815] rounded-[6px]">
      <div data-vt-layer="" data-vt-card="" data-vt-poster="/images/df2ee54140.jpg" data-vt-name="Priya Ravindran, Managing Director, Agasti Realty" data-vt-quote="“We came for a website. What we got was a sales engine, a film crew and a brand that finally looks like the buildings we put up.”" data-vt-dur="134" data-cursor="Play" className="absolute inset-0 opacity-[1] [transition:opacity_1s_ease] cursor-pointer">
        <div data-vt-kb="" className="absolute inset-[-4%] [will-change:transform]"><img src="/images/df2ee54140.jpg" alt="Testimonial still" className="h-full w-full object-cover" /></div>
      </div>
      <div data-vt-layer="" data-vt-card="" data-vt-poster="/images/ce6c217cd9.jpg" data-vt-name="Ananya Rao, Founder, Redpanda Outdoor" data-vt-quote="“They shot the campaign on Tuesday and the store was live on Friday. I still do not fully understand how.”" data-vt-dur="98" data-cursor="Play" className="absolute inset-0 opacity-[0] [transition:opacity_1s_ease] cursor-pointer">
        <div data-vt-kb="" className="absolute inset-[-4%] [will-change:transform]"><img src="/images/ce6c217cd9.jpg" alt="Testimonial still" className="h-full w-full object-cover" /></div>
      </div>
      <div data-vt-layer="" data-vt-card="" data-vt-poster="/images/3143905490.jpg" data-vt-name="Dev Menon, CTO, Orbital" data-vt-quote="“The rare agency where the engineers were in the first meeting and the design survived contact with production.”" data-vt-dur="122" data-cursor="Play" className="absolute inset-0 opacity-[0] [transition:opacity_1s_ease] cursor-pointer">
        <div data-vt-kb="" className="absolute inset-[-4%] [will-change:transform]"><img src="/images/3143905490.jpg" alt="Testimonial still" className="h-full w-full object-cover" /></div>
      </div>
      <div data-vt-layer="" data-vt-card="" data-vt-poster="/images/b7afa59dc4.jpg" data-vt-name="Leela Fernandes, Publisher, Margin Press" data-vt-quote="“Eleven print titles onto one platform, and the covers were shot in the same building. That is the whole pitch.”" data-vt-dur="72" data-cursor="Play" className="absolute inset-0 opacity-[0] [transition:opacity_1s_ease] cursor-pointer">
        <div data-vt-kb="" className="absolute inset-[-4%] [will-change:transform]"><img src="/images/b7afa59dc4.jpg" alt="Testimonial still" className="h-full w-full object-cover" /></div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(12,11,10,.55)_0%,rgba(12,11,10,0)_22%,rgba(12,11,10,0)_48%,rgba(12,11,10,.88)_100%)]"></div>
      <div className="absolute left-[clamp(14px,2vw,26px)] right-[clamp(14px,2vw,26px)] top-[clamp(14px,2vw,22px)] flex gap-1.5 pointer-events-none">
        <span data-vt-bar="" className="[flex:1_1_0] h-[3px] rounded-[3px] bg-[rgba(245,242,237,.25)] overflow-hidden"><span className="block h-full w-0 bg-[var(--ag-accent,#F2600C)]"></span></span>
        <span data-vt-bar="" className="[flex:1_1_0] h-[3px] rounded-[3px] bg-[rgba(245,242,237,.25)] overflow-hidden"><span className="block h-full w-0 bg-[var(--ag-accent,#F2600C)]"></span></span>
        <span data-vt-bar="" className="[flex:1_1_0] h-[3px] rounded-[3px] bg-[rgba(245,242,237,.25)] overflow-hidden"><span className="block h-full w-0 bg-[var(--ag-accent,#F2600C)]"></span></span>
        <span data-vt-bar="" className="[flex:1_1_0] h-[3px] rounded-[3px] bg-[rgba(245,242,237,.25)] overflow-hidden"><span className="block h-full w-0 bg-[var(--ag-accent,#F2600C)]"></span></span>
      </div>
      <div className="absolute left-[clamp(14px,2vw,26px)] right-[clamp(14px,2vw,26px)] top-[clamp(28px,3.4vw,40px)] flex justify-between gap-3 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#F5F2ED] pointer-events-none">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-[50%] bg-[var(--ag-accent,#F2600C)] [animation:ag-pulse_1.4s_ease-in-out_infinite]"></span>Rec · Studio A</span>
        <span data-vt-time="">00:00 / 02:14</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span data-vt-play="" className="w-[clamp(64px,7vw,96px)] h-[clamp(64px,7vw,96px)] rounded-[50%] bg-[var(--ag-accent,#F2600C)] flex items-center justify-center shadow-[0_0_0_0_rgba(242,96,12,.5)] [transition:transform_.5s_cubic-bezier(.16,1,.3,1)]"><img src="/images/c51e877a13.svg" alt="Play" className="w-[40%] h-[40%] block" /></span>
      </div>
      <div className="absolute left-[clamp(16px,2.4vw,34px)] right-[clamp(16px,2.4vw,34px)] bottom-[clamp(16px,2.4vw,32px)] pointer-events-none">
        <p data-vt-caption="" className="m-0 max-w-[30ch] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.4vw,2.2rem)] leading-[1.14] tracking-[-0.025em] text-[#F5F2ED] [text-wrap:pretty]">“We came for a website. What we got was a sales engine, a film crew and a brand that finally looks like the buildings we put up.”</p>
        <div data-vt-now="" className="mt-3 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#D9D3C8]">Priya Ravindran — Managing Director, Agasti Realty</div>
      </div>
    </div>
    <div className="[flex:1_1_min(100%,260px)] flex flex-col [border-top:1px_solid_rgba(237,233,225,.18)]">
      <button data-vt-item="" type="button" className="flex items-center gap-3.5 w-full text-left bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.18)] py-3.5 px-0 cursor-pointer [transition:padding-left_.5s_cubic-bezier(.16,1,.3,1)] hover:pl-2">
        <span data-vt-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] text-[var(--ag-accent,#F2600C)] w-[22px]">01</span>
        <span className="[flex:0_0_auto] w-16 h-11 rounded-[4px] overflow-hidden bg-[#1A1815]"><img src="/images/df2ee54140.jpg" alt="" className="w-full h-full object-cover block" /></span>
        <span className="[flex:1_1_auto] min-w-0">
          <span className="block [font-family:'Archivo',sans-serif] font-bold text-[clamp(14px,1.25vw,17px)] tracking-[-0.02em] text-[#F5F2ED]">Priya Ravindran</span>
          <span className="block [font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] uppercase text-[#8A857B] mt-1">Managing Director, Agasti Realty</span>
        </span>
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] text-[#8A857B]">02:14</span>
      </button>
      <button data-vt-item="" type="button" className="flex items-center gap-3.5 w-full text-left bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.18)] py-3.5 px-0 cursor-pointer [transition:padding-left_.5s_cubic-bezier(.16,1,.3,1)] hover:pl-2">
        <span data-vt-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] text-[#8A857B] w-[22px]">02</span>
        <span className="[flex:0_0_auto] w-16 h-11 rounded-[4px] overflow-hidden bg-[#1A1815]"><img src="/images/ce6c217cd9.jpg" alt="" className="w-full h-full object-cover block" /></span>
        <span className="[flex:1_1_auto] min-w-0">
          <span className="block [font-family:'Archivo',sans-serif] font-bold text-[clamp(14px,1.25vw,17px)] tracking-[-0.02em] text-[#F5F2ED]">Ananya Rao</span>
          <span className="block [font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] uppercase text-[#8A857B] mt-1">Founder, Redpanda Outdoor</span>
        </span>
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] text-[#8A857B]">01:38</span>
      </button>
      <button data-vt-item="" type="button" className="flex items-center gap-3.5 w-full text-left bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.18)] py-3.5 px-0 cursor-pointer [transition:padding-left_.5s_cubic-bezier(.16,1,.3,1)] hover:pl-2">
        <span data-vt-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] text-[#8A857B] w-[22px]">03</span>
        <span className="[flex:0_0_auto] w-16 h-11 rounded-[4px] overflow-hidden bg-[#1A1815]"><img src="/images/3143905490.jpg" alt="" className="w-full h-full object-cover block" /></span>
        <span className="[flex:1_1_auto] min-w-0">
          <span className="block [font-family:'Archivo',sans-serif] font-bold text-[clamp(14px,1.25vw,17px)] tracking-[-0.02em] text-[#F5F2ED]">Dev Menon</span>
          <span className="block [font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] uppercase text-[#8A857B] mt-1">CTO, Orbital</span>
        </span>
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] text-[#8A857B]">02:02</span>
      </button>
      <button data-vt-item="" type="button" className="flex items-center gap-3.5 w-full text-left bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.18)] py-3.5 px-0 cursor-pointer [transition:padding-left_.5s_cubic-bezier(.16,1,.3,1)] hover:pl-2">
        <span data-vt-idx="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] text-[#8A857B] w-[22px]">04</span>
        <span className="[flex:0_0_auto] w-16 h-11 rounded-[4px] overflow-hidden bg-[#1A1815]"><img src="/images/b7afa59dc4.jpg" alt="" className="w-full h-full object-cover block" /></span>
        <span className="[flex:1_1_auto] min-w-0">
          <span className="block [font-family:'Archivo',sans-serif] font-bold text-[clamp(14px,1.25vw,17px)] tracking-[-0.02em] text-[#F5F2ED]">Leela Fernandes</span>
          <span className="block [font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] uppercase text-[#8A857B] mt-1">Publisher, Margin Press</span>
        </span>
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10px] tracking-[.12em] text-[#8A857B]">01:12</span>
      </button>
      <p className="mt-[auto] mx-0 mb-0 pt-[clamp(20px,3vw,34px)] text-[14px] leading-[1.55] text-[#8A857B]">Auto-playing. Hover the frame to hold, click to watch the full cut.</p>
    </div>
  </div>
</section>

{/* Hidden in the content update: What we do (originally (04)). Uncomment to restore, then renumber the eyebrows.
<section id="services" className="relative z-[1] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(30px,5vw,64px)]">
    <span>(04) What we do</span>
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
*/}

{/* Hidden in the content update: In-house (originally (05)). Uncomment to restore, then renumber the eyebrows.
<section className="relative z-[1] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(24px,5vw,80px)] items-start mb-[clamp(36px,6vw,80px)]">
    <div className="[flex:1_1_min(100%,260px)]">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] [border-top:1px_solid_rgba(245,242,237,.15)] pt-3">(05) In-house</div>
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
*/}

<section data-dark="" data-ag-flip="" className="relative z-[1] text-[#F7F4EF] pt-[clamp(60px,9vw,130px)] px-0 pb-[clamp(70px,10vw,150px)]">
  <div className="py-0 px-[clamp(20px,4.4vw,64px)]">
    <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
      <span>(04) Content studio</span>
      <span className="text-[var(--ag-accent,#F2600C)]">Shot in-house</span>
    </div>
    <h2 className="mt-[clamp(22px,3vw,44px)] mx-0 mb-[clamp(18px,2.4vw,32px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,7.4vw,6.6rem)] leading-[.92] tracking-[-0.045em] max-w-[16ch]">THE <span className="text-[var(--ag-accent,#F2600C)]">CAMERA</span> NEVER LEAVES THE BUILDING.</h2>
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

{/* Hidden in the content update: Technology (originally (07)). Uncomment to restore, then renumber the eyebrows.
<section data-dark="" className="relative z-[1] text-[#F7F4EF] py-[clamp(72px,11vw,170px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(237,233,225,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(07) Technology</span>
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
*/}

<section data-dark="" className="relative z-[1] text-[#F7F4EF] py-[clamp(70px,10vw,150px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(26px,5vw,90px)] items-start">
    <div className="[flex:1_1_min(100%,280px)] sticky top-[110px] max-lg:static">
      <div data-eyebrow="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B] [border-top:1px_solid_rgba(247,244,239,.16)] pt-3">(05) For founders</div>
      <h2 className="mt-[clamp(18px,2.4vw,32px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2rem,5.2vw,4.6rem)] leading-[.92] tracking-[-0.045em]">ZERO<br />TO<br /><span className="text-[var(--ag-accent,#F2600C)]">LAUNCH.</span></h2>
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
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(06) Contact</span>
    <span>Taking projects for Q1 2027</span>
  </div>

  <h2 className="mt-[clamp(34px,6vw,90px)] mx-0 mb-[clamp(30px,4vw,60px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,9.6vw,9.5rem)] leading-[.88] tracking-[-0.048em] [font-variation-settings:'wdth'_104]">HAVE A THING<br />WORTH <span className="text-[var(--ag-accent,#F2600C)]">BUILDING?</span></h2>

  <div className="flex flex-wrap gap-[clamp(30px,6vw,110px)] items-start pb-[clamp(50px,8vw,110px)]">
    <form data-ag-form="" className="[flex:2_1_min(100%,320px)] flex flex-col gap-[clamp(18px,2.4vw,30px)]">
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">Name</span>
        <input type="text" name="name" required placeholder="Your name" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-2 px-0 text-[clamp(16px,1.5vw,20px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">Email</span>
        <input type="email" name="email" required placeholder="you@company.com" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-2 px-0 text-[clamp(16px,1.5vw,20px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
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
        <a href="mailto:info@arohance.com" className="text-[clamp(16px,1.5vw,21px)] [border-bottom:1px_solid_rgba(237,233,225,.3)] pb-0.5 max-lg:inline-block max-lg:py-3">info@arohance.com</a>
        <div className="mt-3 flex flex-col gap-[7px] text-[clamp(15px,1.4vw,19px)]"><a href="tel:+919427673035" className="max-lg:py-3">+91 94276 73035</a><a href="tel:+919727361979" className="max-lg:py-3">+91 97273 61979</a></div>
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
        <div className="text-[clamp(15px,1.4vw,19px)] leading-[1.5]">Jayanagar 9th Block, Bangalore<br />Karnataka, India, 560069</div>
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
<HomeRuntime />
</div>
</>
  );
}

/** The cards after the lead one, then the call to action (`null`), in rows of two. */
const REST = [...WORK.slice(1), null];
const WORK_ROWS = Array.from({ length: Math.ceil(REST.length / 2) }, (_, r) => REST.slice(r * 2, r * 2 + 2));
const ROW_SHAPES = [['tall', 'drop'], ['wide', 'side']] as const;

/** Card shape: [flex sizing in its row, image aspect]. */
const SHAPES = {
  lead: ['', '[aspect-ratio:16/8]'],
  tall: ['[flex:1_1_min(100%,320px)]', '[aspect-ratio:4/5]'],
  drop: ['[flex:1_1_min(100%,320px)] mt-[clamp(0px,9vw,160px)]', '[aspect-ratio:4/5]'],
  wide: ['[flex:2_1_min(100%,420px)]', '[aspect-ratio:16/10]'],
  side: ['[flex:1_1_min(100%,240px)]', '[aspect-ratio:4/5]'],
} as const;

function WorkCard({ w, n, shape }: { w: Work; n: number; shape: keyof typeof SHAPES }) {
  const [flex, aspect] = SHAPES[shape];
  return (
    <Link href={workHref(w)} data-hover-group="" data-cursor="View" className={`flex flex-col gap-3.5 text-[#0A0A0A] ${flex}`}>
      <div className={`relative overflow-hidden w-[85%] ${aspect} rounded-[6px] bg-[#1A1815]`}>
        <div data-hover-img="" data-parallax="0.18" className="absolute left-0 right-0 top-[-6%] h-[112%] [transition:transform_.9s_cubic-bezier(.16,1,.3,1)]"><Image src={w.image.src} alt={w.image.alt} width={w.image.width} height={w.image.height} priority={n === 1} className="h-full w-full object-cover" /></div>
        <span className="absolute left-[clamp(12px,1.6vw,20px)] top-[clamp(12px,1.6vw,20px)] [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#0A0A0A] bg-[#F5F2ED] rounded-[999px] py-1.5 px-[11px] max-lg:left-2 max-lg:top-2 max-lg:max-w-[calc(100%-16px)] max-lg:text-[9px] max-lg:tracking-[.06em] max-lg:py-1 max-lg:px-2">{w.tags}</span>
      </div>
      <div className="flex justify-between items-start gap-[18px] [border-top:1px_solid_rgba(10,10,10,.2)] pt-3">
        <div className="flex gap-[clamp(12px,1.6vw,22px)] items-baseline min-w-0">
          <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] text-[#0A0A0A]">{String(n).padStart(2, '0')}</span>
          <div className="min-w-0">
            <div data-hover-title="" data-split="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(1.3rem,2.6vw,2.4rem)] leading-[1] tracking-[-0.035em] uppercase [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">{w.client}</div>
            <p className="mt-[9px] mx-0 mb-0 max-w-[44ch] text-[clamp(14px,1.15vw,16px)] leading-[1.5] text-[#0A0A0A]/80">{w.summary}</p>
          </div>
        </div>
        <span aria-hidden="true" className="[flex:0_0_auto] [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] text-[#0A0A0A]/80">↗</span>
      </div>
    </Link>
  );
}
