import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Sessions MKR 2026-2027 et tarifs',
    keywords: 'Sessions · 2026 · 2027',
    title: '4 sessions par an',
    subtitle: 'Été 2026. Toussaint. Hiver 2027. Pâques. 1, 2 ou 3 semaines au choix.',
  },
  en: {
    alt: 'MKR sessions 2026-2027 and pricing',
    keywords: 'Sessions · 2026 · 2027',
    title: '4 sessions a year',
    subtitle: 'Summer 2026. Autumn. Winter 2027. Spring. 1, 2 or 3 weeks of your choice.',
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
