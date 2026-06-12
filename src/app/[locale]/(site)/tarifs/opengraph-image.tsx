import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Tarifs MKR · Camp MMA et Lutte au Caucase, tout compris'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Tarifs · Tout compris · Caucase',
    title: 'Un prix, tout compris',
    subtitle: 'Visa, vol intérieur, hébergement, repas et encadrement. À partir de 1 290 € par personne.',
    bgImage: '/og-bg/takedown-wrestling.png',
    accent: 'red',
  })
}
