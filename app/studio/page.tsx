// Generated + hand-augmented — read before editing.
//
// Starting point: `tools/convert.mjs studio` (parses
// `.source/templates/studio.html`, rewrites inline styles to Tailwind
// classes) -> `.source/jsx/studio.jsx`, hand-merged into this file once
// (swapping `<img>` for `next/image`; the converter already emits
// `next/link`'s `<Link>` for internal anchors, so that part needed no
// manual swap; wiring up `StudioRuntime`). Since that merge, 19 `max-lg:`
// responsive classes were hand-added directly in this file during the
// mobile responsive pass — `tools/convert.mjs` does not produce these and
// has no notion of a breakpoint at all.
//
// A wrong class string is a converter bug: fix `tools/tw.mjs`, not the
// string here. Do NOT "fix" a class by regenerating and pasting over this
// file — that silently deletes all 19 `max-lg:` classes, this page goes
// back to desktop-only, and neither `tools/compare.mjs` (checks 1440 only)
// nor a passing build says anything. See README.md, "Changing the
// converter", for the actual procedure.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import StudioRuntime from './studio-runtime';
import WorksPanel from '@/components/WorksPanel';
import SocialLinks from '@/components/SocialLinks';

// Page name first so Google's sitelinks read "Studio", then this page's own
// h1 ("A Studio, Not a Supply Chain"); description is the hero copy.
export const metadata: Metadata = {
  title: { absolute: 'Arohance Studio: A Studio, Not a Supply Chain' },
  description:
    'Arohance is a tech and marketing studio, built engineers first, then the camera, then the brand people, so nothing we sell is quietly subcontracted.',
};

