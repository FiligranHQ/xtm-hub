import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { toGlobalId } from '@/utils/globalId';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { QueryMap, queryMap } from './query-map';
import { rendererMap } from './shareable-resources-renderer';

export interface SeoCustomDashboard {
  description: string;
  id: string;
  children_documents: {
    id: string;
  }[];
  created_at: string;
  updated_at: string;
  labels: {
    color: string;
    id: string;
    name: string;
  }[];
  name: string;
  slug: string;
  short_description: string;
  product_version: string;
  download_number: number;
  uploader: {
    first_name: string;
    last_name: string;
    picture: string;
  };
  active: boolean;
}

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
    { cache: 'force-cache' }
  );

  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;

  if (!serviceInstance) {
    notFound();
  }

  const config = queryMap[serviceInstance.slug as keyof QueryMap];

  const response = await serverFetchGraphQL(
    config.query,
    { serviceSlug: serviceInstance.slug },
    {
      cache: 'force-cache',
    }
  );

  const documents = config.cast(response.data);
  return { baseUrl, serviceInstance, documents };
});

/**
 * Generate the metadata for the page
 *
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const awaitedParams = await params;

  const { baseUrl, serviceInstance } = await getPageData(awaitedParams.slug);

  const metadata: Metadata = {
    title: `${serviceInstance.name} | XTM Hub by Filigran`,
    description:
      serviceInstance.description ||
      'Discover our cybersecurity solution for enhanced threat intelligence and protection.',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: serviceInstance.name,
      description: serviceInstance.description!,
      url: `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
      type: 'website',
      siteName: 'XTM Hub by Filigran',
    },
    twitter: {
      card: 'summary_large_image',
      title: serviceInstance.name,
      description: serviceInstance.description!,
    },
  };

  if (serviceInstance.illustration_document_id) {
    metadata.openGraph!.images = [
      {
        url: `${baseUrl}/document/images/${serviceInstance.id}/${toGlobalId('Document', serviceInstance.illustration_document_id)}`,
        alt: serviceInstance.name,
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ];
    metadata.twitter!.images = [
      `${baseUrl}/document/images/${serviceInstance.id}/${toGlobalId('Document', serviceInstance.illustration_document_id)}`,
    ];
  }

  return metadata;
}

/**
 * The page component
 */
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const awaitedParams = await params;

  try {
    const { baseUrl, serviceInstance, documents } = await getPageData(
      awaitedParams.slug
    );

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
          (dashboard) => dashboard.labels?.map((label) => label.name) || []
        )
        .join(', '),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
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
                name: `${document.uploader.first_name} ${document.uploader.last_name}`,
              }
            : undefined,
          about: {
            '@type': 'Thing',
            name: 'Cybersecurity',
          },
          keywords: document.labels?.map((label) => label.name).join(', '),
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
        `${baseUrl}/document/images/${serviceInstance.id}/${toGlobalId('Document', serviceInstance.illustration_document_id)}`,
      ];
    }
    const breadcrumbValue = [
      {
        label: 'MenuLinks.Home',
        href: '/cybersecurity-solutions',
      },
      {
        label: serviceInstance.name,
        original: true,
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

        {(documents.length === 0 && (
          <div className="my-4 text-center">No document found</div>
        )) || (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-l">
            {documents.map((document) => {
              const renderCard =
                rendererMap[serviceInstance.slug ?? ''] ?? rendererMap.default;

              return renderCard!({
                document: document,
                serviceInstance: serviceInstance as unknown as NonNullable<
                  serviceByIdQuery$data['serviceInstanceById']
                >,
                baseUrl,
              });
            })}
          </ul>
        )}
      </>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default Page;
