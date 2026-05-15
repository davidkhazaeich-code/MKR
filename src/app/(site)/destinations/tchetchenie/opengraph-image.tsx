import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Tchétchénie, Caucase russe · Camp MMA MKR'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Destination · Tchétchénie',
    title: 'La terre du MMA moderne',
    subtitle: 'Grozny, Akhmat Fight Club. Héritage Khamzat Chimaev. Niveau avancé exigé.',
    accent: 'orange',
  })
}
