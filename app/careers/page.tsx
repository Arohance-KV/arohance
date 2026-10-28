// Generated + hand-augmented — read before editing.
//
// Starting point: `tools/convert.mjs careers` (parses
// `.source/templates/careers.html`, rewrites inline styles to Tailwind
// classes) -> `.source/jsx/careers.jsx`, hand-merged into this file once
// (swapping `<img>` for `next/image`; the converter already emits
// `next/link`'s `<Link>` for internal anchors, so that part needed no
// manual swap; wiring up `CareersRuntime`). Since that merge, 24 `max-lg:`
// responsive classes were hand-added directly in this file during the
// mobile responsive pass — `tools/convert.mjs` does not produce these and
// has no notion of a breakpoint at all.
//
// A wrong class string is a converter bug: fix `tools/tw.mjs`, not the
// string here. Do NOT "fix" a class by regenerating and pasting over this
// file — that silently deletes all 24 `max-lg:` classes, this page goes
// back to desktop-only, and neither `tools/compare.mjs` (checks 1440 only)
// nor a passing build says anything. See README.md, "Changing the
// converter", for the actual procedure.
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactPill from '@/components/ContactPill';
import CareersRuntime from './careers-runtime';

/** Hiring runs entirely on a Google Form — no backend, no /api/contact on
 *  this page. Change the link and the five roles here; the roles grid and
 *  both CTAs below read from these. Keep `tag` short, it renders in a pill. */
const APPLY_URL = 'https://tinyurl.com/arohance-hiring';
const ROLES = [
  { title: 'Social Media Manager', tag: 'Proven reach' },
  { title: 'Cinematographer', tag: '2–4 yrs' },
  { title: 'Photographer', tag: '0–1 yr' },
  { title: 'Video Editor', tag: 'Talent > years' },
  { title: 'Graphic Designer', tag: 'Junior' },
];

// Page name first so Google's sitelinks read "Careers", then this page's own
// h1 ("Come Make the Whole Thing"); description is the hero copy.
export const metadata: Metadata = {
  title: { absolute: 'Careers at Arohance: Come Make the Whole Thing' },
  description:
    'Join designers, engineers, filmmakers and strategists who would rather build the thing than manage the people building it. No account layer, no deck factory.',
};

