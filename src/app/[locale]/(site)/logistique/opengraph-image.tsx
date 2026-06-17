import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Logistique camp · Visa, vols, budget',
    keywords: 'Visa · Vols · Budget',
    title: 'On gère ton départ',
    subtitle: 'Visa russe inclus. Vols depuis Istanbul. Budget complet détaillé.',
  },
  en: {
    alt: 'Camp logistics · Visa, flights, budget',
    keywords: 'Visa · Flights · Budget',
    title: 'We handle your departure',
    subtitle: 'Russian visa included. Flights from Istanbul. Full detailed budget.',
  },
} as const

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = raw === 'en' ? 'en' : 'fr'
  return [{ id: 'og', alt: COPY[locale].alt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function OG({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = raw === 'en' ? 'en' : 'fr'
  const c = COPY[locale]
  return createOgImageResponse({
    keywords: c.keywords,
    title: c.title,
    subtitle: c.subtitle,
    bgImage: '/og-bg/dagestan-panorama.png',
    locale,
  })
}
