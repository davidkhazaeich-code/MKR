import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Sessions MKR 2026-2027 et tarifs'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Sessions · 2026 · 2027',
    title: '4 sessions par an',
    subtitle: 'Été 2026. Toussaint. Hiver 2027. Pâques. 1, 2 ou 3 semaines au choix.',
    bgImage: '/og-bg/sparring-mma-wall.png',
  })
}
