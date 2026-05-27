import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Programme MMA à Grozny · Akhmat Fight Club'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'MMA · Tchétchénie · Akhmat',
    title: 'Akhmat Fight Club',
    subtitle: 'Sparring quotidien avec l\'écurie tchétchène. Niveau avancé minimum.',
    accent: 'orange',
  })
}
