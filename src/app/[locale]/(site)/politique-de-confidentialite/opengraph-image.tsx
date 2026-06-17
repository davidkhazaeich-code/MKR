import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Politique de confidentialité MKR Caucasian Camp',
    keywords: 'Légal · RGPD',
    title: 'Confidentialité',
    subtitle: 'Données collectées, cookies et tes droits. Transparence totale.',
  },
  en: {
    alt: 'Privacy policy MKR Caucasian Camp',
    keywords: 'Legal · GDPR',
    title: 'Privacy policy',
    subtitle: 'Data collected, cookies and your rights. Full transparency.',
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
