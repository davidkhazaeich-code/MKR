import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'FAQ MKR Caucasian Camp'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'FAQ · Sécurité · Logistique',
    title: 'Toutes tes questions',
    subtitle: 'Sécurité, visa, paiement, niveau, équipement. 25+ réponses claires.',
  })
}
