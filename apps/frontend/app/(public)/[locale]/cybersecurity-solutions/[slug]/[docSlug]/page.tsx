import ShareableResourceConnectorSlugPublic from '@/components/service/document/connector/ShareableResourceConnectorSlugPublic';
import ShareableResourceDetails from '@/components/service/document/ShareableResouceDetails';
import ShareableResourceCarousel from '@/components/service/document/ui/ShareableResourceCarouselView';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { ShareLinkButton } from '@/components/ui/share-link/ShareLinkButton';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { filterDocumentImages, findDocumentLogo } from '@/utils/documents';
import { formatPersonNames } from '@/utils/format/name';
import {
  buildAlternates,
  getAlternateLocaleTags,
  getLocaleTag,
} from '@/utils/generate-metadata';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { localeMap } from '@/utils/shareable-resources/shareable-resources.consts';
import {
  isConnectorResource,
  ServiceSlug,
} from '@/utils/shareable-resources/shareable-resources.types';
import {
  getServiceInfo,
  isResourceDownloadable,
} from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { fetchSingleDocument } from '@/utils/shareable-resources/utils/shareable-resources.server.utils';
import { LogoFiligranIcon } from '@filigran/icon';
import { MarkdownRenderer } from '@filigran/ui/clients';
import { Button } from '@filigran/ui/servers';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
const FALLBACK_DESCRIPTION_KEYS: Record<ServiceSlug, string> = {
  [ServiceSlug.OPEN_CTI_INTEGRATIONS]:
    'Metadata.DocumentFallbackDescriptionIntegration',
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
    'Metadata.DocumentFallbackDescriptionDashboard',
  [ServiceSlug.OPEN_CTI_CUSTOM_VIEWS]:
    'Metadata.DocumentFallbackDescriptionGeneric',
  [ServiceSlug.OPEN_AEV_SCENARIOS]:
    'Metadata.DocumentFallbackDescriptionScenario',
  [ServiceSlug.OPEN_CTI_PLAYBOOKS]:
    'Metadata.DocumentFallbackDescriptionGeneric',
};

/**
 * Fetch the data for the page with caching to avoid multiple requests
 */

const getPageData = async (serviceSlug: string, docSlug: string) => {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const baseUrl = settingsResponse.data.settings.base_url_front;

  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug: serviceSlug },
    { cache: undefined, next: { revalidate: 3600 } }
  );

  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;

  if (!serviceInstance) {
    notFound();
  }

  const document = await fetchSingleDocument(serviceInstance.id, docSlug);
  if (!document) {
    notFound();
  }

  return { baseUrl, serviceInstance, document };
};

/**
 * Generate the metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; docSlug: string; locale: PublicLocale }>;
}): Promise<Metadata> {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const { baseUrl, serviceInstance, document } = await getPageData(
    awaitedParams.slug,
    awaitedParams.docSlug
  );
  const t = await getTranslations({ locale });
  const serviceInformation = getServiceInfo(
    {
      id: serviceInstance.id,
      slug: serviceInstance.slug as ServiceSlug,
    },
    document.id
  );

  const pathname = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`;

  const fallbackDescription = t(
    FALLBACK_DESCRIPTION_KEYS[serviceInstance.slug as ServiceSlug] ??
      'Metadata.DocumentFallbackDescriptionGeneric'
  );

  const metadata: Metadata = {
    title: `${document.name} | ${serviceInstance.name} | XTM Hub by Filigran`,
    description: document.short_description
      ? `${document.short_description}${serviceInformation?.description}`
      : document.description?.substring(0, 160) || fallbackDescription,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: document!.name!,
      description: document.short_description
        ? `${document.short_description}${serviceInformation?.description}`
        : document.description?.substring(0, 160),
      url: `${baseUrl}/${locale}${pathname}`,
      type: 'article',
      siteName: 'XTM Hub by Filigran',
      publishedTime: document.created_at,
      modifiedTime: document.updated_at,
      authors: document.uploader
        ? [formatPersonNames(document.uploader)]
        : undefined,
      tags: document.use_cases?.map((useCase) => useCase.name),
      locale: getLocaleTag(locale),
      alternateLocale: getAlternateLocaleTags(locale),
    },
    alternates: buildAlternates(pathname, locale),
    twitter: {
      card: 'summary_large_image',
      title: document!.name!,
      description: document.short_description
        ? `${document.short_description}${serviceInformation?.description}`
        : document.description?.substring(0, 160),
      creator: '@FiligranHQ',
    },
  };

  // Ajouter l'image principale si disponible
  if (document.children_documents!.length > 0) {
    const imageUrl = `${baseUrl}/document/images/${serviceInstance.id}/${document.children_documents![0]!.id}`;
    metadata.openGraph!.images = [
      {
        url: imageUrl,
        alt: t('Metadata.ResourcePreviewAlt', { name: document.name ?? '' }),
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ];
    metadata.twitter!.images = [imageUrl];
  }

  return metadata;
}

/**
 * The page component
 */
