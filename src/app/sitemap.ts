import type { MetadataRoute } from 'next';
import { routing, BLOG_SLUG_MAP } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

const SITE_URL = 'https://mkrcamp.com';

const STATIC_PATHS = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/le-camp', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/programme', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/programme/lutte', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/programme/lutte-enfants', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/programme/mma', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/sessions', priority: 0.95, changeFrequency: 'weekly' as const },
  { path: '/inscription', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/mkr-camp-2026', priority: 0.95, changeFrequency: 'weekly' as const },
  { path: '/familles', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/sur-mesure', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/clubs-groupes', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/destinations', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/destinations/dagestan', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/destinations/tchetchenie', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/temoignages', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/a-propos', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/galerie', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/logistique', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/comment-ca-marche', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/preparer-son-camp', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/guide-caucase', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/cgv', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/mentions-legales', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/politique-de-confidentialite', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    for (const locale of routing.locales) {
      const url = `${SITE_URL}${getPathname({ locale, href: path as never })}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            fr: `${SITE_URL}${getPathname({ locale: 'fr', href: path as never })}`,
            en: `${SITE_URL}${getPathname({ locale: 'en', href: path as never })}`,
            'x-default': `${SITE_URL}${getPathname({ locale: 'fr', href: path as never })}`,
          },
        },
      });
    }
  }

  for (const canonicalSlug of Object.keys(BLOG_SLUG_MAP)) {
    for (const locale of routing.locales) {
      const slug = BLOG_SLUG_MAP[canonicalSlug][locale];
      const url = `${SITE_URL}${locale === 'fr' ? '' : '/en'}/blog/${slug}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
        alternates: {
          languages: {
            fr: `${SITE_URL}/blog/${BLOG_SLUG_MAP[canonicalSlug].fr}`,
            en: `${SITE_URL}/en/blog/${BLOG_SLUG_MAP[canonicalSlug].en}`,
            'x-default': `${SITE_URL}/blog/${BLOG_SLUG_MAP[canonicalSlug].fr}`,
          },
        },
      });
    }
  }

  return entries;
}
