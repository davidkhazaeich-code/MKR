import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme MMA à Grozny, Tchétchénie'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Programme MMA · Tchétchénie',
    title: 'MMA à Grozny',
    subtitle: 'Akhmat Fight Club, sparring quotidien avec l\'élite tchétchène. Niveau avancé minimum.',
  })
}
