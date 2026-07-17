import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/instructor/', '/dashboard/admin/', '/api/'],
    },
    sitemap: 'https://arkan.edu/sitemap.xml',
  };
}
