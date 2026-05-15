import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Logistique camp · Visa, vols, budget'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Visa · Vols · Budget',
    title: 'On gère ton départ',
    subtitle: 'Visa russe inclus. Vols depuis Istanbul. Budget complet détaillé.',
    bgImage: '/og-bg/dagestan-panorama.png',
  })
}
