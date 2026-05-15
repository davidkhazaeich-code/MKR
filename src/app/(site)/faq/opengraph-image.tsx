import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'FAQ MKR Caucasian Camp'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Questions fréquentes',
    title: 'Tout savoir avant de partir',
    subtitle: 'Sécurité, logistique, entraînement, inscription. Les réponses aux 25+ questions clés.',
  })
}
