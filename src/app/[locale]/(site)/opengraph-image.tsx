import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'MKR Caucasian Camp · Camp MMA et Lutte au Caucase',
    keywords: 'Caucase · Lutte · MMA',
    title: 'Naissent les champions',
    subtitle: 'Lutte au Daghestan, MMA en Tchétchénie. L’immersion au milieu des champions.',
  },
  en: {
    alt: 'MKR Caucasian Camp · MMA and Wrestling camp in the Caucasus',
    keywords: 'Caucasus · Wrestling · MMA',
    title: 'Where champions are born',
    subtitle: 'Wrestling in Dagestan, MMA in Chechnya. Immersion among champions.',
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