export default function Studio() {
  return (
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">

<nav data-ag-nav="" className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]">
  <Link href="/" className="flex items-center"><Image data-ag-logo="" src="/images/logo.png" alt="Arohance, Tech &amp; Marketing" width={422} height={133} priority className="h-[46px] w-auto block [filter:none] [transition:filter_.45s_ease,height_.45s_ease]" /></Link>
  <div className="flex items-center gap-2.5">
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

    <WorksPanel />

    <div data-ag-menu-panel="" className="[flex:0_1_min(100%,420px)] flex flex-col justify-between gap-[clamp(30px,6vh,64px)] min-h-[min(560px,76vh)] bg-[#1F1E1C] text-[#EDE9E1] rounded-[16px] pt-5 px-[clamp(20px,2.4vw,30px)] pb-[clamp(24px,3vh,34px)] opacity-[0] [transform:translate3d(28px,0,0)] [transition:opacity_.5s_ease,transform_.6s_cubic-bezier(.16,1,.3,1)] pointer-events-none max-lg:w-full max-lg:flex-none">
      <div>
        <div className="flex items-center justify-between gap-4 text-[#8A857B]">
          <span className="text-[17px]">→</span>
          <button data-ag-close="" type="button" aria-label="Close menu" className="w-[30px] h-[30px] border-0 bg-[transparent] text-[#B7B1A6] flex items-center justify-center cursor-pointer text-[19px] leading-[1] [transition:color_.3s] hover:text-[#EDE9E1] max-lg:w-[40px] max-lg:h-[40px]">✕</button>
        </div>
        <div className="flex flex-col mt-[clamp(12px,2vh,22px)]">
          <Link data-ag-mlink="" href="/" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Home <span className="text-[.5em] text-[#8A857B]">→</span></Link>
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
          <SocialLinks />
        </div>
      </div>
    </div>

  </div>
</div>

<header className="pt-[clamp(100px,15vh,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(30px,4.5vw,60px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-4 flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
    <span>The studio</span>
    <span className="flex items-center gap-[9px]"><span className="w-1.5 h-1.5 bg-[var(--ag-accent,#F2600C)] rounded-[50%] [animation:ag-pulse_2.6s_infinite]"></span>14 people, India</span>
    <span data-ag-clock="">00:00</span>
  </div>

  <h1 className="mt-[clamp(30px,5vw,70px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.9rem,12.4vw,12.5rem)] leading-[.86] tracking-[-0.05em] [font-variation-settings:'wdth'_106]">
    <span className="block">A STUDIO,</span>
    <span className="block">NOT A</span>
    <span className="block">SUPPLY CHAIN.</span>
  </h1>

  <div className="flex justify-between gap-[clamp(20px,5vw,70px)] flex-wrap mt-[clamp(28px,4vw,56px)]">
    <p data-reveal="" className="m-0 max-w-[52ch] text-[clamp(15px,1.4vw,19px)] leading-[1.55] text-[#A9A39A]">Arohance is a tech and marketing studio. We were put together the other way round from most agencies: engineers first, then the camera, then the brand people, so that nothing we sell has to be quietly subcontracted the week after the pitch.</p>
    <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase text-[#8C877E] leading-[2]">Founded 2021<br />Bengaluru, worldwide<br />14 people, 4 disciplines</div>
  </div>
</header>

<section data-cursor="Studio" className="relative h-[clamp(300px,74vh,800px)] overflow-hidden">
  <div data-parallax="0.5" className="absolute left-0 right-0 top-[-9%] h-[118%]">
    <Image src="/images/b7afa59dc4.jpg" alt="The studio floor, wide" width={950} height={535} priority className="h-full w-full object-cover" />
  </div>
</section>

<section className="py-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(26px,4vw,56px)]">
    <span>(01) How we think</span>
    <span>Four positions</span>
  </div>

  <div className="flex justify-between items-baseline gap-[clamp(14px,3vw,40px)] [border-top:1px_solid_rgba(245,242,237,.15)] py-[clamp(16px,2vw,26px)] px-0 flex-wrap">
    <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E]">01</span>
    <h3 className="[flex:1_1_min(100%,240px)] m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.4rem,3.4vw,2.9rem)] leading-[1.04] tracking-[-0.035em]">The idea has to survive the build.</h3>
    <p className="[flex:1_1_min(100%,280px)] m-0 max-w-[44ch] text-[15px] leading-[1.6] text-[#A9A39A]">Concepts that can&apos;t be engineered aren&apos;t concepts, they&apos;re decks. Ours are pressure-tested by the people who will have to ship them.</p>
  </div>
  <div className="flex justify-between items-baseline gap-[clamp(14px,3vw,40px)] [border-top:1px_solid_rgba(245,242,237,.15)] py-[clamp(16px,2vw,26px)] px-0 flex-wrap">
    <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E]">02</span>
    <h3 className="[flex:1_1_min(100%,240px)] m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.4rem,3.4vw,2.9rem)] leading-[1.04] tracking-[-0.035em]">Small team, senior hands.</h3>
    <p className="[flex:1_1_min(100%,280px)] m-0 max-w-[44ch] text-[15px] leading-[1.6] text-[#A9A39A]">Fourteen people, no account layer. The person who answers your email is the person doing the work.</p>
  </div>
  <div className="flex justify-between items-baseline gap-[clamp(14px,3vw,40px)] [border-top:1px_solid_rgba(245,242,237,.15)] py-[clamp(16px,2vw,26px)] px-0 flex-wrap">
    <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E]">03</span>
    <h3 className="[flex:1_1_min(100%,240px)] m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.4rem,3.4vw,2.9rem)] leading-[1.04] tracking-[-0.035em]">Own the whole pipeline.</h3>
    <p className="[flex:1_1_min(100%,280px)] m-0 max-w-[44ch] text-[15px] leading-[1.6] text-[#A9A39A]">Camera, edit, design, code, deploy. Owning every stage is what makes an eleven-week launch possible.</p>
  </div>
  <div className="flex justify-between items-baseline gap-[clamp(14px,3vw,40px)] [border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)] py-[clamp(16px,2vw,26px)] px-0 flex-wrap">
    <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E]">04</span>
    <h3 className="[flex:1_1_min(100%,240px)] m-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.4rem,3.4vw,2.9rem)] leading-[1.04] tracking-[-0.035em]">Hand it over properly.</h3>
    <p className="[flex:1_1_min(100%,280px)] m-0 max-w-[44ch] text-[15px] leading-[1.6] text-[#A9A39A]">Your accounts, your repositories, your files, documented. No hostage infrastructure, ever.</p>
  </div>
</section>

