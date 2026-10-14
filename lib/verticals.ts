/**
 * The five Arohance verticals. The homepage's "Five verticals" rows and each
 * vertical's own page (app/services/[slug]/page.tsx) render from this list,
 * so names, taglines and service anchors live in one place.
 */
export type Vertical = {
  slug: string;
  /** Rendered as "Arohance {name}". */
  name: string;
  tagline: string;
  description: string;
  services: readonly string[];
  /** Homepage row preview: trails the cursor on desktop, inline on touch. */
  preview: string;
  /** Lead copy on the vertical's own page, under the header. */
  intro: string;
  introTitle?: string;
  /** Media on the vertical's own page. `.mp4` entries play muted on a loop;
   *  w/h reserve each item's box before it loads. */
  media?: readonly Media[];
  /** How app/services/[slug] lays out `media`: a scroll-stacked deck of browser
   *  windows, or one framed clip over crossed service ribbons. Studios has
   *  neither: app/studio/page.tsx lays out its own. */
  layout?: 'stack' | 'feature';
};

export type Media = { src: string; w: number; h: number };

const BUILD_SHOTS = ['181621', '181643', '181658', '181711', '181725', '181739', '181753', '182011'].map(
  (t): Media => ({ src: `/arohance-build/Screenshot 2026-10-13 ${t}.webp`, w: 1900, h: 866 }),
);

const studioImage = (name: string, w: number, h: number): Media => ({ src: `/arohance-studio/images/${name}.webp`, w, h });
const studioReel = (name: string, w = 406, h = 720): Media => ({ src: `/arohance-studio/videos/${name}.mp4`, w, h });

export const VERTICALS: readonly Vertical[] = [
  {
    slug: 'build',
    name: 'Build',
    tagline: 'If it runs on code, we build it.',
    description: 'Custom technology, engineered from the ground up.',
    services: ['Websites', 'Apps', 'Custom Software', 'Automations', 'AI Solutions'],
    preview: '/verticals/build.png',
    intro:
      'Today, everything runs on code. At Arohance Build, we make sure yours works for you. We craft websites, apps, custom software and AI solutions shaped around how your business actually works. We listen first, build with care, and hand you technology that feels less like a tool and more like your best team member.',
    media: BUILD_SHOTS,
    layout: 'stack',
  },
  {
    slug: 'social',
    name: 'Social',
    tagline: "We don't go viral. We go magnetic.",
    description: 'Social media that builds brands people follow and trust.',
    services: [
      'Strategy Formation',
      'Social Media Marketing',
      'Performance Marketing',
      'Influencer Campaigns',
      'Founder Personal Branding',
      'Branding & Design',
    ],
    preview: '/verticals/social.png',
    intro:
      'Today, every brand is just one scroll away from being seen or forgotten. At Arohance Social, we make sure yours stays. From strategy and social media to performance marketing, influencer campaigns, founder branding and design, we shape how people see you, talk about you and remember you. Not just more followers, but a following that believes in you.',
  },
  {
    slug: 'experience',
    name: 'Experience',
    tagline: 'Moments people remember.',
    description: 'Real-world brand moments, amplified online.',
    services: [
      'Experience-Led Brand Events',
      'Gamified Brand Experiences',
      'Street Marketing',
      'Public Space Activations',
      'Campaign Ideation & Execution',
    ],
    preview: '/verticals/experience.png',
    introTitle: 'Experiences that get people talking',
    intro:
      'Long before ads and algorithms, brands grew the way stories do: one person telling another. At Arohance Experience, we bring that magic back. We take your product off the shelf and into people’s hands through on-ground activations. We let them try it, listen to what they say, and create moments they’ll keep talking about long after.',
    media: [{ src: '/arohance-experience/Video-3792-compressed.mp4', w: 406, h: 720 }],
    layout: 'feature',
  },
  {
    slug: 'inside',
    name: 'Inside',
    tagline: 'The agency that works from your desk.',
    description: 'Arohance talent inside your team, full agency behind them.',
    services: [
      'In-Office Team Placement',
      'Social Media Strategy',
      'Shoots & Edits',
      'Design',
      'Social Media Management',
    ],
    preview: '/verticals/inside.png',
    intro:
      'The best stories don’t wait for a scheduled shoot. At Arohance Inside, one of our team sits right in your office, full time, so no moment slips by. A bride walks in with her mother’s bangles to remake them for her wedding, and we’re there to capture it. The rest, we handle behind the scenes. Your stories, caught as they happen.',
  },
  {
    slug: 'studios',
    name: 'Studios',
    tagline: 'Lights. Camera. Arohance.',
    description: 'Film, ads and content that capture attention.',
    services: [
      'Ad Shoots',
      'AI-Powered Ads',
      'Product Shoots',
      'Podcasts',
      'Corporate Event Coverage',
      'Pre-Event Hype Building',
    ],
    preview: '/verticals/studio.png',
    intro:
      'Every brand has a story worth seeing. At Arohance Studios, we bring it to the screen. From ad shoots and product shoots to AI-powered ads, podcasts and corporate event coverage, we create content that looks good and lands even better. And before your big day arrives, we build the buzz so people are already talking.',
    media: [
      studioImage('DSC09260', 3170, 3170),
      studioReel('D2-compressed'),
      studioImage('KALTIVATED KARAT-04023', 4672, 7008),
      studioImage('DSC09326', 4000, 4000),
      studioReel('D10-compressed'),
      studioImage('KULTIVATED KARATS-03934 (1)', 4672, 7008),
      studioReel('D11-compressed'),
      studioImage('DSC09400', 3583, 3583),
      studioReel('D 28-compressed'),
      studioImage('KALTIVATED KARAT-04052', 4672, 7008),
      studioReel('D 30-compressed', 1080, 1920),
      studioImage('DSC09403', 3953, 3953),
      studioReel('D 46-compressed'),
      studioReel('Video Project 1', 1280, 720),
    ],
  },
];

/** Studios lives at /studio, on that page's own layout; the rest share app/services/[slug]. */
export const verticalHref = (v: Vertical) => (v.slug === 'studios' ? '/studio' : `/services/${v.slug}`);

/** "Branding & Design" -> "branding-and-design": the id of that service's
 *  section on its vertical page. */
export const serviceAnchor = (service: string) =>
  service
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const serviceHref = (v: Vertical, service: string) => `${verticalHref(v)}#${serviceAnchor(service)}`;
