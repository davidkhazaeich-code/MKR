import type { MetadataRoute } from 'next'

// Blog masqué pour l'instant : pages en noindex,nofollow et retirées du sitemap.
// Pour réactiver, retirer le bloc `robots` sur /blog et /blog/[slug] et
// remettre BLOG_SLUGS + blogEntries dans le sitemap ci-dessous.

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mkrcamp.com'

  return [
    { url: base, lastModified: '2026-04-06', changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/le-camp`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/programme`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/mma`, lastModified: '2026-04-30', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/lutte`, lastModified: '2026-04-30', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/programme/lutte-enfants`, lastModified: '2026-04-30', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/familles`, lastModified: '2026-04-30', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/mkr-camp-2026`, lastModified: '2026-05-01', changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/sur-mesure`, lastModified: '2026-05-01', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/clubs-groupes`, lastModified: '2026-05-01', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/sessions`, lastModified: '2026-05-12', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/destinations`, lastModified: '2026-05-12', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/destinations/dagestan`, lastModified: '2026-05-12', changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/destinations/tchetchenie`, lastModified: '2026-05-12', changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/comment-ca-marche`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/preparer-son-camp`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/logistique`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/temoignages`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/galerie`, lastModified: '2026-04-06', changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/inscription`, lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guide-dagestan`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/a-propos`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/contact`, lastModified: '2026-03-01', changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/mentions-legales`, lastModified: '2026-05-14', changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/cgv`, lastModified: '2026-05-14', changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/politique-de-confidentialite`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.1 },
  ]
}
