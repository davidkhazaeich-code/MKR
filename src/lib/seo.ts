import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/data/site'

const DEFAULT_OG_IMAGE = `${SITE_URL}/images/social/og-image.webp`
const DEFAULT_OG_IMAGE_WIDTH = 1376
const DEFAULT_OG_IMAGE_HEIGHT = 768

export interface PageMetaInput {
  /** Title balisé `<title>` + og:title + twitter:title (< 60 chars recommandé) */
  title: string
  /** Meta description + og:description + twitter:description (< 160 chars recommandé) */
  description: string
  /** Chemin absolu depuis la racine, ex: '/le-camp' (la fonction concatène SITE_URL) */
  path: string
  /** Override de l'image OG (chemin absolu depuis SITE_URL, ex: '/images/blog/xxx.webp'). Default: og-image.webp partagée */
  image?: string
  /** Alt texte de l'image OG. Default: title */
  imageAlt?: string
  /** Largeur de l'image OG override. Default: 1376 */
  imageWidth?: number
  /** Hauteur de l'image OG override. Default: 768 */
  imageHeight?: number
  /** Bloquer indexation (utile pour /merci, pages perso). Default: false */
  noindex?: boolean
  /** Override OG type (article pour blog post, default 'website') */
  ogType?: 'website' | 'article'
  /** Pour les articles : date de publication ISO */
  publishedTime?: string
  /** Pour les articles : date de mise à jour ISO */
  modifiedTime?: string
  /** Pour les articles : auteur(s) */
  authors?: string[]
}

/**
 * Construit un objet Metadata Next.js complet avec title, description, canonical,
 * Open Graph et Twitter Card cohérents. À utiliser sur toutes les pages publiques
 * pour garantir un preview social correct sur LinkedIn, Twitter/X, WhatsApp, iMessage, Discord, etc.
 */
export function buildMetadata(input: PageMetaInput): Metadata {
  const {
    title,
    description,
    path,
    image,
    imageAlt,
    imageWidth = DEFAULT_OG_IMAGE_WIDTH,
    imageHeight = DEFAULT_OG_IMAGE_HEIGHT,
    noindex = false,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    authors,
  } = input

  const url = `${SITE_URL}${path}`
  const ogImage = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_OG_IMAGE
  const ogAlt = imageAlt || title

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      locale: 'fr_CH',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: imageWidth, height: imageHeight, alt: ogAlt }],
      ...(ogType === 'article' && publishedTime ? { publishedTime } : {}),
      ...(ogType === 'article' && modifiedTime ? { modifiedTime } : {}),
      ...(ogType === 'article' && authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }

  if (noindex) {
    metadata.robots = { index: false, follow: false, googleBot: { index: false, follow: false } }
  }

  return metadata
}
