import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

const NAMESPACES = [
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
  'data.sessions',
  'data.faq',
  'data.testimonials',
  'data.registration-types',
  'data.antoine-parcours',
  'data.coaches',
  'meta',
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages: Record<string, unknown> = {};
  for (const ns of NAMESPACES) {
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

  return { locale, messages };
});
