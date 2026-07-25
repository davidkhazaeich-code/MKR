/**
 * BreadcrumbJsonLd — Injects BreadcrumbList structured data (JSON-LD).
 *
 * Usage in any page.tsx (les URL passees sont les URL CANONIQUES FR) :
 *
 *   <BreadcrumbJsonLd items={[
 *     { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
 *     { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/programme/lutte' },
 *   ]} />
 *
 * Le composant LOCALISE lui-meme les URL selon la locale courante. Avant le
 * 2026-07-25, les pages passaient des URL francaises ecrites en dur et le
 * composant les emettait telles quelles : sur /en/program/wrestling, le fil
 * d'Ariane structure declarait donc des `item` pointant vers les pages FR.
 * Google recevait un arbre de navigation incoherent avec l'URL de la page.
 *
 * Localiser ici plutot que dans chaque page.tsx evite d'avoir a maintenir la
 * correspondance FR/EN dans une vingtaine de fichiers.
 */

import { getLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

const SITE_URL = 'https://mkrcamp.com'

interface BreadcrumbItem {
  name: string
  /** URL absolue canonique FR, ex. `https://mkrcamp.com/programme/lutte`. */
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

type PathnamesKey = keyof typeof routing.pathnames

/**
 * Traduit une URL canonique FR vers la locale courante.
 * Retombe sur l'URL d'origine si le chemin n'est pas dans la table de routage
 * (cas des slugs dynamiques comme /blog/[slug], que les pages localisent
 * elles-memes avant de nous les passer).
 */
function localizeUrl(url: string, locale: Locale): string {
  if (!url.startsWith(SITE_URL)) return url
  const path = url.slice(SITE_URL.length) || '/'
  if (!(path in routing.pathnames)) return url
  try {
    return `${SITE_URL}${getPathname({ locale, href: path as PathnamesKey as never })}`
  } catch {
    return url
  }
}

export default async function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const locale = (await getLocale()) as Locale

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: localizeUrl(item.url, locale),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
