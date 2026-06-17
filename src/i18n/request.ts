import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

const FLAT_NAMESPACES = [
  'common',
  'home',
  'le-camp',
  'programme',
  'sessions',
  'inscription',
  'familles',
  'sur-mesure',
  'clubs-groupes',
  'destinations',
  'temoignages',
  'a-propos',
  'contact',
  'faq',
  'galerie',
  'logistique',
  'comment-ca-marche',
  'preparer-son-camp',
  'guide-caucase',
  'merci',
  'cgv',
  'mentions-legales',
  'politique-de-confidentialite',
  'coachs',
  'mkr-camp-2026',
  'blog',
  'meta',
  'pricing_table',
] as const;

// Data namespaces are nested under `data.*` so next-intl resolves them via
// namespace strings like `data.sessions`, `data.faq`, etc. The file on disk
// is messages/<locale>/data.<name>.json but it is mounted at messages.data.<name>.
const DATA_NAMESPACES = [
  'sessions',
  'faq',
  'testimonials',
  'registration-types',
  'antoine-parcours',
  'coaches',
] as const;

const BLOG_SLUGS = [
  'pourquoi-le-dagestan-domine-le-mma',
  'preparer-son-premier-camp',
  'lutte-daghestanaise-guide-complet',
  'securite-dagestan-2026',
  'nutrition-athlete-combat',
  'khabib-methode-entrainement',
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages: Record<string, unknown> = {};

  // Load flat namespaces from messages/<locale>/<ns>.json
  for (const ns of FLAT_NAMESPACES) {
    try {
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      messages[ns] = mod.default;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing messages/${locale}/${ns}.json`);
      }
      messages[ns] = {};
    }
  }

  // Load data namespaces from messages/<locale>/data.<name>.json and mount
  // them at messages.data.<name> so next-intl can resolve `data.<name>`.
  const dataBucket: Record<string, unknown> = {};
  for (const name of DATA_NAMESPACES) {
    try {
      const mod = await import(`../../messages/${locale}/data.${name}.json`);
      dataBucket[name] = mod.default;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing messages/${locale}/data.${name}.json`);
      }
      dataBucket[name] = {};
    }
  }
  messages.data = dataBucket;

  // Load per-slug blog content from messages/<locale>/blog/<slug>.json
  // Each ends up as the namespace `blog.<slug>` (consumed via getTranslations(`blog.${slug}`)).
  const blogMessages: Record<string, unknown> = (messages.blog as Record<string, unknown>) ?? {};
  for (const slug of BLOG_SLUGS) {
    try {
      const mod = await import(`../../messages/${locale}/blog/${slug}.json`);
      blogMessages[slug] = mod.default;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing messages/${locale}/blog/${slug}.json`);
      }
      blogMessages[slug] = {};
    }
  }
  messages.blog = blogMessages;

  return { locale, messages };
});
