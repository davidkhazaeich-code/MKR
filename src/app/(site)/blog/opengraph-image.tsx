import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Blog MKR · Récits et méthodes du Caucase'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    keywords: 'Blog · Méthodes · Récits',
    title: 'Au cœur du Caucase',
    subtitle: 'Pourquoi le Daghestan, méthode Khabib, sécurité, nutrition, préparation.',
  })
}
