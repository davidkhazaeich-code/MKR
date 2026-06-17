import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Blog MKR · Récits et méthodes du Caucase',
    keywords: 'Blog · Méthodes · Récits',
    title: 'Au cœur du Caucase',
    subtitle: 'Pourquoi le Daghestan, méthode Khabib, sécurité, nutrition, préparation.',
  },
  en: {
    alt: 'MKR blog · Stories and methods from the Caucasus',
    keywords: 'Blog · Methods · Stories',
    title: 'Inside the Caucasus',
    subtitle: 'Why Dagestan, the Khabib method, safety, nutrition, preparation.',
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
