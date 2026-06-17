import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'FAQ MKR Caucasian Camp',
    keywords: 'FAQ · Sécurité · Logistique',
    title: 'Toutes tes questions',
    subtitle: 'Sécurité, visa, paiement, niveau, équipement. 25+ réponses claires.',
  },
  en: {
    alt: 'FAQ MKR Caucasian Camp',
    keywords: 'FAQ · Safety · Logistics',
    title: 'All your questions',
    subtitle: 'Safety, visa, payment, level, equipment. 25+ clear answers.',
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
