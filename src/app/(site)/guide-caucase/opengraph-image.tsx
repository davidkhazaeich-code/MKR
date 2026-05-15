import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Guide Caucase MKR · PDF gratuit 20 pages'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Guide gratuit · PDF · 20 pages',
    title: 'Le guide du Caucase',
    subtitle: 'Visa, vols, budget, prépa, équipement. 20 pages. Téléchargement instantané.',
    accent: 'gold',
  })
}
