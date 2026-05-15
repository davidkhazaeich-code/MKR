import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Sur Mesure · Solo, Duo, Trio ou Quatuor'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Sur Mesure · Solo · Duo · Trio',
    title: 'Tes dates au Caucase',
    subtitle: 'Solo à Quatuor. Lutte, MMA ou combo Daghestan + Tchétchénie sur devis.',
    bgImage: '/og-bg/sparring-mma-wall.png',
  })
}
