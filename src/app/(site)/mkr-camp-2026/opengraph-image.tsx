import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'MKR Camp 2026 · Session officielle 17 août au Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'MKR Camp 2026',
    title: '17 août - 5 septembre 2026',
    subtitle: 'Session officielle au Caucase. 1, 2 ou 3 semaines. Adultes, 15 places max.',
  })
}
