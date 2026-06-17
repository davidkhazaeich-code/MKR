import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Camp Famille MKR · Parent et enfant 8-17 ans',
    keywords: 'Famille · 8-17 ans · Daghestan',
    title: 'Père et fils sur le tapis',
    subtitle: 'Parent + enfant 8-17 ans. Programme adapté, encadrement spécialisé.',
  },
  en: {
    alt: 'MKR Family Camp · Parent and child 8-17 years old',
    keywords: 'Family · 8-17 years · Dagestan',
    title: 'Father and son on the mat',
    subtitle: 'Parent + child 8-17 years old. Tailored program, specialized coaching.',
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
