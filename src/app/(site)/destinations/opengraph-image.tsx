import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Destinations Daghestan et Tchétchénie'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Destinations',
    title: 'Daghestan et Tchétchénie',
    subtitle: 'Deux terres du Caucase Nord. Une discipline par camp.',
  })
}
