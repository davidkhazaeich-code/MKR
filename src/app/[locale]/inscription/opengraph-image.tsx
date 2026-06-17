import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Inscription MKR Caucasian Camp',
    keywords: 'Inscription · Gratuite · 5 min',
    title: 'Postule au camp',
    subtitle: '4 tunnels : session, sur mesure, famille, club. Ruslan recontacte en 48h.',
  },
  en: {
    alt: 'MKR Caucasian Camp application',
    keywords: 'Application · Free · 5 min',
    title: 'Apply to the camp',
    subtitle: '4 paths: session, custom, family, club. Ruslan replies within 48h.',
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
