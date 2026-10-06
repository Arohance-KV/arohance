// Vertical template: one static page per vertical in lib/verticals.ts, the
// targets of the homepage's "Five verticals" rows and their service pills
// (`/services/{slug}#{serviceAnchor}`).
//
// The nav and menu overlay are copied from app/case-study/[slug]/page.tsx,
// including its `max-lg:` classes. Everything after them is hand-written and
// renders from lib/verticals.ts.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactPill from '@/components/ContactPill';
import { VERTICALS, verticalHref, serviceAnchor } from '@/lib/verticals';
// Same behaviour set a case study needs: nav over dark sections, clock, parallax, hover lift, text entrances.
import CaseStudyRuntime from '../../case-study/case-study-runtime';
import WorksPanel from '@/components/WorksPanel';
import SocialLinks from '@/components/SocialLinks';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

// Absolute: the name already carries "Arohance", so skip the root layout's `%s — Arohance`.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = VERTICALS.find((x) => x.slug === slug);
  if (!v) return {};
  return { title: { absolute: `Arohance ${v.name}` }, description: v.description };
}

const RULE = '[border-top:1px_solid_rgba(245,242,237,.15)]';

export default async function VerticalPage({ params }: Props) {
  const { slug } = await params;
  const i = VERTICALS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const v = VERTICALS[i];
  const next = VERTICALS[(i + 1) % VERTICALS.length];
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

<header className="pt-[clamp(100px,15vh,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(28px,4vw,52px)]">
  <div data-eyebrow="" className="flex justify-between items-baseline gap-4 flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
    <Link href="/#verticals">← All verticals</Link>
    <span>Vertical {String(i + 1).padStart(2, '0')}</span>
    <span data-ag-clock="">00:00</span>
  </div>

  <h1 className="mt-[clamp(28px,5vw,70px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(3.2rem,15vw,15rem)] leading-[.84] tracking-[-0.05em] [font-variation-settings:'wdth'_106] uppercase"><span className="block text-[.32em] leading-[1] tracking-[-0.03em] text-[#6B665F]">Arohance</span>{v.name}</h1>

  <div className="flex justify-between items-end gap-[clamp(20px,5vw,60px)] flex-wrap mt-[clamp(22px,3vw,44px)]">
    <p data-split="" className="m-0 max-w-[24ch] [font-family:'Archivo',sans-serif] font-medium text-[clamp(1.15rem,2.4vw,2.1rem)] leading-[1.15] tracking-[-0.025em]">{v.tagline}</p>
    <p className="m-0 max-w-[40ch] text-[clamp(15px,1.3vw,18px)] leading-[1.6] text-[#A9A39A]">{v.description}</p>
  </div>
</header>

<section className="mt-[clamp(40px,6vw,90px)] px-[clamp(20px,4.4vw,64px)]">
  <h2 data-eyebrow="" className="mt-0 mx-0 mb-[clamp(30px,4.4vw,64px)] [font-family:'JetBrains_Mono',monospace] font-normal text-[11px] tracking-[.14em] uppercase text-[#8C877E]">+ (What we do)</h2>
  {/* Each row's id is the anchor the homepage's service pills link to; scroll-mt clears the fixed nav. */}
  <ol className="m-0 p-0 list-none [border-bottom:1px_solid_rgba(245,242,237,.15)]">
    {v.services.map((service, k) => (
      <li key={service} id={serviceAnchor(service)} className={`${RULE} scroll-mt-24 grid grid-cols-[clamp(24px,2.6vw,40px)_minmax(0,1fr)] items-baseline gap-x-[clamp(12px,2.4vw,34px)] py-[clamp(16px,2vw,28px)]`}>
        <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.1em] text-[#8C877E]">{String(k + 1).padStart(2, '0')}</span>
        <h3 className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.7rem,4.4vw,4rem)] leading-[.95] tracking-[-0.045em] uppercase">{service}</h3>
      </li>
    ))}
  </ol>
</section>

{/* Capped near the previews' native width (868–1920px) so the smaller ones stay sharp. */}
<section className="relative ml-auto mt-[clamp(50px,8vw,120px)] w-[min(100%-2*clamp(20px,4.4vw,64px),960px)] mr-[clamp(20px,4.4vw,64px)] [aspect-ratio:16/10] overflow-hidden rounded-[6px] bg-[#1A1815]">
  <div data-parallax="0.5" className="absolute left-0 right-0 top-[-9%] h-[118%]">
    <Image src={v.preview} alt="" fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
  </div>
</section>

<section className="mt-[clamp(50px,8vw,120px)] mb-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
  <div className="flex flex-wrap items-end justify-between gap-[clamp(20px,4vw,64px)]">
    <h2 className="m-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.8rem,6vw,5.4rem)] leading-[.92] tracking-[-0.045em]">HAVE A THING<br />WORTH <span className="text-[var(--ag-accent,#F2600C)]">BUILDING?</span></h2>
    {/* `!`: the sitewide unlayered `a { color: inherit }` beats text utilities on <a>. */}
    <Link href="/contact" className="inline-flex items-center gap-3 bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A]! rounded-[999px] py-3.5 px-6 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(15px,1.3vw,18px)] [transition:background_.35s_ease] hover:bg-[#F5F2ED]">Talk to us <span aria-hidden="true">→</span></Link>
  </div>
</section>

<section data-dark="" className="bg-[#131110] text-[#EDE9E1] pt-[clamp(60px,9vw,130px)] px-[clamp(20px,4.4vw,64px)] pb-0">
  <Link href={verticalHref(next)} data-hover-group="" className="block [border-top:1px_solid_rgba(237,233,225,.18)] pt-3.5">
    <div data-eyebrow="" className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8A857B]">Next vertical</div>
    <div className="flex justify-between items-baseline gap-5 flex-wrap mt-[clamp(14px,2vw,26px)]">
      <span data-hover-title="" data-split="" className="[font-family:'Archivo',sans-serif] font-bold text-[clamp(2.2rem,9vw,8rem)] leading-[.9] tracking-[-0.05em] uppercase [transition:transform_.7s_cubic-bezier(.16,1,.3,1)]">{next.name}</span>
      <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.12em] uppercase text-[#8A857B]">{next.tagline} →</span>
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
