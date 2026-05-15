import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme Lutte au Daghestan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Programme Lutte · Daghestan',
    title: 'Lutte libre au Daghestan',
    subtitle: 'Méthode daghestanaise. Leg rides, chain wrestling, takedowns. 30+ médaillés olympiques.',
    accent: 'green',
  })
}
