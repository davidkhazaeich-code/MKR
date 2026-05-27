import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Tchétchénie · Grozny · Akhmat Fight Club'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Tchétchénie · Grozny · MMA',
    title: 'L\'épicentre du MMA',
    subtitle: 'Akhmat Fight Club. Héritage Khamzat Chimaev. Ecuries d\'État.',
    accent: 'orange',
  })
}
