import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mkrcaucasiancamp.com'
  const now = new Date().toISOString()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/le-camp`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/programme`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/mma`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/lutte`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/coachs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sessions`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/destinations`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/destinations/dagestan`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/destinations/tchetchenie`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/comment-ca-marche`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/preparer-son-camp`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/logistique`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/temoignages`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/galerie`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/guide-dagestan`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ]
}
