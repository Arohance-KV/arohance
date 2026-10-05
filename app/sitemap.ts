import type { MetadataRoute } from 'next';
import { WORK, workHref } from '@/lib/work';
import { VERTICALS, verticalHref } from '@/lib/verticals';

// Served at /sitemap.xml; submit that URL in Google Search Console.
const SITE = 'https://arohance.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/', '/about', '/services', '/studio', '/careers', '/contact',
    ...VERTICALS.map(verticalHref),
    ...WORK.map(workHref),
  ];
  return paths.map((p) => ({ url: SITE + p }));
}
