import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Sur Mesure MKR · Tes dates au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Camp Sur Mesure',
    title: 'Tes dates au Caucase',
    subtitle: 'Solo, Duo, Trio ou Quatuor. Lutte, MMA ou combo Daghestan + Tchétchénie sur devis.',
  })
}
