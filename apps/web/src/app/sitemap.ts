import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fiscal-insights.ca';
  const routes = [
    '',
    '/calculator/ontario',
    '/salary/80000/ontario',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of ['en', 'fr']) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date('2026-10-15'),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  return sitemapEntries;
}
