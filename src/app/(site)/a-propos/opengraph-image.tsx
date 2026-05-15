import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'À propos MKR · Notre histoire'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'À propos',
    title: 'Notre histoire',
    subtitle: 'Ruslan Mukhtarov, ancien équipe de France de lutte. MKR depuis 2018.',
  })
}
