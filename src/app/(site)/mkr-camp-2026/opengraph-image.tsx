import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'MKR Camp 2026 · Session officielle 17 août'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Été 2026 · Caucase · Officiel',
    title: '17 août · 5 septembre',
    subtitle: 'Session officielle MKR 2026 au Caucase. Adultes, 15 places par camp.',
  })
}
