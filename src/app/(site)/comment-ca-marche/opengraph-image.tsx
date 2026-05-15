import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Comment ça marche MKR · 6 étapes'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Comment ça marche',
    title: '6 étapes pour rejoindre le camp',
    subtitle: 'Inscription 5 min, visio Ruslan 48h, validation puis paiement post-visio.',
  })
}
