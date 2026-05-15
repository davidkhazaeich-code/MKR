import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Contact MKR Caucasian Camp'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Contact',
    title: 'On répond en moins de 48h',
    subtitle: 'WhatsApp, email, Instagram. Ruslan recontacte personnellement chaque candidature.',
  })
}
