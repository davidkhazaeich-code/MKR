import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Coachs locaux du Caucase MKR Caucasian Camp',
    keywords: 'Coachs · Caucase',
    title: 'Les coachs du Caucase',
    subtitle: 'Coachs daghestanais et tchétchènes en poste à l’année. Lutte et MMA.',
  },
  en: {
    alt: 'Local Caucasus coaches MKR Caucasian Camp',
    keywords: 'Coaches · Caucasus',
    title: 'The Caucasus coaches',
    subtitle: 'Dagestani and Chechen coaches working year-round. Wrestling and MMA.',
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
    locale,
  })
}
