import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Contact MKR · Ruslan répond en 48h'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Contact · WhatsApp · 48h',
    title: 'Parle à Ruslan',
    subtitle: 'WhatsApp, email, Instagram. Réponse personnelle en moins de 48h.',
    bgImage: '/og-bg/dagestan-panorama.png',
  })
}
