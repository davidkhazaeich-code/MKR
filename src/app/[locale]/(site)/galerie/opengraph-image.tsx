import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Galerie MKR Caucasian Camp',
    keywords: 'Galerie · Salles · Caucase',
    title: 'Le Caucase en images',
    subtitle: 'Salles, paysages, sparring, héritage culturel du Caucase Nord.',
  },
  en: {
    alt: 'Gallery MKR Caucasian Camp',
    keywords: 'Gallery · Gyms · Caucasus',
    title: 'The Caucasus in pictures',
    subtitle: 'Gyms, landscapes, sparring, cultural heritage of the North Caucasus.',
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
