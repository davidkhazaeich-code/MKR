import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Témoignages MKR · Antoine, LAMP et les autres'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Témoignages',
    title: 'Ils sont revenus transformés',
    subtitle: 'Antoine Petit-Jean, LAMP et 10+ autres athlètes racontent leur camp.',
  })
}