export default function Careers() {
  return (
    <div data-ag-root="" className="bg-[#0C0B0A] text-[#F5F2ED] relative overflow-clip">
      <section id="apply" className="pt-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)] pb-0">
        <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
          <span>(04) Apply</span>
          <span>Under two minutes</span>
        </div>

        <h2 className="mt-[clamp(30px,5vw,80px)] mx-0 mb-[clamp(28px,4vw,58px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.2rem,8.4vw,8.4rem)] leading-[.89] tracking-[-0.048em] [font-variation-settings:'wdth'_104]">SHOW US<br />SOMETHING<br />YOU <span className="text-[var(--ag-accent,#F2600C)]">MADE.</span></h2>

        <div className="flex flex-wrap gap-[clamp(30px,6vw,110px)] items-start pb-[clamp(50px,8vw,110px)]">
          <div className="[flex:2_1_min(100%,320px)] flex flex-col items-start gap-[clamp(18px,2.4vw,30px)]">
            <p className="m-0 max-w-[46ch] text-[clamp(15px,1.35vw,19px)] leading-[1.55] text-[#A9A39A]">Everything goes through one form: your name, the role you want, how long you have been at it, and a link to the work. Under two minutes. We read every one and reply within a week.</p>
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-[15px] bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] py-[clamp(13px,1.4vw,18px)] px-[clamp(20px,2.2vw,32px)] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(17px,2vw,24px)] tracking-[-0.02em] [transition:transform_.5s_cubic-bezier(.16,1,.3,1)] hover:[transform:translate3d(0,-2px,0)] hover:text-[#0A0A0A]">Open the application form <span>→</span></a>
            <p className="m-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8C877E]">Opens a Google Form in a new tab</p>
          </div>
        </div>
      </section>
      <section id="roles" className="pt-[clamp(40px,6vw,90px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(70px,10vw,150px)]">
        <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(30px,5vw,64px)]">
          <span>(02) Open roles</span>
          <span>Jayanagar, Bengaluru, on-site</span>
        </div>

        {/* gap-px over a lit background draws the hairlines, so the cells keep
      their separators when the grid drops to two columns and the last row
      is short. */}
        <div className="grid grid-cols-5 gap-px bg-[rgba(245,242,237,.15)] [border:1px_solid_rgba(245,242,237,.15)] max-lg:grid-cols-2">
          {ROLES.map((role, i) => (
            <a key={role.title} href={APPLY_URL} target="_blank" rel="noopener noreferrer" data-reveal="" className="bg-[#0C0B0A] flex flex-col gap-[clamp(10px,1.4vw,16px)] py-[clamp(20px,2.4vw,32px)] px-[clamp(14px,1.5vw,20px)] [transition:background_.35s_ease] hover:bg-[#161412]">
              <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[var(--ag-accent,#F2600C)]">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-0 mx-0 mb-[clamp(10px,1.6vw,22px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1rem,1.5vw,1.4rem)] leading-[1.02] tracking-[-0.035em] uppercase">{role.title}</h3>
              <span className="mt-auto self-start rounded-full [border:1px_solid_rgba(245,242,237,.28)] py-[5px] px-3 [font-family:'JetBrains_Mono',monospace] text-[9.5px] tracking-[.14em] uppercase text-[#A9A39A] whitespace-nowrap">{role.tag}</span>
            </a>
          ))}
        </div>

        <p data-reveal="" className="mt-[clamp(22px,3vw,40px)] mx-0 mb-0 max-w-[52ch] text-[15px] leading-[1.55] text-[#A9A39A]">Not quite any of these? Pick the closest one and say so in the last question — two of the last four hires wrote in without a role being open.</p>
      </section>

      <nav data-ag-nav="" className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]">
        <Link href="/" className="flex items-center"><Image data-ag-logo="" src="/images/logo.png" alt="Arohance, Tech &amp; Marketing" width={422} height={133} priority className="h-[46px] w-auto block [transition:height_.45s_ease]" /></Link>
        <div className="flex items-center gap-2.5">
          <a href="#apply" data-ag-navcta="" className="hidden items-center h-[46px] py-0 px-5 rounded-[15px] bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] [font-family:'Archivo',sans-serif] font-semibold text-[15px] [transition:transform_.5s_cubic-bezier(.16,1,.3,1)] hover:[transform:translate3d(0,-2px,0)] hover:text-[#0A0A0A]">Apply</a>
          <button data-ag-menu-btn="" type="button" aria-label="Menu" className="w-[46px] h-[46px] border-0 rounded-[15px] bg-[#1A1815] text-[#F5F2ED] flex items-center justify-center cursor-pointer shadow-[0_10px_26px_rgba(0,0,0,.5)] [transition:background_.35s_ease,transform_.5s_cubic-bezier(.16,1,.3,1)] hover:bg-[var(--ag-accent,#F2600C)] hover:text-[#0A0A0A] hover:[transform:translate3d(0,-2px,0)]">
            <span data-ag-burger="" className="flex flex-col gap-[5px] w-[19px]">
              <span className="block h-0.5 bg-[currentColor] rounded-[2px] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]"></span>
              <span className="block h-0.5 bg-[currentColor] rounded-[2px] [transition:transform_.45s_cubic-bezier(.16,1,.3,1)]"></span>
            </span>
          </button>
        </div>
      </nav>

      <div data-ag-overlay="" className="fixed inset-0 z-[65] bg-[rgba(8,8,7,.66)] [backdrop-filter:blur(18px)] [-webkit-backdrop-filter:blur(18px)] opacity-[0] invisible pointer-events-none [transition:opacity_.5s_ease,visibility_.5s_ease]">
        <div className="absolute inset-0 flex items-start justify-end pt-[clamp(72px,10vh,86px)] px-[clamp(16px,4.4vw,64px)] pb-[clamp(20px,4vh,40px)] overflow-auto">
          <div data-ag-menu-panel="" className="[flex:0_1_min(100%,420px)] flex flex-col justify-between gap-[clamp(30px,6vh,64px)] min-h-[min(560px,76vh)] bg-[#161412] text-[#F5F2ED] rounded-[16px] pt-5 px-[clamp(20px,2.4vw,30px)] pb-[clamp(24px,3vh,34px)] opacity-[0] [transform:translate3d(28px,0,0)] [transition:opacity_.5s_ease,transform_.6s_cubic-bezier(.16,1,.3,1)] pointer-events-none max-lg:min-w-0">
            <div>
              <div className="flex items-center justify-between gap-4 text-[#8A857B]">
                <span className="text-[17px]">→</span>
                <button data-ag-close="" type="button" aria-label="Close menu" className="w-[30px] h-[30px] border-0 bg-[transparent] text-[#B7B1A6] flex items-center justify-center cursor-pointer text-[19px] leading-[1] [transition:color_.3s] hover:text-[#F5F2ED] max-lg:w-[40px] max-lg:h-[40px]">✕</button>
              </div>
              <div className="flex flex-col mt-[clamp(12px,2vh,22px)]">
                <Link data-ag-mlink="" href="/" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#F5F2ED] hover:pl-2.5">Home <span className="text-[.5em] text-[#8A857B]">→</span></Link>
                <Link data-ag-mlink="" href="/about" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">About <span className="text-[.5em] text-[#8A857B]">→</span></Link>
                <Link data-ag-mlink="" href="/services" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#EDE9E1] hover:pl-2.5">Services <span className="text-[.5em] text-[#8A857B]">→</span></Link>
                <Link data-ag-mlink="" href="/studio" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#F5F2ED] hover:pl-2.5">Studio <span className="text-[.5em] text-[#8A857B]">→</span></Link>
                <Link data-ag-mlink="" href="/careers" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[var(--ag-accent,#F2600C)] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:pl-2.5">Careers <span className="text-[.5em] text-[#8A857B]">→</span></Link>
                <Link data-ag-mlink="" href="/contact" className="flex items-baseline justify-between gap-4 py-[clamp(8px,1.4vh,14px)] px-0 [border-bottom:1px_solid_rgba(237,233,225,.16)] [font-family:'Archivo',sans-serif] font-medium text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] tracking-[-0.035em] text-[#77726A] [transition:color_.35s_ease,padding-left_.4s_cubic-bezier(.16,1,.3,1)] hover:text-[#F5F2ED] hover:pl-2.5">Contact <span className="text-[.5em] text-[#8A857B]">→</span></Link>
              </div>
            </div>
            <div>
              <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8A857B] mb-3.5">Hiring</div>
              <div className="flex flex-col gap-[7px] text-[14.5px] font-medium">
                <a href="mailto:info@arohance.com" className="max-lg:py-3">info@arohance.com</a>
                <a href="#process" className="max-lg:py-3">How we hire</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className="relative min-h-[88svh] flex flex-col justify-end pt-[clamp(104px,14vh,170px)] px-[clamp(20px,4.4vw,64px)] pb-[clamp(30px,4.5vw,60px)]">
        <div data-eyebrow="" className="flex justify-between items-baseline gap-4 flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E]">
          <span>Careers</span>
          <span>Five open roles, Jayanagar, Bengaluru</span>
        </div>

        <h1 className="mt-[clamp(26px,4vw,58px)] mx-0 mb-0 [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,8.4vw,9.5rem)] leading-[.87] tracking-[-0.048em] [font-variation-settings:'wdth'_106]">
          <span className="block">COME MAKE</span>
          <span className="block">THE WHOLE</span>
          <span className="block text-[var(--ag-accent,#F2600C)]">THING.</span>
        </h1>

        <div className="flex justify-between items-end gap-[clamp(20px,5vw,60px)] flex-wrap mt-[clamp(28px,4vw,58px)]">
          <p data-reveal="" className="m-0 max-w-[48ch] text-[clamp(15px,1.35vw,19px)] leading-[1.55] text-[#A9A39A]">Fourteen people who would rather build the thing than manage the people building it. No account layer, no deck factory, no work that goes out with someone else&apos;s name on the craft.</p>
          <a href="#apply" className="inline-flex items-center gap-3 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(16px,1.6vw,22px)] tracking-[-0.02em] [border-bottom:1px_solid_currentColor] pb-1">Send us your work <span>↓</span></a>
        </div>
      </header>

      <div className="relative overflow-hidden bg-[#0C0B0A] py-[clamp(48px,6vw,92px)] px-0">
        <div className="relative h-[clamp(126px,14vw,206px)]">
          <div className="absolute left-[-6%] right-[-6%] top-[50%] [transform:translateY(-50%)_rotate(-5deg)]">
            <div className="overflow-hidden bg-[var(--ag-accent,#F2600C)] text-[#0A0A0A] py-[clamp(9px,1.1vw,15px)] px-0 shadow-[0_22px_50px_rgba(0,0,0,.55)]">
              <div data-ag-ribbon="" className="flex w-max [animation:ag-marquee_30s_linear_infinite] [font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.6vw,26px)] tracking-[.06em] uppercase whitespace-nowrap">
                <span className="pr-[34px]">Designers — Engineers — Filmmakers — Producers &nbsp;</span>
                <span className="pr-[34px]">Strategists — Editors — Copywriters — Photographers &nbsp;</span>
                <span className="pr-[34px]">Designers — Engineers — Filmmakers — Producers &nbsp;</span>
                <span className="pr-[34px]">Strategists — Editors — Copywriters — Photographers &nbsp;</span>
              </div>
            </div>
          </div>
          <div className="absolute left-[-6%] right-[-6%] top-[50%] [transform:translateY(-50%)_rotate(5deg)]">
            <div className="overflow-hidden bg-[#F5F2ED] text-[#0A0A0A] py-[clamp(9px,1.1vw,15px)] px-0 shadow-[0_22px_50px_rgba(0,0,0,.55)]">
              <div data-ag-ribbon="" className="flex w-max [animation:ag-marquee-rev_30s_linear_infinite] [font-family:'Archivo',sans-serif] font-bold text-[clamp(15px,1.6vw,26px)] tracking-[.06em] uppercase whitespace-nowrap">
                <span className="pr-[34px]">Senior by default — Small on purpose — Credit where it is due &nbsp;</span>
                <span className="pr-[34px]">Four-day shoots — Real budgets — Work that ships &nbsp;</span>
                <span className="pr-[34px]">Senior by default — Small on purpose — Credit where it is due &nbsp;</span>
                <span className="pr-[34px]">Four-day shoots — Real budgets — Work that ships &nbsp;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
        <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(26px,4vw,56px)]">
          <span>(01) Why here</span>
          <span>Four honest reasons</span>
        </div>
        <p data-reveal="" className="mt-0 mx-0 mb-[clamp(36px,5vw,78px)] max-w-[30ch] [font-family:'Archivo',sans-serif] font-bold text-[clamp(1.9rem,6.2vw,5.4rem)] leading-[.94] tracking-[-0.045em]">THE WORK IS THE PERK.</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-[clamp(20px,3vw,44px)]">
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pt-4">
            <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[var(--ag-accent,#F2600C)] mb-3">01</div>
            <h3 className="mt-0 mx-0 mb-2.5 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.15rem,1.9vw,1.7rem)] tracking-[-0.03em]">You own the whole thing</h3>
            <p className="m-0 text-[15px] leading-[1.55] text-[#A9A39A]">One person carries a piece of work from the brief to the launch. Nothing is handed to a delivery team you never meet.</p>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pt-4">
            <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[var(--ag-accent,#F2600C)] mb-3">02</div>
            <h3 className="mt-0 mx-0 mb-2.5 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.15rem,1.9vw,1.7rem)] tracking-[-0.03em]">Kit, crew and a standing set</h3>
            <p className="m-0 text-[15px] leading-[1.55] text-[#A9A39A]">A permanent studio floor, cameras that stay in the building, and an edit suite you do not have to book three weeks out.</p>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pt-4">
            <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[var(--ag-accent,#F2600C)] mb-3">03</div>
            <h3 className="mt-0 mx-0 mb-2.5 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.15rem,1.9vw,1.7rem)] tracking-[-0.03em]">Four-day project weeks</h3>
            <p className="m-0 text-[15px] leading-[1.55] text-[#A9A39A]">Fridays are for your own work, study or nothing at all. We protect it, including during a launch.</p>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] pt-4">
            <div className="[font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] text-[var(--ag-accent,#F2600C)] mb-3">04</div>
            <h3 className="mt-0 mx-0 mb-2.5 [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.15rem,1.9vw,1.7rem)] tracking-[-0.03em]">Your name on it</h3>
            <p className="m-0 text-[15px] leading-[1.55] text-[#A9A39A]">Credits on every case study and film. Award entries carry the people who did the work, not the studio alone.</p>
          </div>
        </div>
      </section>




      <section id="process" className="py-[clamp(60px,9vw,140px)] px-[clamp(20px,4.4vw,64px)]">
        <div data-eyebrow="" className="flex justify-between items-baseline gap-[18px] flex-wrap [border-top:1px_solid_rgba(245,242,237,.15)] pt-3 [font-family:'JetBrains_Mono',monospace] text-[11px] tracking-[.14em] uppercase text-[#8C877E] mb-[clamp(30px,5vw,64px)]">
          <span>(03) How we hire</span>
          <span>Two weeks, four steps</span>
        </div>
        <div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(12px,1.4vw,20px)] px-0 ml-[0%]">
            <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">01</span>
            <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">THE WORK</span>
            <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[32ch]">Three things you made and why</span>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(12px,1.4vw,20px)] px-0 ml-[4%]">
            <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">02</span>
            <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">A CALL</span>
            <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[32ch]">Forty minutes with the person you would work beside</span>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(12px,1.4vw,20px)] px-0 ml-[8%]">
            <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">03</span>
            <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em]">A DAY IN</span>
            <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[32ch]">Paid, on a real brief, with the team</span>
          </div>
          <div data-reveal="" className="[border-top:1px_solid_rgba(245,242,237,.15)] [border-bottom:1px_solid_rgba(245,242,237,.15)] flex items-baseline gap-[clamp(12px,2vw,28px)] py-[clamp(12px,1.4vw,20px)] px-0 ml-[12%]">
            <span className="[font-family:'JetBrains_Mono',monospace] text-[11px] text-[#8C877E] min-w-6">04</span>
            <span className="[flex:1] [font-family:'Archivo',sans-serif] font-semibold text-[clamp(1.3rem,3.4vw,2.9rem)] leading-[1] tracking-[-0.035em] text-[var(--ag-accent,#F2600C)]">OFFER</span>
            <span className="[flex:0_1_auto] text-right text-[clamp(12px,1vw,14px)] text-[#8C877E] max-w-[32ch]">Numbers in writing, no negotiation theatre</span>
          </div>
        </div>
        <div className="[flex:1_1_min(100%,240px)] flex flex-col gap-[clamp(20px,3vw,34px)]">
          <div>
            <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8C877E] mb-[9px]">Direct</div>
            <a href="mailto:info@arohance.com" className="text-[clamp(16px,1.5vw,21px)] [border-bottom:1px_solid_rgba(245,242,237,.3)] pb-0.5 max-lg:inline-block max-lg:py-3">info@arohance.com</a>
            <div className="flex flex-col gap-1 mt-3 text-[clamp(15px,1.4vw,19px)]">
              <a href="tel:+919427673035" className="max-lg:py-2">+91 94276 73035</a>
              <a href="tel:+918660317750" className="max-lg:py-2">+91 86603 17750</a>
            </div>
          </div>
          <div>
            <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8C877E] mb-[9px]">Studio</div>
            <div className="text-[clamp(15px,1.4vw,19px)] leading-[1.5]">Jayanagar 9th Block, Bangalore<br />Karnataka, India, 560069</div>
          </div>
          <div>
            <div className="[font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.14em] uppercase text-[#8C877E] mb-[9px]">No agencies</div>
            <div className="text-[15px] leading-[1.55] text-[#A9A39A]">We hire direct, always. Recruiter mail goes unanswered.</div>
          </div>
        </div>
        <footer className="[border-top:1px_solid_rgba(245,242,237,.18)]">
          <div className="flex justify-between gap-4 flex-wrap py-4 px-0 [font-family:'JetBrains_Mono',monospace] text-[10.5px] tracking-[.12em] uppercase text-[#8C877E] max-lg:items-center">
            <span>© 2026 Arohance</span>
            <span className="flex gap-[18px]"><Link href="/" className="max-lg:px-2 max-lg:py-4">Home</Link><Link href="/studio" className="max-lg:px-2 max-lg:py-4">Studio</Link><Link href="/contact" className="max-lg:px-2 max-lg:py-4">Contact</Link></span>
          </div>
          <div className="overflow-hidden leading-[.74] mb-[-0.09em] [container-type:inline-size]">
            <span className="block [font-family:'Archivo',sans-serif] font-bold text-[17.8cqw] tracking-[-0.05em] [font-variation-settings:'wdth'_104] whitespace-nowrap">CAREERS®</span>
          </div>
        </footer>
      </section>


      <ContactPill />
      <CareersRuntime />
    </div>
  );
}
