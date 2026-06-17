import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'

const COPY = {
  fr: {
    alt: 'À propos MKR · Notre fondateur Ruslan Mukhtarov',
    keywords: 'Fondateur · Ruslan · INSEP',
    title: 'Ruslan Mukhtarov',
    subtitle: 'Ancien équipe de France de lutte, INSEP. MKR depuis 2018.',
  },
  en: {
    alt: 'About MKR · Our founder Ruslan Mukhtarov',
    keywords: 'Founder · Ruslan · INSEP',
    title: 'Ruslan Mukhtarov',
    subtitle: 'Former France wrestling team, INSEP. MKR since 2018.',
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
