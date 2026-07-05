import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Daghestan · La terre des champions',
    keywords: 'Daghestan · Makhachkala · Lutte',
    title: 'La terre des champions',
    subtitle: '30+ champions olympiques. 3 champions UFC. Berceau du MMA mondial.',
  },
  en: {
    alt: 'Dagestan · The land of champions',
    keywords: 'Dagestan · Makhachkala · Wrestling',
    title: 'The land of champions',
    subtitle: '30+ Olympic champions. 3 UFC champions. Cradle of world MMA.',
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
    accent: 'green',
    locale,
  })
}
