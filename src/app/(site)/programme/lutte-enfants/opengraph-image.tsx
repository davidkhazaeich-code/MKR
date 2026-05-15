import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Lutte Enfants 8-17 ans au Daghestan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Jeunesse 8-17 ans · Daghestan',
    title: 'La nouvelle génération',
    subtitle: 'Lutte adaptée 8-17 ans avec parent. Pédagogie progressive, cadre sécurisant.',
    accent: 'green',
  })
}
