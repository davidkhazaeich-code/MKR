import type { MetadataRoute } from 'next'

const BLOG_SLUGS = [
  'pourquoi-le-dagestan-domine-le-mma',
  'preparer-son-premier-camp',
  'lutte-daghestanaise-guide-complet',
  'securite-dagestan-2026',
  'nutrition-athlete-combat',
  'khabib-methode-entrainement',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mkrcaucasiancamp.com'

  const blogEntries = BLOG_SLUGS.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: '2026-03-15',
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: base, lastModified: '2026-04-06', changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/le-camp`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/programme`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/mma`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/lutte`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/coachs`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sessions`, lastModified: '2026-04-06', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/destinations`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/destinations/dagestan`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/destinations/tchetchenie`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/comment-ca-marche`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/preparer-son-camp`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/logistique`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/temoignages`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/galerie`, lastModified: '2026-04-06', changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: '2026-03-15', changeFrequency: 'weekly', priority: 0.6 },
    ...blogEntries,
    { url: `${base}/inscription`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guide-dagestan`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/a-propos`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/contact`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/mentions-legales`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/cgv`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/politique-de-confidentialite`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.1 },
  ]
}
