import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'MKR Caucasian Camp · Camp MMA et Lutte au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Caucase · Lutte · MMA',
    title: 'Naissent les champions',
    subtitle: 'Khabib. Makhachev. Akhmat. Lutte au Daghestan, MMA en Tchétchénie.',
    bgImage: '/og-bg/dagestan-panorama.png',
  })
}
