import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { RelayProvider } from '@/relay/relay-provider';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { PublicEpicListPageLoader } from './public-epic-list-page-loader';

const Page = async () => {
  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug: 'xtm-platform-roadmap' },
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const serviceInstance = serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );

  const baseUrl = settingsResponse.data.settings.base_url_front;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: serviceInstance.name,
    description: serviceInstance.description,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      bestRating: '5',
      worstRating: '2',
    },
    provider: {
      '@type': 'Organization',
      name: 'Filigran',
      url: 'https://filigran.io',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    },
  };

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'XTM Platform Roadmap',
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
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <PublicEpicListPageLoader serviceInstance={serviceInstance} />
      </RelayProvider>
    </>
  );
};

export default Page;
