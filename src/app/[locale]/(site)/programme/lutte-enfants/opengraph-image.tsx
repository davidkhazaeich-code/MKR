import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Lutte Enfants 8-17 ans au Daghestan',
    keywords: 'Jeunesse 8-17 ans · Daghestan',
    title: 'La nouvelle génération',
    subtitle: 'Lutte adaptée 8-17 ans avec parent. Pédagogie progressive, cadre sécurisant.',
  },
  en: {
    alt: 'Youth Wrestling 8-17 years in Dagestan',
    keywords: 'Youth 8-17 years · Dagestan',
    title: 'The new generation',
    subtitle: 'Wrestling adapted for kids 8-17 with a parent. Progressive teaching, safe environment.',
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
    accent: 'green',
    locale,
  })
}
