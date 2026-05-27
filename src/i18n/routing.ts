import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: {
    mode: 'as-needed',
    prefixes: { en: '/en' },
  },
  pathnames: {
    '/': '/',
    '/le-camp': { fr: '/le-camp', en: '/the-camp' },
    '/programme': { fr: '/programme', en: '/program' },
    '/programme/lutte': { fr: '/programme/lutte', en: '/program/wrestling' },
    '/programme/lutte-enfants': { fr: '/programme/lutte-enfants', en: '/program/youth-wrestling' },
    '/programme/mma': { fr: '/programme/mma', en: '/program/mma' },
    '/sessions': '/sessions',
    '/inscription': { fr: '/inscription', en: '/apply' },
    '/mkr-camp-2026': '/mkr-camp-2026',
    '/familles': { fr: '/familles', en: '/family' },
    '/sur-mesure': { fr: '/sur-mesure', en: '/custom' },
    '/clubs-groupes': { fr: '/clubs-groupes', en: '/clubs-groups' },
    '/destinations': '/destinations',
    '/destinations/dagestan': '/destinations/dagestan',
    '/destinations/tchetchenie': { fr: '/destinations/tchetchenie', en: '/destinations/chechnya' },
    '/coachs': { fr: '/coachs', en: '/coaches' },
    '/temoignages': { fr: '/temoignages', en: '/testimonials' },
    '/a-propos': { fr: '/a-propos', en: '/about' },
    '/contact': '/contact',
    '/faq': '/faq',
    '/galerie': { fr: '/galerie', en: '/gallery' },
    '/logistique': { fr: '/logistique', en: '/logistics' },
    '/comment-ca-marche': { fr: '/comment-ca-marche', en: '/how-it-works' },
    '/preparer-son-camp': { fr: '/preparer-son-camp', en: '/prepare-your-camp' },
    '/guide-caucase': { fr: '/guide-caucase', en: '/caucasus-guide' },
    '/merci': { fr: '/merci', en: '/thank-you' },
    '/cgv': { fr: '/cgv', en: '/terms' },
    '/mentions-legales': { fr: '/mentions-legales', en: '/legal' },
    '/politique-de-confidentialite': { fr: '/politique-de-confidentialite', en: '/privacy' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
  },
});

export type Locale = (typeof routing.locales)[number];

export const BLOG_SLUG_MAP: Record<string, { fr: string; en: string }> = {
  'pourquoi-le-dagestan-domine-le-mma': {
    fr: 'pourquoi-le-dagestan-domine-le-mma',
    en: 'why-dagestan-dominates-mma',
  },
  'preparer-son-premier-camp': {
    fr: 'preparer-son-premier-camp',
    en: 'preparing-your-first-camp',
  },
  'lutte-daghestanaise-guide-complet': {
    fr: 'lutte-daghestanaise-guide-complet',
    en: 'dagestani-wrestling-guide',
  },
  'securite-dagestan-2026': {
    fr: 'securite-dagestan-2026',
    en: 'dagestan-safety-2026',
  },
  'nutrition-athlete-combat': {
    fr: 'nutrition-athlete-combat',
    en: 'combat-athlete-nutrition',
  },
  'khabib-methode-entrainement': {
    fr: 'khabib-methode-entrainement',
    en: 'khabib-training-method',
  },
};

export function getBlogSlug(canonicalSlug: string, locale: Locale): string {
  return BLOG_SLUG_MAP[canonicalSlug]?.[locale] ?? canonicalSlug;
}

export function getCanonicalBlogSlug(localizedSlug: string): string | null {
  for (const [canonical, map] of Object.entries(BLOG_SLUG_MAP)) {
    if (map.fr === localizedSlug || map.en === localizedSlug) return canonical;
  }
  return null;
}
