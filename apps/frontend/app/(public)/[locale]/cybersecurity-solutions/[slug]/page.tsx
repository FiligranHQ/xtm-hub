import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { formatPersonNames } from '@/utils/format/name';
import {
  buildAlternates,
  getAlternateLocaleTags,
  getLocaleTag,
} from '@/utils/generate-metadata';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { fetchAllDocuments } from '@/utils/shareable-resources/utils/shareable-resources.server.utils';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { PublicDocumentListPageLoader } from './public-document-list-page-loader';

/**
 * Fetch the data for the page with caching to avoid multiple requests
 */
const getPageData = cache(async (slug: string) => {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );
  const baseUrl = settingsResponse.data.settings.base_url_front;

  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug },
    { cache: undefined, next: { revalidate: 3600 } }
  );

  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;

  if (!serviceInstance) {
    notFound();
  }

  const documents = await fetchAllDocuments(
    serviceInstance.slug as ServiceSlug
  );
  return { baseUrl, serviceInstance, documents };
});

/**
 * Generate the metadata for the page
 *
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: PublicLocale }>;
}): Promise<Metadata> {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const { baseUrl, serviceInstance } = await getPageData(awaitedParams.slug);
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });

  const pathname = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`;

  const metadata: Metadata = {
    title: `${serviceInstance.name} | XTM Hub by Filigran`,
    description:
      serviceInstance.description || tMeta('ServiceFallbackDescription'),
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: serviceInstance.name,
      description: serviceInstance.description!,
      url: `${baseUrl}/${locale}${pathname}`,
      type: 'website',
      siteName: 'XTM Hub by Filigran',
      locale: getLocaleTag(locale),
      alternateLocale: getAlternateLocaleTags(locale),
    },
    alternates: buildAlternates(pathname, locale),
    twitter: {
      card: 'summary_large_image',
      title: serviceInstance.name,
      description: serviceInstance.description!,
    },
  };

  if (serviceInstance.illustration_document_id) {
    metadata.openGraph!.images = [
      {
        url: `${baseUrl}/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`,
        alt: serviceInstance.name,
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ];
    metadata.twitter!.images = [
      `${baseUrl}/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`,
    ];
  }

  return metadata;
}

/**
 * The page component
 */
const Page = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: PublicLocale }>;
}) => {
  const awaitedParams = await params;
  const { locale } = awaitedParams;
  setRequestLocale(locale);

  const { baseUrl, serviceInstance, documents } = await getPageData(
    awaitedParams.slug
  );

  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  if (
    serviceInstance.slug === ServiceSlug.OPEN_CTI_CUSTOM_VIEWS &&
    !(await isFeatureEnabled(FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS))
  ) {
    notFound();
  }

  const localizedServiceUrl = `${baseUrl}/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: serviceInstance.name,
    description: serviceInstance.description,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: documents.length * 10,
      bestRating: '5',
      worstRating: '2',
    },
    // datePublished: serviceInstance.created_at,
    // dateModified: serviceInstance.updated_at,
    provider: {
      '@type': 'Organization',
      name: 'Filigran',
      url: 'https://filigran.io',
    },
    keywords: documents
      .flatMap(
        (document) => document.use_cases?.map((useCase) => useCase.name) || []
      )
      .join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': localizedServiceUrl,
    },
    hasPart: documents.map((document) => {
      const dashboardJsonLd: Record<string, unknown> = {
        '@type': 'TechArticle',
        headline: document.name,
        description: document.short_description,
        datePublished: document.created_at,
        dateModified: document.updated_at,
        author: document.uploader
          ? {
              '@type': 'Person',
              name: formatPersonNames(document.uploader),
            }
          : undefined,
        about: {
          '@type': 'Thing',
          name: 'Cybersecurity',
        },
        keywords: document.use_cases?.map((useCase) => useCase.name).join(', '),
      };
      if (document.children_documents!.length > 0) {
        dashboardJsonLd.image = document.children_documents!.map(
          (image) =>
            `${baseUrl}/document/images/${serviceInstance.id}/${image.id}`
        );
      }
      return dashboardJsonLd;
    }),
  };

  if (serviceInstance.illustration_document_id) {
    jsonLd.image = [
      `${baseUrl}/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`,
    ];
  }

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${locale}`,
    },
    {
      label: `Service.Cards.${serviceInstance.slug}.Name`,
      fallback: serviceInstance.name,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <BreadcrumbNav value={breadcrumbValue} />

      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {serviceInstance.name}
      </h1>

      <RelayProvider>
        <PublicDocumentListPageLoader
          baseUrl={baseUrl}
          serviceInstance={serviceInstance}
        />
      </RelayProvider>
    </>
  );
};

export default Page;
