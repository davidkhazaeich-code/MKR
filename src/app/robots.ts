import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en/'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://mkrcamp.com/sitemap.xml',
  };
}
