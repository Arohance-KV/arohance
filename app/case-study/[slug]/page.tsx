// Case study template: one static page per project in lib/work.ts.
//
// The nav, menu overlay and footer started as `tools/convert.mjs case-study`
// output (its "Work" link now points at the homepage grid) and keep the 18
// `max-lg:` classes the mobile pass added to them; see README.md, "Changing
// the converter". Everything between the header and the footer is
// hand-written and renders from lib/work.ts, so this page deliberately no
// longer matches `Arohance Case Study.html`. A regenerate-and-paste would
// silently revert all of it.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactPill from '@/components/ContactPill';
import { WORK, workHref, type Block, type Img, type TextSection } from '@/lib/work';
import CaseStudyRuntime from '../case-study-runtime';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

// `%s — Arohance` (root layout).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const w = WORK.find((x) => x.slug === slug);
  if (!w) return {};
  return {
    title: w.seo?.title ?? `${w.client}: ${w.title}`,
    description: w.seo?.description ?? w.summary,
  };
}

const RULE = '[border-top:1px_solid_rgba(245,242,237,.15)]';

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const i = WORK.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const w = WORK[i];
  const next = WORK[(i + 1) % WORK.length];
  let n = 0; // image rows aren't numbered
  return (
<div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">

<nav data-ag-nav="" className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]">
  <Link href="/" className="flex items-center"><Image data-ag-logo="" src="/images/93c7aab596.png" alt="Arohance, Tech &amp; Marketing" width={422} height={133} priority className="h-[46px] w-auto block [filter:none] [transition:filter_.45s_ease,height_.45s_ease]" /></Link>
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
          <Link href="/contact" className="max-lg:py-3">LinkedIn</Link>
          <Link href="/contact" className="max-lg:py-3">Instagram</Link>
          <Link href="/contact" className="max-lg:py-3">X / Twitter</Link>
        </div>
      </div>
    </div>

  </div>
</div>

<header className="pt-[clamp(100px,15vh,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(28px,4vw,52px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-4 flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
    <Link href="/#work">← Selected work</Link>
    <span>Case study {String(i + 1).padStart(2, '0')}</span>
    <span data-ag-clock="">00:00</span>
  </div>

  <h1 className="mt-[clamp(28px,5vw,70px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(3.2rem,15vw,15rem)] leading-[.84] tracking-[-0.05em] [font-variation-settings:'wdth'_106] uppercase">{w.client}</h1>

  <div className="flex justify-between items-end gap-[clamp(20px,5vw,60px)] flex-wrap mt-[clamp(22px,3vw,44px)]">
    <p data-split="" className="m-0 max-w-[40ch] [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.15rem,2.4vw,2.1rem)] leading-[1.15] tracking-[-0.025em]">{w.title}.</p>
    <dl className="m-0 flex flex-wrap gap-x-[clamp(18px,3vw,52px)] gap-y-4 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase">
      {w.facts.map(([term, value]) => (
        <div key={term} className="max-w-[28ch]"><dt className="text-[#8C877E] mb-1.5">{term}</dt><dd className="m-0">{value}</dd></div>
      ))}
    </dl>
  </div>
</header>

<section data-cursor={w.client} className="relative h-[clamp(320px,80vh,880px)] overflow-hidden my-0 mx-[clamp(20px,4.4vw,64px)]">
  <div data-parallax="0.5" className="absolute left-0 right-0 top-[-9%] h-[118%]">
    <Image src={w.image.src} alt={w.image.alt} width={w.image.width} height={w.image.height} priority className="h-full w-full object-cover" />
  </div>
</section>

{w.sections.map((s, k) => ('images' in s ? <ImageRow key={k} images={s.images} /> : <Chapter key={k} s={s} n={++n} />))}

