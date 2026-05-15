import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Comment ça marche MKR · 6 étapes'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Process · 6 étapes · 48h',
    title: '6 étapes vers le Caucase',
    subtitle: 'Inscription gratuite. Visio Ruslan sous 48h. Paiement après validation.',
    bgImage: '/og-bg/dagestan-panorama.png',
  })
}
