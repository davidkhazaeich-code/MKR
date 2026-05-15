import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme MKR · 3 disciplines au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Programme · 3 disciplines',
    title: 'Forge ton arme',
    subtitle: 'MMA Tchétchénie. Lutte adultes Daghestan. Lutte jeunesse 8-17 ans.',
  })
}
