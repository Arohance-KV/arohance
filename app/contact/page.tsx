// Generated + hand-augmented — read before editing.
//
// Starting point: `tools/convert.mjs contact` (parses
// `.source/templates/contact.html`, rewrites inline styles to Tailwind
// classes) -> `.source/jsx/contact.jsx`, hand-merged into this file once
// (swapping `<img>` for `next/image`; the converter already emits
// `next/link`'s `<Link>` for internal anchors, so that part needed no
// manual swap; wiring up `ContactRuntime`). Since that merge, 28 `max-lg:`
// responsive classes were hand-added directly in this file during the
// mobile responsive pass — `tools/convert.mjs` does not produce these and
// has no notion of a breakpoint at all.
//
// A wrong class string is a converter bug: fix `tools/tw.mjs`, not the
// string here. Do NOT "fix" a class by regenerating and pasting over this
// file — that silently deletes all 28 `max-lg:` classes, this page goes
// back to desktop-only, and neither `tools/compare.mjs` (checks 1440 only)
// nor a passing build says anything. See README.md, "Changing the
// converter", for the actual procedure.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import ContactRuntime from './contact-runtime';

// Derived from this page's own eyebrow ("Contact") and h1 ("Have a Thing
// Worth Building?") — not invented marketing copy. `%s — Arohance` (root
// layout).
export const metadata: Metadata = {
  title: 'Have a Thing Worth Building?',
};

