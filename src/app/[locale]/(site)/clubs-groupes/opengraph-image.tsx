import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Camp Clubs et Groupes MKR · 5 à 20 personnes',
    keywords: 'Club · Groupe · 5 à 20',
    title: 'Ton club au Caucase',
    subtitle: '5 à 20 personnes. Hébergement bloc, programme adapté, devis personnalisé.',
  },
  en: {
    alt: 'MKR Clubs and Groups camp · 5 to 20 people',
    keywords: 'Club · Group · 5 to 20',
    title: 'Your club in the Caucasus',
    subtitle: '5 to 20 people. Block accommodation, tailored program, custom quote.',
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
