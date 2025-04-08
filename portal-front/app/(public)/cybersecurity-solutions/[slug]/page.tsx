import CustomDashboardCard from '@/components/service/custom-dashboards/custom-dashboard-card';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { toGlobalId } from '@/utils/globalId';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

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
  const settingsResponse =
    await serverFetchGraphQL<settingsQuery>(SettingsQuery);
  const baseUrl = settingsResponse.data.settings.base_url_front;

  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug }
  );

  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;

  if (!serviceInstance) {
    notFound();
  }

  const customDashboardsResponse =
    await serverFetchGraphQL<seoCustomDashboardsByServiceSlugQuery>(
      SeoCustomDashboardsByServiceSlugQuery,
      { serviceSlug: slug }
    );

  const customDashboards = customDashboardsResponse.data
    .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[];

  return { baseUrl, serviceInstance, customDashboards };
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
      url: `${baseUrl}/cybersecurity-solutions/${serviceInstance.slug}`,
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
    const { baseUrl, serviceInstance, customDashboards } = await getPageData(
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
        ratingCount: customDashboards.length * 10,
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
      keywords: customDashboards
        .flatMap(
          (dashboard) => dashboard.labels?.map((label) => label.name) || []
        )
        .join(', '),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/cybersecurity-solutions/${serviceInstance.slug}`,
      },
      hasPart: customDashboards.map((dashboard) => {
        const dashboardJsonLd: Record<string, unknown> = {
          '@type': 'TechArticle',
          headline: dashboard.name,
          description: dashboard.short_description,
          datePublished: dashboard.created_at,
          dateModified: dashboard.updated_at,
          author: dashboard.uploader
            ? {
                '@type': 'Person',
                name: `${dashboard.uploader.first_name} ${dashboard.uploader.last_name}`,
              }
            : undefined,
          about: {
            '@type': 'Thing',
            name: 'Cybersecurity',
          },
          keywords: dashboard.labels?.map((label) => label.name).join(', '),
        };
        if (dashboard.children_documents.length > 0) {
          dashboardJsonLd.image = dashboard.children_documents.map(
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

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
          {serviceInstance.name}
        </h1>
        {(customDashboards.length === 0 && (
          <div className="my-4 text-center">No custom dashboards found</div>
        )) || (
          <ul
            className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-l'}>
            {customDashboards.map((customDashboard) => (
              <CustomDashboardCard
                serviceInstance={
                  serviceInstance as unknown as NonNullable<
                    serviceByIdQuery$data['serviceInstanceById']
                  >
                }
                key={customDashboard.id}
                customDashboard={
                  customDashboard as unknown as documentItem_fragment$data
                }
                detailUrl={`/cybersecurity-solutions/${serviceInstance.slug}/${customDashboard.slug}`}
                shareLinkUrl={`${baseUrl}/cybersecurity-solutions/${serviceInstance.slug}/${customDashboard.slug}`}
              />
            ))}
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
