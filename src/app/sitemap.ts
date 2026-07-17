import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://arkan.edu';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/games`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  try {
    const [courses, books] = await Promise.all([
      db.course.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      db.book.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    ]);

    const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    const bookPages: MetadataRoute.Sitemap = books.map((b) => ({
      url: `${baseUrl}/library/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticPages, ...coursePages, ...bookPages];
  } catch {
    return staticPages;
  }
}
