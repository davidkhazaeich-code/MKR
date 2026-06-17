import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Contact MKR · Ruslan répond en 48h',
    keywords: 'Contact · WhatsApp · 48h',
    title: 'Parle à Ruslan',
    subtitle: 'WhatsApp, email, Instagram. Réponse personnelle en moins de 48h.',
  },
  en: {
    alt: 'Contact MKR · Ruslan replies within 48h',
    keywords: 'Contact · WhatsApp · 48h',
    title: 'Talk to Ruslan',
    subtitle: 'WhatsApp, email, Instagram. Personal reply in under 48h.',
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
