import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Témoignages MKR · Antoine, LAMP et les autres',
    keywords: 'Témoignages · Antoine · LAMP',
    title: 'Ils sont revenus changés',
    subtitle: 'Antoine Petit-Jean, LAMP et 10+ athlètes racontent leur camp.',
  },
  en: {
    alt: 'MKR testimonials · Antoine, LAMP and the others',
    keywords: 'Testimonials · Antoine · LAMP',
    title: 'They came back changed',
    subtitle: 'Antoine Petit-Jean, LAMP and 10+ athletes share their camp.',
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
