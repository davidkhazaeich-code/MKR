import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'Programme MMA à Grozny · Akhmat Fight Club',
    keywords: 'MMA · Tchétchénie · Akhmat',
    title: 'Akhmat Fight Club',
    subtitle: 'Sparring quotidien avec l\'écurie tchétchène. Niveau avancé minimum.',
  },
  en: {
    alt: 'MMA program in Grozny · Akhmat Fight Club',
    keywords: 'MMA · Chechnya · Akhmat',
    title: 'Akhmat Fight Club',
    subtitle: 'Daily sparring with the Chechen team. Advanced level minimum.',
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
