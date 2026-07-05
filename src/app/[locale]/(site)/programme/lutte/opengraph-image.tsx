import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Programme Lutte au Daghestan · Berceau de la lutte',
    keywords: 'Lutte · Daghestan · Champions',
    title: 'Méthode daghestanaise',
    subtitle: 'Leg rides, chain wrestling, takedowns. 30+ médaillés olympiques.',
  },
  en: {
    alt: 'Wrestling program in Dagestan · The home of wrestling',
    keywords: 'Wrestling · Dagestan · Champions',
    title: 'Dagestani method',
    subtitle: 'Leg rides, chain wrestling, takedowns. 30+ Olympic medalists.',
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
