import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import AboutRuntime from './about-runtime';

export default function About() {
  return (
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">

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
          <Link data-ag-mlink="" href="/case-study" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Work <span className="text-[.5em] text-[#8A857B]">→</span></Link>
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

<header id="top" className="relative min-h-[88svh] flex items-end pt-[clamp(120px,18vh,200px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(40px,6vh,80px)] overflow-hidden">
  <div data-ag-ether="" className="absolute inset-0 z-[0] bg-[#0C0B0A] overflow-hidden"></div>
  <div className="relative z-[2] [flex:1_1_auto] flex flex-col gap-[clamp(26px,4vh,52px)] pointer-events-none">
    <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">+ (About us)</div>
    <h1 className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.5rem,9vw,10rem)] leading-[.86] tracking-[-0.048em] [font-variation-settings:'wdth'_106]">
      <span data-reveal="" data-delay="0" className="block">SMALL ON</span>
      <span data-reveal="" data-delay="90" className="block text-[var(--ag-accent,#F2600C)]">PURPOSE.</span>
    </h1>
    <p data-reveal="" className="m-0 max-w-[52ch] text-[clamp(15px,1.35vw,19px)] leading-[1.55] text-[#A9A39A]">Arohance is an independent tech and marketing studio in Bengaluru. Fourteen people across strategy, film, design and engineering, working as one team from the first call to launch day.</p>
  </div>
</header>

<section id="studio" data-dark="" className="bg-[#0C0B0A] text-[#F7F4EF] pt-[clamp(60px,9vw,130px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(70px,10vw,150px)]">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.16)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B] mb-[clamp(26px,4vw,56px)]">
    <span>(01) The studio</span>
    <span>14 people, India</span>
  </div>

  <div className="flex flex-wrap gap-[clamp(24px,4vw,70px)] items-end">
    <p data-reveal="" className="[flex:2_1_min(100%,340px)] m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.4rem,3.4vw,3rem)] leading-[1.1] tracking-[-0.03em] [text-wrap:pretty]">Senior by default. The people you meet in the first call are the people who do the work.</p>
    <div className="[flex:1_1_min(100%,260px)] relative overflow-hidden h-[clamp(240px,40vh,420px)]">
      <div data-parallax="0.35" className="absolute left-0 right-0 top-[-8%] h-[116%]"><Image src="/images/b7afa59dc4.jpg" alt="The studio, wide" width={950} height={535} priority className="h-full w-full object-cover" /></div>
    </div>
  </div>

  <div className="flex flex-wrap gap-[clamp(14px,2vw,28px)] mt-[clamp(44px,7vw,110px)]">
    <div data-hover-group="" className="[flex:1_1_min(100%,210px)]">
      <div className="relative overflow-hidden h-[clamp(300px,52vh,520px)]">
        <div data-hover-img="" className="absolute inset-0 [transition:transform_.9s_cubic-bezier(.16,1,.3,1)]"><Image src="/images/29a3935bff.jpg" alt="Portrait, tall" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="flex justify-between items-baseline gap-2.5 [border-top:1px_solid_rgba(247,244,239,.16)] mt-3 pt-[11px]">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.5vw,20px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">NEER</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] mt-[5px]">Founder &amp; CEO</div>
        </div>
        <span className="text-[13px] text-[#8A857B]">↗</span>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,210px)] mt-[clamp(0px,3vw,48px)]">
      <div className="relative overflow-hidden h-[clamp(300px,52vh,520px)]">
        <div data-hover-img="" className="absolute inset-0 [transition:transform_.9s_cubic-bezier(.16,1,.3,1)]"><Image src="/images/64f3340595.jpg" alt="Portrait, tall" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="flex justify-between items-baseline gap-2.5 [border-top:1px_solid_rgba(247,244,239,.16)] mt-3 pt-[11px]">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.5vw,20px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">KV</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] mt-[5px]">Chief Marketing Officer</div>
        </div>
        <span className="text-[13px] text-[#8A857B]">↗</span>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,210px)]">
      <div className="relative overflow-hidden h-[clamp(300px,52vh,520px)]">
        <div data-hover-img="" className="absolute inset-0 [transition:transform_.9s_cubic-bezier(.16,1,.3,1)]"><Image src="/images/fb23c7b2c7.jpg" alt="Portrait, tall" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="flex justify-between items-baseline gap-2.5 [border-top:1px_solid_rgba(247,244,239,.16)] mt-3 pt-[11px]">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.5vw,20px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">ROHAN SUNWAR</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] mt-[5px]">Technology &amp; Product</div>
        </div>
        <span className="text-[13px] text-[#8A857B]">↗</span>
      </div>
    </div>
    <div data-hover-group="" className="[flex:1_1_min(100%,210px)] mt-[clamp(0px,3vw,48px)]">
      <div className="relative overflow-hidden h-[clamp(300px,52vh,520px)]">
        <div data-hover-img="" className="absolute inset-0 [transition:transform_.9s_cubic-bezier(.16,1,.3,1)]"><Image src="/images/234f5a93d8.jpg" alt="Portrait, tall" width={700} height={900} className="h-full w-full object-cover" /></div>
      </div>
      <div className="flex justify-between items-baseline gap-2.5 [border-top:1px_solid_rgba(247,244,239,.16)] mt-3 pt-[11px]">
        <div>
          <div data-hover-title="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.5vw,20px)] tracking-[-0.02em] [transition:transform_.6s_cubic-bezier(.16,1,.3,1)]">AYESHA KHAN</div>
          <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] mt-[5px]">Content &amp; Production</div>
        </div>
        <span className="text-[13px] text-[#8A857B]">↗</span>
      </div>
    </div>
  </div>
