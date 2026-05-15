import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Le Camp MKR · Lutte Daghestan + MMA Tchétchénie'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Le Camp · Caucase · 1-3 sem',
    title: '1 à 3 semaines au Caucase',
    subtitle: 'Visa, vol intérieur, hébergement, 2 repas/jour, coaching local inclus.',
    bgImage: '/og-bg/sparring-mma-wall.png',
  })
}
