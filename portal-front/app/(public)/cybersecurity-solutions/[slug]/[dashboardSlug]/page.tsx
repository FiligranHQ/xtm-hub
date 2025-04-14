import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import DashboardDetails from '@/components/service/custom-dashboards/[details]/custom-dashboard-details';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { fromGlobalId } from '@/utils/globalId';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCustomDashboardBySlugQuery, {
  seoCustomDashboardBySlugQuery,
} from '@generated/seoCustomDashboardBySlugQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Button } from 'filigran-ui/servers';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkdownAsync } from 'react-markdown';
import { SeoCustomDashboard } from '../page';

/**
 * Fetch the data for the page with caching to avoid multiple requests
 */
const getPageData = async (serviceSlug: string, dashboardSlug: string) => {
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

  const customDashboardResponse =
    await serverFetchGraphQL<seoCustomDashboardBySlugQuery>(
      SeoCustomDashboardBySlugQuery,
      { slug: dashboardSlug },
      { cache: undefined, next: { revalidate: 3600 } }
    );

  const customDashboard = customDashboardResponse.data
    .seoCustomDashboardBySlug as unknown as SeoCustomDashboard;

  if (!customDashboard) {
    notFound();
  }

  return { baseUrl, serviceInstance, customDashboard };
};

/**
 * Generate the metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; dashboardSlug: string }>;
}): Promise<Metadata> {
  const awaitedParams = await params;

  const { baseUrl, serviceInstance, customDashboard } = await getPageData(
    awaitedParams.slug,
    awaitedParams.dashboardSlug
  );

  const metadata: Metadata = {
    title: `${customDashboard.name} | ${serviceInstance.name} | XTM Hub by Filigran`,
    description: customDashboard.short_description
      ? `${customDashboard.short_description}. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.`
      : customDashboard.description?.substring(0, 160) ||
        'Explore this cybersecurity dashboard for enhanced threat intelligence and monitoring.',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: customDashboard.name,
      description: customDashboard.short_description
        ? `${customDashboard.short_description}. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.`
        : customDashboard.description?.substring(0, 160),
      url: `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${customDashboard.slug}`,
      type: 'article',
      siteName: 'XTM Hub by Filigran',
      publishedTime: customDashboard.created_at,
      modifiedTime: customDashboard.updated_at,
      authors: customDashboard.uploader
        ? [
            `${customDashboard.uploader.first_name} ${customDashboard.uploader.last_name}`,
          ]
        : undefined,
      tags: customDashboard.labels?.map((label) => label.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: customDashboard.name,
      description: customDashboard.short_description
        ? `${customDashboard.short_description}. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.`
        : customDashboard.description?.substring(0, 160),
      creator: '@FiligranHQ',
    },
  };

  // Ajouter l'image principale si disponible
  if (customDashboard.children_documents.length > 0) {
    const imageUrl = `${baseUrl}/document/images/${serviceInstance.id}/${customDashboard.children_documents[0]!.id}`;
    metadata.openGraph!.images = [
      {
        url: imageUrl,
        alt: `${customDashboard.name} - Dashboard Preview`,
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
  params: Promise<{ slug: string; dashboardSlug: string }>;
}) => {
  const awaitedParams = await params;

  try {
    const { baseUrl, serviceInstance, customDashboard } = await getPageData(
      awaitedParams.slug,
      awaitedParams.dashboardSlug
    );

    const pageUrl = `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${customDashboard.slug}`;

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: customDashboard.name,
      description: `${customDashboard.short_description}. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.`,
      articleBody: customDashboard.description,
      author: customDashboard.uploader
        ? {
            '@type': 'Person',
            name: `${customDashboard.uploader.first_name} ${customDashboard.uploader.last_name}`,
            image: customDashboard.uploader.picture || undefined,
          }
        : undefined,
      datePublished: customDashboard.created_at,
      dateModified: customDashboard.updated_at,
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
        url: `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
      },
      keywords: customDashboard.labels?.map((label) => label.name).join(', '),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: {
          '@type': 'DownloadAction',
        },
        userInteractionCount: customDashboard.download_number,
      },
    };

    // Ajouter les images si disponibles
    if (customDashboard.children_documents.length > 0) {
      jsonLd.image = customDashboard.children_documents.map(
        (doc) => `${baseUrl}/document/images/${serviceInstance.id}/${doc.id}`
      );
    }
    const breadcrumbValue = [
      {
        label: 'MenuLinks.Home',
        href: '/cybersecurity-solutions',
      },
      {
        label: serviceInstance.name,
        href: `/cybersecurity-solutions/${serviceInstance.slug}`,
        original: true,
      },
      {
        label: `${customDashboard?.name}`,
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

        <div className="flex gap-s pb-l flex-col md:flex-row">
          <h1 className="whitespace-nowrap">{customDashboard?.name}</h1>

          <div className="flex gap-s overflow-hidden flex-1 items-center">
            <BadgeOverflowCounter
              badges={customDashboard?.labels as BadgeOverflow[]}
              className="z-[2]"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {
              <ShareLinkButton
                documentId={customDashboard.id}
                url={`${pageUrl}`}
              />
            }
            <Button
              asChild
              className="whitespace-nowrap">
              <Link
                href={`/redirect/custom_dashboards?service_instance_id=${fromGlobalId(serviceInstance.id).id}&custom_dashboard_id=${customDashboard.id}`}>
                Download
              </Link>
            </Button>
          </div>
        </div>
        {customDashboard.children_documents.length > 0 && (
          <DashboardCarousel
            serviceInstance={
              serviceInstance as unknown as NonNullable<
                serviceByIdQuery$data['serviceInstanceById']
              >
            }
            documentData={
              customDashboard as unknown as documentItem_fragment$data
            }
          />
        )}
        <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
          <div className="flex-[3_3_0%]">
            <h3 className="py-s txt-container-title truncate text-muted-foreground">
              Overview
            </h3>
            <section className="border rounded border-border-light bg-page-background">
              <h2 className="p-l">{customDashboard?.short_description}</h2>
              <div className="p-l !bg-page-background">
                <MarkdownAsync>
                  {customDashboard?.description ?? ''}
                </MarkdownAsync>
              </div>
            </section>
          </div>
          <div className="flex-1">
            <h3 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
              Basic Information
            </h3>
            <section className="border rounded border-border-light bg-page-background flex space-y-xl p-l">
              {customDashboard && (
                <DashboardDetails
                  documentData={
                    customDashboard as unknown as documentItem_fragment$data
                  }
                />
              )}
            </section>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default Page;
