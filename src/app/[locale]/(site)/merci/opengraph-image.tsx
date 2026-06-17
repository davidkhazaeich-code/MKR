import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Candidature reçue MKR Caucasian Camp',
    keywords: 'Candidature',
    title: 'Candidature reçue',
    subtitle: 'Ruslan te rappelle sous 48h pour la visio de sélection.',
  },
  en: {
    alt: 'Application received MKR Caucasian Camp',
    keywords: 'Application',
    title: 'Application received',
    subtitle: 'Ruslan calls you back within 48h for the selection video call.',
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
    bgImage: '/og-bg/takedown-wrestling.png',
    locale,
  })
}
