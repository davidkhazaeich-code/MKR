import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Programme MKR · 3 disciplines au Caucase',
    keywords: 'Programme · 3 disciplines',
    title: 'Forge ton arme',
    subtitle: 'MMA Tchétchénie. Lutte adultes Daghestan. Lutte jeunesse 8-17 ans.',
  },
  en: {
    alt: 'MKR program · 3 disciplines in the Caucasus',
    keywords: 'Program · 3 disciplines',
    title: 'Forge your weapon',
    subtitle: 'MMA Chechnya. Adult wrestling Dagestan. Youth wrestling 8-17.',
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
