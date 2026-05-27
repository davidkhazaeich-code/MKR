import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Préparer son camp MKR · Programme 6 semaines'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Prépa · 6 semaines · Programme',
    title: '6 semaines pour être prêt',
    subtitle: 'Cardio, force, mobilité, équipement, préparation mentale.',
    bgImage: '/og-bg/sparring-mma-wall.png',
  })
}
