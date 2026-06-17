import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Conditions générales de vente MKR Caucasian Camp',
    keywords: 'Légal · CGV',
    title: 'Conditions générales',
    subtitle: 'Inscription, prix, annulation, prestations incluses. Toutes les règles du camp.',
  },
  en: {
    alt: 'Terms and conditions MKR Caucasian Camp',
    keywords: 'Legal · Terms',
    title: 'Terms and conditions',
    subtitle: 'Registration, pricing, cancellation, included services. Every camp rule.',
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
