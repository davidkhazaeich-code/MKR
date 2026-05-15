import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Le Camp MKR · Lutte au Daghestan, MMA en Tchétchénie'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Le Camp',
    title: '1 à 3 semaines au Caucase',
    subtitle: 'Lutte au Daghestan, MMA en Tchétchénie. Hébergement, repas, coaching local inclus.',
  })
}
