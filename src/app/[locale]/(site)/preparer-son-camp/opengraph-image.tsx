import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Préparer son camp MKR · Programme 6 semaines',
    keywords: 'Prépa · 6 semaines · Programme',
    title: '6 semaines pour être prêt',
    subtitle: 'Cardio, force, mobilité, équipement, préparation mentale.',
  },
  en: {
    alt: 'Prepare for your camp MKR · 6-week program',
    keywords: 'Prep · 6 weeks · Program',
    title: '6 weeks to be ready',
    subtitle: 'Cardio, strength, mobility, equipment, mental preparation.',
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
