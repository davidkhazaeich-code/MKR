import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Famille MKR · Parent et enfant 8-17 ans'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Famille · 8-17 ans · Daghestan',
    title: 'Père & fils sur le tapis',
    subtitle: 'Parent + enfant 8-17 ans. Programme adapté, encadrement spécialisé.',
    bgImage: '/og-bg/takedown-wrestling.png',
    accent: 'green',
  })
}
