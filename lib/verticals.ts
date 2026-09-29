/**
 * The five Arohance verticals. The homepage's "Five verticals" rows render
 * from this list, and each vertical's own page should too, so names,
 * taglines and service anchors live in one place.
 *
 * The vertical pages are not built yet: `verticalHref` and `serviceHref`
 * are where they are expected to live, and until those routes exist these
 * links land on the 404 page.
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
};

export const VERTICALS: readonly Vertical[] = [
  {
    slug: 'build',
    name: 'Build',
    tagline: 'If it runs on code, we build it.',
    description: 'Custom technology, engineered from the ground up.',
    services: ['Websites', 'Apps', 'Custom Software', 'Automations', 'AI Solutions'],
    preview: '/images/17320eecd2.jpg',
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
    preview: '/images/3143905490.jpg',
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
    preview: '/images/ff551cbd9d.png',
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
    preview: '/images/b7afa59dc4.jpg',
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
    preview: '/images/8dc8938ce7.jpg',
  },
];

export const verticalHref = (v: Vertical) => `/services/${v.slug}`;

/** "Branding & Design" -> "branding-and-design": the id of that service's
 *  section on its vertical page. */
export const serviceAnchor = (service: string) =>
  service
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const serviceHref = (v: Vertical, service: string) => `${verticalHref(v)}#${serviceAnchor(service)}`;
