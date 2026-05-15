import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Logistique camp MKR · Visa, vols, budget'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Logistique',
    title: 'Visa, vols, budget',
    subtitle: 'Tout pour partir au Caucase : visa russe inclus, vols depuis Istanbul, budget complet.',
  })
}
