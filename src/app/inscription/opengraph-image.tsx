import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Inscription MKR Caucasian Camp'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Inscription · Gratuite · 5 min',
    title: 'Postule au camp',
    subtitle: '4 tunnels : session, sur mesure, famille, club. Ruslan recontacte en 48h.',
  })
}