<section data-dark="" className="bg-[#131110] text-[#EDE9E1] py-[clamp(70px,11vw,170px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(26px,5vw,90px)] items-start">
    <div className="[flex:1_1_min(100%,280px)]">
      <div data-eyebrow="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B] [border-top:1px_solid_rgba(237,233,225,.18)] pt-3">(02) Under one roof</div>
      <h2 className="mt-[clamp(20px,3vw,40px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,5.4vw,4.8rem)] leading-[.96] tracking-[-0.045em]">FOUR ROOMS.<br /><span className="text-[var(--ag-accent,#F2600C)]">ONE FLOOR.</span></h2>
      <p className="mt-[clamp(18px,2.4vw,30px)] mx-0 mb-0 max-w-[42ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#B7B1A6]">There is no handover email between these rooms, because there is no wall between them. A shoot can be reframed at 3pm because the developer said the hero needs vertical room.</p>
    </div>
    <div className="[flex:1_1_min(100%,300px)]">
      <div className="flex justify-between gap-3.5 [border-top:1px_solid_rgba(237,233,225,.18)] py-4 px-0 text-[clamp(15px,1.5vw,20px)]"><span>Strategy room</span><span className="[flex:0_1_auto] max-w-[24ch] text-[#8A857B] text-[12px] text-right">Positioning, naming, measurement</span></div>
      <div className="flex justify-between gap-3.5 [border-top:1px_solid_rgba(237,233,225,.18)] py-4 px-0 text-[clamp(15px,1.5vw,20px)]"><span>Studio floor</span><span className="[flex:0_1_auto] max-w-[24ch] text-[#8A857B] text-[12px] text-right">Stills, film, product, talent</span></div>
      <div className="flex justify-between gap-3.5 [border-top:1px_solid_rgba(237,233,225,.18)] py-4 px-0 text-[clamp(15px,1.5vw,20px)]"><span>Edit suite</span><span className="[flex:0_1_auto] max-w-[24ch] text-[#8A857B] text-[12px] text-right">Cut, grade, sound, social versions</span></div>
      <div className="flex justify-between gap-3.5 [border-top:1px_solid_rgba(237,233,225,.18)] [border-bottom:1px_solid_rgba(237,233,225,.18)] py-4 px-0 text-[clamp(15px,1.5vw,20px)]"><span>Engineering</span><span className="[flex:0_1_auto] max-w-[24ch] text-[#8A857B] text-[12px] text-right">Web, platforms, integrations, infra</span></div>
    </div>
  </div>

  <div className="flex flex-wrap gap-[clamp(16px,2.6vw,36px)] mt-[clamp(40px,6vw,90px)]">
    <div className="[flex:2_1_min(100%,300px)] relative overflow-hidden h-[clamp(240px,44vh,480px)]">
      <div data-parallax="0.35" className="absolute left-0 right-0 top-[-8%] h-[116%]"><Image src="/images/df2ee54140.jpg" alt="Edit suite / desk" width={950} height={678} className="h-full w-full object-cover" /></div>
    </div>
    <div className="[flex:1_1_min(100%,220px)] relative overflow-hidden h-[clamp(240px,44vh,480px)]">
      <div data-parallax="0.6" className="absolute left-0 right-0 top-[-9%] h-[118%]"><Image src="/images/3143905490.jpg" alt="On set" width={900} height={600} className="h-full w-full object-cover" /></div>
    </div>
  </div>
</section>

