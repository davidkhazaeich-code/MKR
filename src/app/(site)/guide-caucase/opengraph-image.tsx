import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Guide Caucase MKR · PDF gratuit 20 pages'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Guide PDF gratuit',
    title: '20 pages pour partir au Caucase',
    subtitle: 'Visa, vols, budget, préparation, équipement, culture. Téléchargement instantané.',
  })
}
