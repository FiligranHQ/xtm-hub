import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const domain = headersList.get('host') || '';

  // Check if production domain
  const isProductionDomain =
    domain === 'hub.filigran.io' || domain === 'www.hub.filigran.io';

  if (isProductionDomain) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
          allow: [
            '/$',
            '/sitemap.xml$',
            '/login$',
            '/cybersecurity-solutions',
            '/cybersecurity-solutions/',
            '/cybersecurity-solutions/*',
            '/document/images/*',
            '/favicon.ico',
            '/apple-icon.png',
            '/favicon-*.png',
          ],
        },
      ],
      sitemap: 'https://hub.filigran.io/sitemap.xml',
    };
  }

  // Development & Prerelease - Block everything
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
