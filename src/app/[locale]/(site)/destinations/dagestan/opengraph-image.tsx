import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Daghestan · La terre des champions'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Daghestan · Makhachkala · Lutte',
    title: 'La terre de Khabib',
    subtitle: '30+ champions olympiques. 3 champions UFC. Berceau du MMA mondial.',
    bgImage: '/og-bg/dagestan-panorama.png',
    accent: 'green',
  })
}
