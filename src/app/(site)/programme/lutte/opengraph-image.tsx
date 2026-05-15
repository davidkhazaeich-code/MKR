import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme Lutte au Daghestan · Méthode Khabib'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Lutte · Daghestan · Khabib',
    title: 'Méthode daghestanaise',
    subtitle: 'Leg rides, chain wrestling, takedowns. 30+ médaillés olympiques.',
    bgImage: '/og-bg/takedown-wrestling.png',
    accent: 'green',
  })
}
