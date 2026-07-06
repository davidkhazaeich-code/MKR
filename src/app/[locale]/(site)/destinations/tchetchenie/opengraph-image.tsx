import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Tchétchénie · Grozny · Camp MMA',
    keywords: 'Tchétchénie · Grozny · MMA',
    title: 'L\'épicentre du MMA',
    subtitle: 'Écuries professionnelles de Grozny. Sparring du top mondial.',
  },
  en: {
    alt: 'Chechnya · Grozny · MMA Camp',
    keywords: 'Chechnya · Grozny · MMA',
    title: 'The epicenter of MMA',
    subtitle: 'Grozny professional teams. World-class sparring.',
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
    accent: 'orange',
    bgImage: '/og-bg/mosque-grozny.png',
    locale,
  })
}