<section className="my-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
  <p data-split="" className="m-0 max-w-[24ch] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.8rem,6vw,5.4rem)] leading-[.98] tracking-[-0.045em] uppercase">{w.closing}</p>
  {w.cta && (
    <div className="flex flex-wrap items-end justify-between gap-[clamp(20px,4vw,64px)] mt-[clamp(50px,8vw,120px)] [border-top:1px_solid_rgba(245,242,237,.15)] pt-4">
      <div className="[flex:1_1_min(100%,420px)]">
        <h2 className="m-0 max-w-[28ch] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,2.6vw,2.2rem)] leading-[1.1] tracking-[-0.03em]">{w.cta.heading}</h2>
        <p className="mt-3 mx-0 mb-0 max-w-[56ch] text-[clamp(15px,1.25vw,17px)] leading-[1.6] text-[#A9A39A]">{w.cta.body}</p>
      </div>
      {/* `!`: the sitewide unlayered `a { color: inherit }` beats text utilities on <a>. */}
      <Link href="/contact" className="inline-flex items-center gap-3 bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A]! rounded-[999px] py-3.5 px-6 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.3vw,18px)] [transition:background_.35s_ease] hover:bg-[#F5F2ED]">Talk to us <span aria-hidden="true">→</span></Link>
    </div>
  )}
</section>

<section data-dark="" className="bg-[#131110] text-[#EDE9E1] pt-[clamp(60px,9vw,130px)] px-[clamp(20px,4.4vw,64px)] pb-0">
  <Link href={workHref(next)} data-hover-group="" className="block [border-top:1px_solid_rgba(237,233,225,.18)] pt-3.5">
    <div data-eyebrow="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">Next project</div>
    <div className="flex justify-between items-baseline gap-5 flex-wrap mt-[clamp(14px,2vw,26px)]">
      <span data-hover-title="" data-split="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(2.2rem,9vw,8rem)] leading-[.9] tracking-[-0.05em] uppercase [transition:transform_.7s_cubic-bezier(.16,1,.3,1)]">{next.client}</span>
      <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase text-[#8A857B]">{next.title}, {next.tags} →</span>
    </div>
  </Link>

  <footer className="[border-top:1px_solid_rgba(237,233,225,.18)] mt-[clamp(50px,8vw,110px)]">
    <div className="flex justify-between gap-4 flex-wrap py-4 px-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8A857B] max-lg:items-center">
      <span>© 2026 Arohance</span>
      <span className="flex gap-[18px]"><Link href="/studio" className="max-lg:px-2 max-lg:py-4">Studio</Link><Link href="/contact" className="max-lg:px-2 max-lg:py-4">Contact</Link><Link href="/" className="max-lg:px-2 max-lg:py-4">Home</Link></span>
    </div>
    <div className="overflow-hidden leading-[.74] mb-[-0.09em] [container-type:inline-size]">
      <span className="block [font-family:'Archivo',sans-serif] font-bold text-[15.2cqw] tracking-[-0.05em] [font-variation-settings:'wdth'_104] whitespace-nowrap">AROHANCE®</span>
    </div>
  </footer>
</section>

<ContactPill />
<CaseStudyRuntime />
</div>
  );
}

/** A numbered section: label and lead heading side by side, stats full width, then the body. */
function Chapter({ s, n }: { s: TextSection; n: number }) {
  return (
<section data-dark={s.dark ? '' : undefined} className={s.dark ? 'bg-[#131110] text-[#EDE9E1] py-[clamp(70px,11vw,170px)] px-[clamp(20px,4.4vw,64px)]' : 'my-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]'}>
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-[clamp(24px,5vw,90px)] gap-y-[clamp(26px,4vw,50px)] items-start max-lg:grid-cols-1">
    <h2 data-eyebrow="" className={`m-0 ${RULE} pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]`}>{String(n).padStart(2, '0')}, {s.label}</h2>
    {s.heading && (
      <p data-split="" className={s.dark
        ? "col-start-2 m-0 max-w-[17ch] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,5.4vw,4.8rem)] leading-[.96] tracking-[-0.045em] uppercase max-lg:col-start-1"
        : `col-start-2 m-0 ${RULE} pt-3 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.3rem,3vw,2.5rem)] leading-[1.14] tracking-[-0.028em] [text-wrap:pretty] max-lg:col-start-1`}>
        {s.heading}{s.accent && <> <span className="text-[var(--ag-accent,#F2600C)]">{s.accent}</span></>}
      </p>
    )}
    {s.stats && (
      <div className="col-span-full">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,5vw,80px)]">
          {s.stats.map(([figure, caption], k) => (
            <div key={k} className={`${RULE} pt-4 pb-[26px]`}>
              <div data-reveal="" data-delay={k * 100} className={`[font-family:'Archivo',sans-serif] font-bold text-[clamp(2.2rem,5vw,4.4rem)] leading-[1] tracking-[-0.045em] ${k ? '' : 'text-[var(--ag-accent,#F2600C)]'}`}>{figure}</div>
              <div className="mt-3 text-[15px] leading-[1.5] text-[#A9A39A]">{caption}</div>
            </div>
          ))}
        </div>
        {s.note && <p className="mt-2 mx-0 mb-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E]">{s.note}</p>}
      </div>
    )}
    {s.blocks && (
      <div className="col-start-2 flex flex-col gap-[clamp(16px,1.8vw,24px)] max-lg:col-start-1">
        {s.blocks.map((b, k) => <BlockView key={k} b={b} />)}
      </div>
    )}
  </div>
