import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Galerie MKR Caucasian Camp'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Galerie · Salles · Caucase',
    title: 'Le Caucase en images',
    subtitle: 'Salles, paysages, sparring, héritage culturel du Caucase Nord.',
  })
}
