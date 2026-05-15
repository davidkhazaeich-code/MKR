import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme Lutte Enfants 8-17 ans au Daghestan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Jeunesse 8-17 ans · Daghestan',
    title: 'Lutte pour la nouvelle génération',
    subtitle: 'Pédagogie progressive, encadrement spécialisé, parent obligatoire.',
    accent: 'green',
  })
}
