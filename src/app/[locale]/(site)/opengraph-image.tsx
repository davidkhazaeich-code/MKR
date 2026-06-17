import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'MKR Caucasian Camp · Camp MMA et Lutte au Caucase',
    keywords: 'Caucase · Lutte · MMA',
    title: 'Naissent les champions',
    subtitle: 'Khabib. Makhachev. Akhmat. Lutte au Daghestan, MMA en Tchétchénie.',
  },
  en: {
    alt: 'MKR Caucasian Camp · MMA and Wrestling camp in the Caucasus',
    keywords: 'Caucasus · Wrestling · MMA',
    title: 'Where champions are born',
    subtitle: 'Khabib. Makhachev. Akhmat. Wrestling in Dagestan, MMA in Chechnya.',
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
