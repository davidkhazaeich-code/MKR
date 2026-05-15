import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Destinations Daghestan et Tchétchénie'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Destinations · Caucase Nord',
    title: 'Deux terres de combat',
    subtitle: 'Daghestan pour la Lutte. Tchétchénie pour le MMA. Une discipline par camp.',
    bgImage: '/og-bg/dagestan-panorama.png',
  })
}