</section>
  );
}

function BlockView({ b }: { b: Block }) {
  if ('p' in b) return <p className="m-0 max-w-[62ch] text-[clamp(15px,1.25vw,17px)] leading-[1.6] text-[#A9A39A]">{b.p}</p>;
  if ('h' in b) return <h3 className="mt-[clamp(8px,1.6vw,20px)] mb-0 first:mt-0 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.15rem,1.9vw,1.6rem)] leading-[1.2] tracking-[-0.025em]">{b.h}</h3>;
  if ('flow' in b) return <p className="m-0 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase leading-[1.9] text-[var(--ag-accent,#F2600C)]">{b.flow.join(' → ')}</p>;
  if ('quote' in b) {
    return (
      <figure className="m-0">
        <blockquote className="m-0 [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.15rem,2.2vw,1.8rem)] leading-[1.25] tracking-[-0.02em] [text-wrap:pretty]">“{b.quote}”</blockquote>
        <figcaption className="mt-[clamp(14px,2vw,22px)] [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">{b.by}</figcaption>
      </figure>
    );
  }
  if ('table' in b) {
    const [head, ...rows] = b.table;
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>{head.map((c) => <th key={c} scope="col" className="pb-3 pr-4 text-left [font-family:'JetBrains_Mono',monospace] font-normal text-[10.5px] tracking-[.14em] uppercase text-[#8C877E]">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} className={`${RULE} last:[border-bottom:1px_solid_rgba(245,242,237,.15)]`}>
              {r.map((c, j) => <td key={j} className={`py-3.5 pr-4 align-top text-[clamp(14px,1.2vw,17px)] leading-[1.45] ${j ? '' : 'text-[#A9A39A]'}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  // list and points share the original page's two-column rows, split down the middle.
  const rows: readonly (readonly [string, string])[] = 'list' in b ? b.list.map((item) => [item, ''] as const) : b.points;
  const half = Math.ceil(rows.length / 2);
  return (
    <div className="flex flex-wrap gap-x-[clamp(28px,6vw,90px)]">
      {[rows.slice(0, half), rows.slice(half)].filter((col) => col.length).map((col, c) => (
        <ul key={c} className="[flex:1_1_min(100%,260px)] m-0 p-0 list-none">
          {col.map(([name, detail], k) => (
            <li key={k} className={`flex justify-between items-baseline gap-3.5 ${RULE} last:[border-bottom:1px_solid_rgba(245,242,237,.15)] py-3.5 text-[clamp(14px,1.3vw,18px)] leading-[1.35]`}>
              <span>{name}</span>
              {detail && <span className="[flex:0_1_auto] max-w-[26ch] text-right text-[12px] leading-[1.5] text-[#8A857B]">{detail}</span>}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/** One image fills the row; more stagger like the original page's pair. */
function ImageRow({ images }: { images: readonly Img[] }) {
  return (
<section className="my-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap gap-[clamp(16px,2.6vw,36px)]">
    {images.map((img, k) => (
      <div key={k} data-hover-group="" className={`relative overflow-hidden h-[clamp(280px,52vh,600px)] ${k ? '[flex:1_1_min(100%,240px)] mt-[clamp(0px,5vw,80px)]' : '[flex:2_1_min(100%,300px)]'}`}>
        <div data-hover-img="" data-parallax={k ? '0.6' : '0.3'} className={`absolute left-0 right-0 ${k ? 'top-[-9%] h-[118%]' : 'top-[-7%] h-[114%]'}`}><Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="h-full w-full object-cover" /></div>
      </div>
    ))}
  </div>
</section>
  );
}
