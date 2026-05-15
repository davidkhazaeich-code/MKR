import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Camp Clubs et Groupes MKR au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Clubs et Groupes',
    title: 'Camp pour ton club au Caucase',
    subtitle: '5 à 20 personnes. Hébergement bloc, programme adapté, devis personnalisé.',
  })
}