<section className="py-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(30px,4.5vw,64px)]">
    <span>(03) The team</span>
    <span>Hover for the long version</span>
  </div>

  <div className="flex flex-wrap gap-[clamp(14px,2vw,28px)] max-sm:grid max-sm:grid-cols-2">
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)]">
      <div className="relative overflow-hidden h-[clamp(300px,54vh,540px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/38e05568d7.jpg" alt="NEER, portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px]">
        <div className="flex justify-between items-baseline gap-2.5">
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">NEER</div>
          <span className="text-[13px] text-[#8C877E]">↗</span>
        </div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Founder &amp; CEO</div>
        <p className="mt-2.5 mx-0 mb-0 text-[14px] leading-[1.55] text-[#A9A39A]">Sets the brief, sits in every kickoff, and is the last read before anything ships.</p>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)] mt-[clamp(0px,3vw,48px)]">
      <div className="relative overflow-hidden h-[clamp(300px,54vh,540px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/e268c52122.jpg" alt="KV, portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px]">
        <div className="flex justify-between items-baseline gap-2.5">
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">KV</div>
          <span className="text-[13px] text-[#8C877E]">↗</span>
        </div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Chief Marketing Officer</div>
        <p className="mt-2.5 mx-0 mb-0 text-[14px] leading-[1.55] text-[#A9A39A]">Owns the campaign calendar and the argument for why anyone should care.</p>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)]">
      <div className="relative overflow-hidden h-[clamp(300px,54vh,540px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/70cc6c9b51.jpg" alt="Rohan Sunwar, portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px]">
        <div className="flex justify-between items-baseline gap-2.5">
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">ROHAN SUNWAR</div>
          <span className="text-[13px] text-[#8C877E]">↗</span>
        </div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Technology &amp; Product</div>
        <p className="mt-2.5 mx-0 mb-0 text-[14px] leading-[1.55] text-[#A9A39A]">Architecture, platforms and the unglamorous parts that keep running at 3am.</p>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)] mt-[clamp(0px,3vw,48px)]">
      <div className="relative overflow-hidden h-[clamp(300px,54vh,540px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/987a91d473.jpg" alt="Portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px]">
        <div className="flex justify-between items-baseline gap-2.5">
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">AYESHA KHAN</div>
          <span className="text-[13px] text-[#8C877E]">↗</span>
        </div>
        <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Content &amp; Production</div>
        <p className="mt-2.5 mx-0 mb-0 text-[14px] leading-[1.55] text-[#A9A39A]">Runs the floor: shoot schedules, crew, talent and the monthly content engine.</p>
      </div>
    </div>
  </div>

  <div className="flex flex-wrap gap-[clamp(14px,2vw,28px)] mt-[clamp(20px,3vw,40px)] max-sm:grid max-sm:grid-cols-2">
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)]">
      <div className="relative overflow-hidden h-[clamp(260px,42vh,420px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/1d4dca23b7.jpg" alt="Portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px] flex justify-between items-baseline gap-2.5">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">VIKRAM DESAI</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Creative direction</div>
        </div>
        <span className="text-[13px] text-[#8C877E]">↗</span>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,220px)]">
      <div className="relative overflow-hidden h-[clamp(260px,42vh,420px)] max-sm:h-auto max-sm:aspect-[3/4]">
        <div data-hover-img="" className="absolute inset-0"><Image src="/images/4f6262c929.jpg" alt="Portrait" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="[border-top:1px_solid_rgba(245,242,237,.15)] mt-3 pt-[11px] flex justify-between items-baseline gap-2.5">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(16px,1.6vw,21px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">SANA QURESHI</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] mt-1.5">Engineering</div>
        </div>
        <span className="text-[13px] text-[#8C877E]">↗</span>
      </div>
    </div>
    <div className="[flex:1_1_min(100%,220px)] flex flex-col justify-end pb-3">
      <p className="m-0 max-w-[34ch] text-[15px] leading-[1.6] text-[#A9A39A]">Plus eight more across production, design and engineering, and a bench of regular collaborators when a shoot needs scale.</p>
      <Link href="/contact" className="inline-flex items-center gap-2.5 mt-[18px] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.4vw,19px)] [border-bottom:1px_solid_currentColor] pb-[3px] [align-self:flex-start] max-lg:py-3">Work with us <span>→</span></Link>
    </div>
  </div>
</section>

<section className="pt-0 px-[clamp(20px,4.4vw,64px)] pb-[clamp(60px,9vw,140px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(24px,3.5vw,48px)]">
    <span>(04) Selected clients</span>
    <span>2021–2026</span>
  </div>
  <div className="flex flex-wrap gap-[0_clamp(28px,6vw,100px)]">
    <div className="[flex:1_1_min(100%,300px)]">
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Agasti Realty</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Real estate, 2026</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Redpanda Outdoor</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Outdoor gear, 2025</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Orbital</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Fintech, 2025</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Margin Press</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Publishing, 2025</span></div>
    </div>
    <div className="[flex:1_1_min(100%,300px)]">
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Atlas Labs</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Robotics, 2024</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Vera Hotels</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Hospitality, 2024</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Field &amp; Foundry</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Manufacturing, 2023</span></div>
      <div className="flex justify-between items-baseline gap-4 [border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)] py-[13px] px-0"><span className="[font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.1rem,2.2vw,1.8rem)] tracking-[-0.03em]">Second Sun</span><span className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">Energy, 2023</span></div>
    </div>
  </div>
</section>

<section data-dark="" className="bg-[#131110] text-[#EDE9E1] pt-[clamp(70px,11vw,160px)] px-[clamp(20px,4.4vw,64px)] pb-0">
  <Link href="/contact" data-hover-group="" className="block">
    <h2 data-hover-title="" className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,10vw,10rem)] leading-[.88] tracking-[-0.05em] [transition:transform_.7s_cubic-bezier(.16,1,.3,1)]">TELL US WHAT<br />YOU&apos;RE MAKING <span className="text-[var(--ag-accent,#F2600C)]">→</span></h2>
  </Link>
  <footer className="[border-top:1px_solid_rgba(237,233,225,.18)] mt-[clamp(50px,8vw,110px)]">
    <div className="flex justify-between gap-4 flex-wrap py-4 px-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] max-lg:items-center">
      <span>© 2026 Arohance</span>
      <span className="flex gap-[18px]"><Link href="/#work" className="max-lg:px-2 max-lg:py-4">Work</Link><Link href="/contact" className="max-lg:px-2 max-lg:py-4">Contact</Link><Link href="/" className="max-lg:px-2 max-lg:py-4">Home</Link></span>
    </div>
    <div className="overflow-hidden leading-[.74] mb-[-0.09em] [container-type:inline-size]">
      <span className="block [font-family:'Archivo',sans-serif] font-bold text-[15.2cqw] tracking-[-0.05em] [font-variation-settings:'wdth'_104] whitespace-nowrap">AROHANCE®</span>
    </div>
  </footer>
</section>

<ContactPill />
<StudioRuntime />
</div>
  );
}
