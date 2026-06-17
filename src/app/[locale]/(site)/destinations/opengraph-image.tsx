import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Destinations Daghestan et Tchétchénie',
    keywords: 'Destinations · Caucase Nord',
    title: 'Deux terres de combat',
    subtitle: 'Daghestan pour la Lutte. Tchétchénie pour le MMA. Une discipline par camp.',
  },
  en: {
    alt: 'Destinations Dagestan and Chechnya',
    keywords: 'Destinations · North Caucasus',
    title: 'Two lands of combat',
    subtitle: 'Dagestan for Wrestling. Chechnya for MMA. One discipline per camp.',
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