</section>

<div className="relative overflow-hidden bg-[#0C0B0A] py-[clamp(54px,7vw,104px)] px-0">
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

<section id="intro" className="py-[clamp(70px,11vw,170px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex gap-[clamp(26px,5vw,90px)] flex-wrap items-start">
    <div className="[flex:1_1_min(100%,190px)] [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] pt-2.5">+ (How we work)</div>
    <div className="[flex:4_1_min(100%,520px)]">
      <p data-reveal="" className="m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.55rem,3.9vw,3.5rem)] leading-[1.08] tracking-[-0.03em] [font-variation-settings:'wdth'_100] [text-wrap:pretty]">We are designers, developers, strategists, filmmakers and producers working as one team, so the idea that survives the pitch is the same one that ships.</p>
      <div className="flex flex-wrap gap-[0_clamp(24px,5vw,72px)] mt-[clamp(36px,6vw,80px)]">
        <div className="[flex:1_1_min(100%,220px)] [border-top:1px_solid_rgba(245,242,237,.15)] pt-3.5 px-0 pb-[22px]">
          <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[#8C877E] mb-2.5">01</div>
          <div className="text-[clamp(15px,1.2vw,17px)] leading-[1.45]">In-house production. Our own cameras, our own edit, our own release calendar.</div>
        </div>
        <div className="[flex:1_1_min(100%,220px)] [border-top:1px_solid_rgba(245,242,237,.15)] pt-3.5 px-0 pb-[22px]">
          <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[#8C877E] mb-2.5">02</div>
          <div className="text-[clamp(15px,1.2vw,17px)] leading-[1.45]">Design and engineering sit together. Nothing gets thrown over a wall.</div>
        </div>
        <div className="[flex:1_1_min(100%,220px)] [border-top:1px_solid_rgba(245,242,237,.15)] pt-3.5 px-0 pb-[22px]">
          <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[#8C877E] mb-2.5">03</div>
          <div className="text-[clamp(15px,1.2vw,17px)] leading-[1.45]">Zero to launch. A small senior team that can take an idea all the way out.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="contact" data-dark="" className="bg-[#0C0B0A] text-[#F7F4EF] pt-[clamp(72px,11vw,170px)] px-[clamp(20px,4.4vw,64px)] pb-0">
  <div className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(247,244,239,.18)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">
    <span>(02) Contact</span>
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
<AboutRuntime />
</div>
  );
}