const Page = async ({
  params,
}: {
  params: Promise<{ slug: string; docSlug: string; locale: PublicLocale }>;
}) => {
  const awaitedParams = await params;
  const { locale } = awaitedParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let pageData: Awaited<ReturnType<typeof getPageData>> | undefined;
  try {
    pageData = await getPageData(awaitedParams.slug, awaitedParams.docSlug);
  } catch (_error) {
    notFound();
  }

  if (!pageData) {
    notFound();
  }

  const { baseUrl, serviceInstance, document } = pageData;

  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  if (
    serviceInstance.slug === ServiceSlug.OPEN_CTI_CUSTOM_VIEWS &&
    !(await isFeatureEnabled(FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS))
  ) {
    notFound();
  }

  const serviceInformation = getServiceInfo(
    {
      id: serviceInstance.id,
      slug: serviceInstance.slug as ServiceSlug,
    },
    document.id
  );

  const servicePath = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`;
  const localizedServicePath = `/${locale}${servicePath}`;
  const pageUrl = `${baseUrl}${servicePath}/${document.slug}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: document.name,
    description: `${document.short_description}${serviceInformation?.description}`,
    articleBody: document.description,
    author: document.uploader
      ? {
          '@type': 'Person',
          name: formatPersonNames(document.uploader),
          image: document.uploader.picture || undefined,
        }
      : undefined,
    datePublished: document.created_at,
    dateModified: document.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'Filigran',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/filigran-logo.png`,
      },
    },
    isPartOf: {
      '@type': 'SoftwareApplication',
      name: serviceInstance.name,
      applicationCategory: 'SecurityApplication',
      url: `${baseUrl}${servicePath}`,
    },
    keywords: document.use_cases?.map((useCase) => useCase.name).join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: {
        '@type': 'DownloadAction',
      },
      userInteractionCount: document.download_number,
    },
  };
  const mainChild = document.children_documents?.[0];
  const logo = findDocumentLogo(document);
  if (document.children_documents!.length > 0) {
    jsonLd.image = document.children_documents!.map(
      (doc) => `${baseUrl}/document/images/${serviceInstance.id}/${doc.id}`
    );
  }
  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${locale}`,
    },
    {
      label: `Service.Cards.${serviceInstance.slug}.Name`,
      href: localizedServicePath,
      fallback: serviceInstance.name,
    },
    {
      label: `Service.Documents.${document.slug}.Name`,
      fallback: `${document?.name}`,
    },
  ];

  if (isConnectorResource(document)) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <BreadcrumbNav value={breadcrumbValue} />
        <ShareableResourceConnectorSlugPublic
          documentData={document}
          pageUrl={pageUrl}
          serviceInstance={serviceInstance}
        />
      </>
    );
  }

  const carouselImages = filterDocumentImages(document);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s pb-l flex-col md:flex-row">
        {logo ? (
          <div className="w-24 shrink-0 rounded overflow-hidden">
            <Image
              src={`/document/images/${serviceInstance.id}/${logo.id}`}
              alt={`${document.name} logo`}
              width={96}
              height={96}
              loading="lazy"
              className="w-full h-full object-contain rounded"
            />
          </div>
        ) : (
          <div className="w-24 p-m border border-light shrink-0">
            <LogoFiligranIcon className="size-18" />
          </div>
        )}
        <div className="flex flex-col w-full justify-center">
          <div className="flex items-start">
            <h1 className="whitespace-nowrap mb-s">{document.name}</h1>
            <div className="flex items-center gap-s ml-auto">
              {
                <RelayProvider>
                  <ShareLinkButton
                    documentId={document.id}
                    url={`${pageUrl}`}
                    tooltipText={`Service.${localeMap[serviceInstance.slug as ServiceSlug]}.Actions.Share`}
                  />
                </RelayProvider>
              }
              {isResourceDownloadable(document) && (
                <Button
                  asChild
                  className="whitespace-nowrap">
                  <Link href={serviceInformation?.link ?? ''}>
                    {t('PublicResourcePage.Download')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div>
            <BadgeOverflowCounter
              badges={document?.use_cases as BadgeOverflow[]}
              className="z-[2]"
            />
          </div>
        </div>
      </div>
      {mainChild && (
        <ShareableResourceCarousel
          serviceInstance={serviceInstance}
          images={carouselImages}
        />
      )}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <div className="flex-[3_3_0%]">
          <h3 className="py-s txt-container-title truncate text-muted-foreground">
            {t('PublicResourcePage.Overview')}
          </h3>
          <section className="border rounded border-border-light bg-page-background">
            <h2 className="p-l">{document?.short_description}</h2>
            <MarkdownRenderer
              source={document?.description ?? ''}
              colorMode="dark"
              className="p-l !bg-page-background markdown-content"
            />
          </section>
        </div>
        {document && (
          <ShareableResourceDetails
            documentData={document}
            downloadNumber={document.download_number}
          />
        )}
      </div>
    </>
  );
};

export default Page;
