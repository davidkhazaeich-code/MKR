import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'À propos MKR · Notre fondateur Ruslan Mukhtarov'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Fondateur · Ruslan · INSEP',
    title: 'Ruslan Mukhtarov',
    subtitle: 'Ancien équipe de France de lutte, INSEP. MKR depuis 2018.',
  })
}
