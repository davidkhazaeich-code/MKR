import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Tchétchénie · Grozny · Akhmat Fight Club',
    keywords: 'Tchétchénie · Grozny · MMA',
    title: 'L\'épicentre du MMA',
    subtitle: 'Akhmat Fight Club. Héritage Khamzat Chimaev. Ecuries d\'État.',
  },
  en: {
    alt: 'Chechnya · Grozny · Akhmat Fight Club',
    keywords: 'Chechnya · Grozny · MMA',
    title: 'The epicenter of MMA',
    subtitle: 'Akhmat Fight Club. Khamzat Chimaev legacy. State-backed teams.',
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
    locale,
  })
}
