import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Daghestan, Caucase russe · Camp Lutte MKR'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Destination · Daghestan',
    title: 'La terre qui forge les champions',
    subtitle: 'Berceau du MMA mondial. Makhachkala, Kaspiysk. Khabib, Makhachev, 30+ médailles olympiques.',
    accent: 'green',
  })
}
