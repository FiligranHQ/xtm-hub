import DashboardDetails from '@/components/service/document/shareable-resouce-details';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  fetchSingleDocument,
  getServiceInfo,
} from '@/utils/shareable-resources/shareable-resources.utils';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Button } from 'filigran-ui/servers';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkdownAsync } from 'react-markdown';
import SlugDocument from './slug-document';

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

  const document = await fetchSingleDocument(
    serviceInstance.slug ?? 'custom_open_cti_dashboards',
    docSlug
  );

  return { baseUrl, serviceInstance, document };
};

/**
 * Generate the metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; docSlug: string }>;
}): Promise<Metadata> {
  const awaitedParams = await params;

  const { baseUrl, serviceInstance, document } = await getPageData(
    awaitedParams.slug,
    awaitedParams.docSlug
  );
  const serviceInformation = getServiceInfo(
    {
      id: serviceInstance.id,
      slug: serviceInstance.slug ?? 'custom_open_cti_dashboards',
    },
    document.id
  );

  const metadata: Metadata = {
    title: `${document.name} | ${serviceInstance.name} | XTM Hub by Filigran`,
    description: document.short_description
      ? `${document.short_description}${serviceInformation?.description}`
      : document.description?.substring(0, 160) ||
        `Explore this cybersecurity ${serviceInstance.slug === 'custom_open_cti_dashboards' ? 'dashboard' : 'CSV Feed'} for enhanced threat intelligence and monitoring.`,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: document!.name!,
      description: document.short_description
        ? `${document.short_description}${serviceInformation?.description}`
        : document.description?.substring(0, 160),
      url: `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`,
      type: 'article',
      siteName: 'XTM Hub by Filigran',
      publishedTime: document.created_at,
      modifiedTime: document.updated_at,
      authors: document.uploader
        ? [`${document.uploader.first_name} ${document.uploader.last_name}`]
        : undefined,
      tags: document.labels?.map((label) => label.name),
    },
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
        alt: `${document.name} - Resource Preview`,
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
    const { baseUrl, serviceInstance, document } = await getPageData(
      awaitedParams.slug,
      awaitedParams.dashboardSlug
    );
    const serviceInformation = getServiceInfo(
      {
        id: serviceInstance.id,
        slug: serviceInstance.slug ?? 'custom_open_cti_dashboards',
      },
      document.id
    );

    const pageUrl = `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`;

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: document.name,
      description: `${document.short_description}${serviceInformation?.description}`,
      articleBody: document.description,
      author: document.uploader
        ? {
            '@type': 'Person',
            name: `${document.uploader.first_name} ${document.uploader.last_name}`,
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
        url: `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
      },
      keywords: document.labels?.map((label) => label.name).join(', '),
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

    if (document.children_documents!.length > 0) {
      jsonLd.image = document.children_documents!.map(
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
        label: `${document?.name}`,
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
          <h1 className="whitespace-nowrap">{document?.name}</h1>

          <div className="flex gap-s overflow-hidden flex-1 items-center">
            <BadgeOverflowCounter
              badges={document?.labels as BadgeOverflow[]}
              className="z-[2]"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {
              <ShareLinkButton
                documentId={document.id}
                url={`${pageUrl}`}
              />
            }
            <Button
              asChild
              className="whitespace-nowrap">
              <Link href={serviceInformation?.link ?? ''}>Download</Link>
            </Button>
          </div>
        </div>
        <SlugDocument
          serviceInstance={serviceInstance}
          document={document}
        />
        <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
          <div className="flex-[3_3_0%]">
            <h3 className="py-s txt-container-title truncate text-muted-foreground">
              Overview
            </h3>
            <section className="border rounded border-border-light bg-page-background">
              <h2 className="p-l">{document?.short_description}</h2>
              <div className="p-l !bg-page-background">
                <MarkdownAsync>{document?.description ?? ''}</MarkdownAsync>
              </div>
            </section>
          </div>
          <div className="flex-1">
            <h3 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
              Basic Information
            </h3>
            <section className="border rounded border-border-light bg-page-background flex space-y-xl p-l">
              {document && <DashboardDetails documentData={document} />}
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
