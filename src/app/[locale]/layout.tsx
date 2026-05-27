import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { SITE_URL, SITE_NAME, SITE_EMAIL, SITE_DESCRIPTION, SOCIALS, GEO } from '@/data/site'
import { SESSIONS } from '@/data/sessions'
import { PRICING_TIERS } from '@/data/pricing'
import SiteLoader from '@/components/SiteLoader'
import { routing } from '@/i18n/routing'
import '../globals.css'

// Reset scroll instantane a chaque changement de route, couvre tout le site
// (site group + /inscription + /admin/*). Monte dans le root layout pour
// rester actif entre toutes les transitions de route.
const RouteScrollReset = dynamic(() => import('@/components/RouteScrollReset'))

const teko = Teko({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

// Pre-build des 2 locales en static
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const META_TITLE = `${SITE_NAME} · Camp MMA et Lutte au Caucase`
const META_DESC = `${SITE_DESCRIPTION} Rejoignez ${SITE_NAME}.`
const OG_IMAGE = `${SITE_URL}/images/social/og-image.webp`

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: `${SITE_URL}/` },
  verification: {
    other: {
      'msvalidate.01': 'E07A9AFC977FF65FAA32EA2E2033D513',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    title: META_TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} - Camp d'entrainement MMA & Lutte au Caucase` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

/* ==========================================================================
   STRUCTURED DATA — JSON-LD
   ==========================================================================
   All schema blocks are defined here in the root layout so they appear on
   every page. Page-specific schema (BreadcrumbList, Article, etc.) should
   be added in the corresponding page.tsx files.

   i18n note (2026-05-27) : `inLanguage` est dynamique selon la locale courante.
   La traduction des `description`/`name`/`slogan` viendra en phase suivante
   (T10 du plan) via getTranslations('meta'). En attendant, le contenu reste FR.
   ========================================================================== */

function buildJsonLd(locale: 'fr' | 'en') {
  const inLanguage = locale === 'fr' ? 'fr' : 'en'

  // ---------------------------------------------------------------------------
  // 1. WebSite
  // ---------------------------------------------------------------------------
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage,
    publisher: { '@id': `${SITE_URL}/#organization` },
  }

  // ---------------------------------------------------------------------------
  // 2. Main @graph - generated from data layer
  // ---------------------------------------------------------------------------
  const jsonLdMain = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person-ruslan`,
        name: 'Ruslan Mukhtarov',
        givenName: 'Ruslan',
        familyName: 'Mukhtarov',
        jobTitle: 'Fondateur et entraîneur de lutte et MMA',
        image: `${SITE_URL}/images/coaches/ruslan.webp`,
        url: `${SITE_URL}/a-propos`,
        sameAs: [SOCIALS.instagram],
        alumniOf: {
          '@type': 'SportsOrganization',
          name: "INSEP - Institut National du Sport, de l'Expertise et de la Performance",
          sameAs: 'https://www.insep.fr/',
        },
        memberOf: {
          '@type': 'SportsOrganization',
          name: 'Équipe de France de lutte',
          sameAs: 'https://www.fflutte.org/',
        },
        knowsAbout: ['Lutte libre', 'Lutte gréco-romaine', 'MMA', 'Arts martiaux mixtes', "Méthodes d'entraînement du Caucase"],
        worksFor: { '@id': `${SITE_URL}/#organization` },
        nationality: 'FR',
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo-mkr.png`, width: 512, height: 512 },
        image: `${SITE_URL}/images/social/og-image.webp`,
        description: SITE_DESCRIPTION,
        email: SITE_EMAIL,
        telephone: '+33666177691',
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+33666177691', email: SITE_EMAIL, availableLanguage: ['French', 'English'] },
        sameAs: Object.values(SOCIALS),
        foundingDate: '2018',
        founder: { '@id': `${SITE_URL}/#person-ruslan` },
        employee: [{ '@id': `${SITE_URL}/#person-ruslan` }],
        slogan: "L'immersion au milieu des champions",
        areaServed: { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude }, geoRadius: '500 km' },
        knowsAbout: ['MMA', 'Lutte libre', 'Lutte enfants', 'Arts martiaux', "Camp d'entraînement"],
        inLanguage: ['fr', 'en'],
      },
      {
        '@type': 'SportsActivityLocation',
        '@id': `${SITE_URL}/#location-dagestan`,
        name: `${SITE_NAME} · Camp Lutte Daghestan`,
        url: `${SITE_URL}/destinations/dagestan`,
        description: "Camp d'entraînement Lutte libre (adultes et enfants) au cœur du Daghestan, Caucase russe. Salles avec tapis olympiques, méthodes daghestanaises.",
        image: `${SITE_URL}/images/environment/gym-interior.webp`,
        address: { '@type': 'PostalAddress', addressCountry: 'RU', addressRegion: 'Daghestan', addressLocality: 'Makhachkala' },
        geo: { '@type': 'GeoCoordinates', latitude: 42.9849, longitude: 47.5047 },
        sport: ['Lutte libre', 'Lutte enfants'],
        priceRange: '€€',
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:00', closes: '22:00' }],
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Visa russe inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Vol intérieur Istanbul-Makhachkala inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Transfert aéroport', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Hébergement inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: '2 repas/jour', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Encadrement local inclus', value: true },
        ],
      },
      {
        '@type': 'SportsActivityLocation',
        '@id': `${SITE_URL}/#location-tchetchenie`,
        name: `${SITE_NAME} · Camp MMA Tchétchénie`,
        url: `${SITE_URL}/destinations/tchetchenie`,
        description: "Camp d'entraînement MMA en Tchétchénie, Caucase russe. Salles équipées cage MMA et équipement de frappe, sparring quotidien avec combattants locaux.",
        image: `${SITE_URL}/images/environment/gym-interior.webp`,
        address: { '@type': 'PostalAddress', addressCountry: 'RU', addressRegion: 'Tchétchénie', addressLocality: 'Grozny' },
        geo: { '@type': 'GeoCoordinates', latitude: 43.3168, longitude: 45.6981 },
        sport: ['MMA', 'Arts martiaux mixtes'],
        priceRange: '€€',
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:00', closes: '22:00' }],
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Visa russe inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Vol intérieur Istanbul-Grozny inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Transfert aéroport', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Hébergement inclus', value: true },
          { '@type': 'LocationFeatureSpecification', name: '2 repas/jour', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Encadrement local inclus', value: true },
        ],
      },
      ...SESSIONS.map((s) => {
        const sessionYear = new Date(s.startDate).getFullYear()
        const availability =
          s.status === 'closed'
            ? 'https://schema.org/SoldOut'
            : s.status === 'limited'
              ? 'https://schema.org/LimitedAvailability'
              : 'https://schema.org/InStock'
        return {
          '@type': 'Event',
          '@id': `${SITE_URL}/#event-${s.id}`,
          name: `${SITE_NAME} - Session ${s.season} ${sessionYear}`,
          description: `Session ${s.season.toLowerCase()} ${sessionYear} de 1 à 3 semaines : ${s.maxCapacity.lutte} places Lutte au Daghestan + ${s.maxCapacity.mma} places MMA en Tchétchénie (exclusif). Coaching local, hébergement et repas inclus.`,
          startDate: s.startDate,
          endDate: s.endDate,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: [
            { '@id': `${SITE_URL}/#location-dagestan` },
            { '@id': `${SITE_URL}/#location-tchetchenie` },
          ],
          image: `${SITE_URL}/images/social/og-image.webp`,
          url: `${SITE_URL}/sessions`,
          organizer: { '@id': `${SITE_URL}/#organization` },
          offers: {
            '@type': 'AggregateOffer',
            name: `Session ${s.season} ${sessionYear}`,
            lowPrice: String(PRICING_TIERS.club.perAdult[1]),
            highPrice: String(PRICING_TIERS.duo.perAdult[3]),
            priceCurrency: s.priceCurrency,
            offerCount: 9,
            availability,
            url: `${SITE_URL}/inscription`,
            validFrom: '2025-12-01',
          },
          maximumAttendeeCapacity: s.maxCapacity.lutte + s.maxCapacity.mma,
          inLanguage,
        }
      }),
    ],
  }

  return { jsonLdWebSite, jsonLdMain }
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: requestedLocale } = await params
  if (!hasLocale(routing.locales, requestedLocale)) notFound()

  const locale = requestedLocale as 'fr' | 'en'
  setRequestLocale(locale)
  const messages = await getMessages()

  const { jsonLdWebSite, jsonLdMain } = buildJsonLd(locale)

  return (
    <html
      lang={locale}
      className={`${teko.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMain) }}
        />
        {/* Marker teaser pre-hydration : signale a SiteLoader d'attendre l'event mkr-teaser-end
            avant de demarrer sa sequence GSAP. Auto-cleanup post 2026-05-27. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(Date.now()>=new Date('2026-05-27T00:00:00Z').getTime())return;if(localStorage.getItem('mkr_teaser_seen_2026_05_v1')==='1')return;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.documentElement.setAttribute('data-teaser-active','1');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SiteLoader />
          {/* Suspense requis : RouteScrollReset utilise useSearchParams (Next.js 16+) */}
          <Suspense fallback={null}>
            <RouteScrollReset />
          </Suspense>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