export default function Contact() {
  return (
<div data-ag-root="" data-dark="" className="bg-[#131110] text-[#EDE9E1] relative overflow-clip min-h-[100svh]">

<nav data-ag-nav="" className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]">
  <Link href="/" className="flex items-center"><Image data-ag-logo="" src="/images/93c7aab596.png" alt="Arohance, Tech &amp; Marketing" width={422} height={133} priority className="h-[46px] w-auto block [transition:filter_.45s_ease,height_.45s_ease]" /></Link>
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
          <Link data-ag-mlink="" href="/services" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Services <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/about" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">About <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/studio" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Studio <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/careers" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#F5F2ED] hover:pl-2.5">Careers <span className="text-[.5em] text-[#8A857B]">→</span></Link>
          <Link data-ag-mlink="" href="/contact" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Contact <span className="text-[.5em] text-[#8A857B]">→</span></Link>
        </div>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-3.5">Media</div>
        <div className="flex flex-col gap-[7px] text-[14.5px] font-medium">
          <a href="https://www.linkedin.com/company/arohance-india/" target="_blank" rel="noopener noreferrer" className="max-lg:py-3">LinkedIn</a>
          <a href="https://www.instagram.com/arohance" target="_blank" rel="noopener noreferrer" className="max-lg:py-3">Instagram</a>
        </div>
      </div>
    </div>

  </div>
</div>

<header className="pt-[clamp(100px,15vh,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(30px,4vw,56px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-4 flex-wrap [border-top:1px_solid_rgba(237,233,225,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>Contact</span>
    <span className="flex items-center gap-[9px]"><span className="w-1.5 h-1.5 bg-[var(--ag-accent,#F2600C)] rounded-[50%] [animation:ag-pulse_2.6s_infinite]"></span>Taking new projects</span>
    <span data-ag-clock="">00:00</span>
  </div>

  <h1 className="mt-[clamp(34px,6vw,84px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.6rem,10.4vw,10.5rem)] leading-[.87] tracking-[-0.05em] [font-variation-settings:'wdth'_104]">
    <span className="block">HAVE A THING</span>
    <span className="block">WORTH <span className="text-[var(--ag-accent,#F2600C)]">BUILDING?</span></span>
  </h1>

  <p data-reveal="" className="mt-[clamp(24px,3.5vw,44px)] mx-0 mb-0 max-w-[50ch] text-[clamp(15px,1.4vw,19px)] leading-[1.55] text-[#B7B1A6]">A paragraph is plenty. Tell us what it is, roughly when, and we&apos;ll come back within a working day with either a plan or an honest no.</p>
</header>

<section className="pt-[clamp(30px,5vw,70px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(60px,9vw,130px)]">
  <div className="flex flex-wrap gap-[clamp(34px,6vw,110px)] items-start">
    <form data-ag-form="" className="[flex:2_1_min(100%,340px)] flex flex-col gap-[clamp(20px,2.6vw,32px)]">
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">01, Name</span>
        <input type="text" name="name" required placeholder="Your name" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">02, Company</span>
        <input type="text" name="company" placeholder="Where you work" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">03, Email</span>
        <input type="email" name="email" required placeholder="you@company.com" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">04, Phone</span>
        <input type="tel" name="phone" autoComplete="tel" required placeholder="+91 98765 43210" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3" />
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">05, What are you building</span>
        <textarea name="brief" rows={4} placeholder="A sentence is enough." className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] [resize:vertical] [font-family:inherit] focus:[border-bottom-color:var(--ag-accent,#F2600C)]"></textarea>
      </label>
      <label className="flex flex-col gap-[9px]">
        <span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B]">06, Rough budget</span>
        <select name="budget" className="bg-[transparent] border-0 [border-bottom:1px_solid_rgba(237,233,225,.28)] rounded-[0] py-[9px] px-0 text-[clamp(16px,1.6vw,22px)] [outline:none] [appearance:none] focus:[border-bottom-color:var(--ag-accent,#F2600C)] max-lg:py-3">
          <option>Not sure yet</option>
          <option>Under ₹5L</option>
          <option>₹5L, ₹15L</option>
          <option>₹15L, ₹40L</option>
          <option>₹40L +</option>
        </select>
      </label>
      <button data-ag-submit="" type="submit" className="[align-self:flex-start] mt-2 bg-[transparent] border-0 [border-bottom:1px_solid_currentColor] pt-0 px-0 pb-[5px] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(19px,2.4vw,32px)] tracking-[-0.025em] cursor-pointer [transition:color_.3s] hover:text-[var(--ag-accent,#F2600C)] max-lg:py-2.5">Send it →</button>
    </form>

    <div className="[flex:1_1_min(100%,240px)] flex flex-col gap-[clamp(22px,3vw,38px)]">
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-2.5">Direct</div>
        <a href="mailto:info@arohance.com" className="inline-block text-[clamp(17px,1.7vw,23px)] [border-bottom:1px_solid_rgba(237,233,225,.3)] pb-[3px] max-lg:py-3">info@arohance.com</a>
        <div className="mt-3 flex flex-col gap-1 text-[clamp(15px,1.4vw,19px)] text-[#B7B1A6]"><a href="tel:+919427673035" className="max-lg:py-3">+91 94276 73035</a><a href="tel:+919727361979" className="max-lg:py-3">+91 97273 61979</a></div>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-2.5">Elsewhere</div>
        <div className="flex flex-col gap-2 text-[clamp(15px,1.4vw,19px)]">
          <a href="https://www.instagram.com/arohance" target="_blank" rel="noopener noreferrer" className="max-lg:py-3">Instagram, @arohance</a>
          <a href="https://www.linkedin.com/company/arohance-india/" target="_blank" rel="noopener noreferrer" className="max-lg:py-3">LinkedIn, /company/arohance-india</a>
        </div>
      </div>
      <div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-2.5">Studio</div>
        <div className="text-[clamp(15px,1.4vw,19px)] leading-[1.5] text-[#B7B1A6]">Jayanagar 9th Block, Bangalore<br />Karnataka, India, 560069<br />Mon–Fri, 10:00–19:00 IST</div>
      </div>
    </div>
  </div>
</section>

<section className="pt-0 px-[clamp(20px,4.4vw,64px)] pb-[clamp(60px,9vw,140px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(237,233,225,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B] mb-[clamp(26px,4vw,52px)]">
    <span>What happens next</span>
    <span>Three steps, no deck</span>
  </div>
  <div className="flex flex-wrap gap-[clamp(20px,4vw,60px)]">
    <div className="[flex:1_1_min(100%,250px)] [border-top:1px_solid_rgba(237,233,225,.18)] pt-4">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] mb-3.5">01</div>
      <h3 className="m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.03em]">A 30-minute call</h3>
      <p className="mt-3 mx-0 mb-0 text-[15px] leading-[1.6] text-[#B7B1A6]">With the people who&apos;d actually do the work. No sales team, no capabilities deck.</p>
    </div>
    <div className="[flex:1_1_min(100%,250px)] [border-top:1px_solid_rgba(237,233,225,.18)] pt-4">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] mb-3.5">02</div>
      <h3 className="m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.03em]">A one-page plan</h3>
      <p className="mt-3 mx-0 mb-0 text-[15px] leading-[1.6] text-[#B7B1A6]">Scope, sequence, team and a fixed number. Usually within four working days.</p>
    </div>
    <div className="[flex:1_1_min(100%,250px)] [border-top:1px_solid_rgba(237,233,225,.18)] pt-4">
      <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8A857B] mb-3.5">03</div>
      <h3 className="m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.03em]">We start</h3>
      <p className="mt-3 mx-0 mb-0 text-[15px] leading-[1.6] text-[#B7B1A6]">Kickoff inside two weeks, with the strategy, studio and engineering rooms all in it.</p>
    </div>
  </div>
</section>

<footer className="py-0 px-[clamp(20px,4.4vw,64px)] [border-top:1px_solid_rgba(237,233,225,.18)]">
  <div className="flex justify-between gap-4 flex-wrap py-4 px-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] max-lg:items-center">
    <span>© 2026 Arohance, Tech &amp; Marketing</span>
    <span className="flex gap-[18px]"><Link href="/#work" className="max-lg:px-2 max-lg:py-4">Work</Link><Link href="/studio" className="max-lg:px-2 max-lg:py-4">Studio</Link><Link href="/" className="max-lg:px-2 max-lg:py-4">Home</Link></span>
  </div>
  <div className="overflow-hidden leading-[.74] mb-[-0.09em] [container-type:inline-size]">
    <span className="block [font-family:'Archivo',sans-serif] font-bold text-[15.2cqw] tracking-[-0.05em] [font-variation-settings:'wdth'_104] whitespace-nowrap">AROHANCE®</span>
  </div>
</footer>

<ContactPill />
<ContactRuntime />
</div>
  );
}
