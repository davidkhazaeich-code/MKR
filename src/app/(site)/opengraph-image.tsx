import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'MKR Caucasian Camp · Camp MMA et Lutte au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'MKR Caucasian Camp',
    title: 'Camp MMA et Lutte au Caucase',
    subtitle: 'Lutte au Daghestan, MMA en Tchétchénie. 4 sessions par an.',
  })
}
