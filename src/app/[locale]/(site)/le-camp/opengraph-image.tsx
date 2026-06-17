import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Le Camp MKR · Lutte Daghestan + MMA Tchétchénie',
    keywords: 'Le Camp · Caucase · 1-3 sem',
    title: '1 à 3 semaines au Caucase',
    subtitle: 'Visa, vol intérieur, hébergement, 2 repas/jour, coaching local inclus.',
  },
  en: {
    alt: 'MKR Camp · Wrestling Dagestan and MMA Chechnya',
    keywords: 'The Camp · Caucasus · 1-3 wk',
    title: '1 to 3 weeks in the Caucasus',
    subtitle: 'Visa, domestic flight, accommodation, 2 meals per day, local coaching included.',
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
    bgImage: '/og-bg/sparring-mma-wall.png',
    locale,
  })
}
