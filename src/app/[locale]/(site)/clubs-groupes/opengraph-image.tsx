import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Clubs et Groupes MKR · 5 à 20 personnes'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Club · Groupe · 5 à 20',
    title: 'Ton club au Caucase',
    subtitle: '5 à 20 personnes. Hébergement bloc, programme adapté, devis personnalisé.',
    bgImage: '/og-bg/sparring-mma-wall.png',
  })
}
