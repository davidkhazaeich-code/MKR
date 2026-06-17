import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'MKR Camp 2026 · Session officielle 17 août',
    keywords: 'Été 2026 · Caucase · Officiel',
    title: '17 août · 5 septembre',
    subtitle: 'Session officielle MKR 2026 au Caucase. Adultes, 15 places par camp.',
  },
  en: {
    alt: 'MKR Camp 2026 · Official session August 17',
    keywords: 'Summer 2026 · Caucasus · Official',
    title: 'August 17 · September 5',
    subtitle: 'Official MKR 2026 session in the Caucasus. Adults, 15 spots per camp.',
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
