import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Famille MKR · Parent et enfant au Daghestan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Camp Famille · Daghestan',
    title: 'Parent et enfant côte à côte',
    subtitle: 'Enfant 8-17 ans avec parent participant. Programme adapté, encadrement spécialisé.',
    accent: 'green',
  })
}
