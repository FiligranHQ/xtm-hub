import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import {
  buildFiligranOrganizationJsonLd,
  buildSeoPageMetadata,
  getBaseUrl,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import { PublicEpicListPageLoader } from './public-epic-list-page-loader';

const getPageData = cache(async () => {
  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug: 'xtm-platform-roadmap' },
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;
  const baseUrl = await getBaseUrl();
  return { baseUrl, serviceInstance };
});

/**
 * Generate the metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { baseUrl, serviceInstance } = await getPageData();
  const pathname = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`;
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname,
    title: `${serviceInstance.name} | XTM Hub`,
    description:
      serviceInstance.description || tMeta('ServiceFallbackDescription'),
    imageAlt: serviceInstance.name,
    imageUrl: serviceInstance.illustration_document_id
      ? `${baseUrl}/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`
      : undefined,
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const { baseUrl, serviceInstance } = await getPageData();

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${serviceInstance.name} | XTM Hub`,
    description: serviceInstance.description,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      bestRating: '5',
      worstRating: '2',
    },
    provider: buildFiligranOrganizationJsonLd(baseUrl),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    },
    image: `${baseUrl}/seo_default.png`,
  };

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'Epic.XTMRoadmap',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <PublicEpicListPageLoader serviceInstance={serviceInstance} />
      </RelayProvider>
    </>
  );
};

export default Page;
