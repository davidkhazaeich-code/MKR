import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Comment ça marche MKR · 6 étapes',
    keywords: 'Process · 6 étapes · 48h',
    title: '6 étapes vers le Caucase',
    subtitle: 'Inscription gratuite. Visio Ruslan sous 48h. Paiement après validation.',
  },
  en: {
    alt: 'How it works MKR · 6 steps',
    keywords: 'Process · 6 steps · 48h',
    title: '6 steps to the Caucasus',
    subtitle: 'Free registration. Video call with Ruslan within 48h. Payment after approval.',
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
