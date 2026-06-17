/**
 * i18n helpers — T11 (2026-05-27)
 *
 * Construit les annotations hreflang bidirectionnelles + canonical + openGraph
 * + twitter pour chaque page Next.js localisée FR/EN.
 *
 * `getAlternateLinks(canonicalPath, currentLocale)` retourne :
 *   - canonical : URL absolue de la version courante (selon locale)
 *   - languages : map `{ fr, en, x-default }` pour `<link rel="alternate" hreflang="…">`
 *
 * `localizedMetadata(canonicalPath, locale, title, description, opts?)` assemble
 * un objet `Metadata` complet (title + description + alternates + openGraph + twitter)
 * prêt à être retourné depuis `generateMetadata()`.
 *
 * Pour le blog `/blog/[slug]` (slug dynamique localisé via `BLOG_SLUG_MAP`),
 * utiliser `getBlogAlternateLinks(canonicalSlug, currentLocale)` qui construit
 * les alternates manuellement en passant par `getBlogSlug()`.
 */

import type { Metadata } from 'next'
import { routing, type Locale, getBlogSlug } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

const SITE_URL = 'https://mkrcamp.com'
const DEFAULT_OG_WIDTH = 1376
const DEFAULT_OG_HEIGHT = 768

type PathnamesKey = keyof typeof routing.pathnames

export interface AlternateLinks {
  canonical: string
  languages: {
    fr: string
    en: string
    'x-default': string
  }
}

/**
 * Pour les pages statiques (pathnames mappées dans `routing.pathnames`).
 * Le `canonicalPath` est la clé FR (ex: `/le-camp`, `/programme/lutte`).
 */
export function getAlternateLinks(
  canonicalPath: PathnamesKey,
  currentLocale: Locale,
): AlternateLinks {
  // `getPathname` retourne le slug localisé (FR ou EN) à partir de la clé canonique FR.
  // En mode `localePrefix.as-needed` avec `prefixes.en='/en'`, next-intl renvoie déjà
  // le préfixe `/en` pour la locale EN (ex: `/en/the-camp`). Ne PAS le redoubler.
  // Pour le blog `[slug]`, le caller doit utiliser `getBlogAlternateLinks` à la place.
  const frPath = getPathname({ locale: 'fr', href: canonicalPath as never })
  const enPath = getPathname({ locale: 'en', href: canonicalPath as never })

  const frUrl = `${SITE_URL}${frPath}`
  const enUrl = `${SITE_URL}${enPath}`

  return {
    canonical: currentLocale === 'fr' ? frUrl : enUrl,
    languages: {
      fr: frUrl,
      en: enUrl,
      'x-default': frUrl,
    },
  }
}

/**
 * Variante pour les articles de blog. Le slug FR est la clé canonique, le slug EN
 * est résolu via `BLOG_SLUG_MAP` dans `routing.ts`.
 */
export function getBlogAlternateLinks(
  canonicalSlug: string,
  currentLocale: Locale,
): AlternateLinks {
  const frSlug = getBlogSlug(canonicalSlug, 'fr')
  const enSlug = getBlogSlug(canonicalSlug, 'en')

  const frUrl = `${SITE_URL}/blog/${frSlug}`
  const enUrl = `${SITE_URL}/en/blog/${enSlug}`

  return {
    canonical: currentLocale === 'fr' ? frUrl : enUrl,
    languages: {
      fr: frUrl,
      en: enUrl,
      'x-default': frUrl,
    },
  }
}

export interface LocalizedMetadataOpts {
  /** Override OG images (path relatif ou URL absolue). Défaut : og-image.webp partagée. */
  images?: Array<{ url: string; alt?: string; width?: number; height?: number }>
  /** Bloquer indexation (pages perso comme /merci, /coachs). */
  noindex?: boolean
  /** OG type (defaults to 'website'). Override to 'article' for blog posts. */
  ogType?: 'website' | 'article'
  /** Article publishedTime (ISO). Only used when ogType === 'article'. */
  publishedTime?: string
  /** Article modifiedTime (ISO). Only used when ogType === 'article'. */
  modifiedTime?: string
  /** Article authors. Only used when ogType === 'article'. */
  authors?: string[]
  /** Pre-built alternates (bypass `routing.pathnames`). Utilisé par le blog `[slug]`. */
  alternates?: AlternateLinks
  /** Pass-through pour overrides arbitraires (keywords, robots, verification, etc.). */
  extra?: Partial<Metadata>
}

/**
 * Construit un objet `Metadata` complet pour une page localisée.
 *
 * - title / description : déjà traduits par `getTranslations()` côté caller.
 * - alternates : hreflang bidirectionnel FR / EN / x-default.
 * - openGraph : url + locale + siteName + images.
 * - twitter : summary_large_image card.
 * - robots: noindex,nofollow si `opts.noindex === true`.
 */
export function localizedMetadata(
  canonicalPath: PathnamesKey,
  locale: Locale,
  title: string,
  description: string,
  opts?: LocalizedMetadataOpts,
): Metadata {
  const alternates = opts?.alternates ?? getAlternateLinks(canonicalPath, locale)

  // When the caller passes explicit images (e.g. blog uses the article image),
  // set them. Otherwise we OMIT openGraph.images so Next.js falls back to the
  // per-route file-convention `opengraph-image.tsx` (localized, page-specific),
  // which is inherited from the `(site)` group root for pages without their own.
  const images =
    opts?.images && opts.images.length > 0
      ? opts.images.map((img) => ({
          url: img.url.startsWith('http') ? img.url : `${SITE_URL}${img.url}`,
          width: img.width ?? DEFAULT_OG_WIDTH,
          height: img.height ?? DEFAULT_OG_HEIGHT,
          alt: img.alt ?? title,
        }))
      : undefined

  const ogType = opts?.ogType ?? 'website'

  const metadata: Metadata = {
    title,
    description,
    alternates,
    openGraph: {
      type: ogType,
      title,
      description,
      url: alternates.canonical,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: 'MKR Caucasian Camp',
      ...(images ? { images } : {}),
      ...(ogType === 'article' && opts?.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(ogType === 'article' && opts?.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
      ...(ogType === 'article' && opts?.authors ? { authors: opts.authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? { images: images.map((img) => img.url) } : {}),
    },
  }

  if (opts?.noindex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    }
  }

  if (opts?.extra) {
    return { ...metadata, ...opts.extra }
  }

  return metadata
}
