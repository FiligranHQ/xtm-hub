import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  SeoCsvFeed,
  SeoCustomDashboard,
} from '@/utils/shareable-resources/shareable-resources.utils';
import SeoCsvFeedsByServiceSlugQuery, {
  seoCsvFeedsByServiceSlugQuery,
} from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import type { MetadataRoute } from 'next';

const CUSTOM_DASHBOARD_SERVICE_SLUG = 'custom-open-cti-dashboards';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResponse =
    await serverFetchGraphQL<settingsQuery>(SettingsQuery);
  const baseURI = settingsResponse.data.settings.base_url_front;

  const seoServiceInstancesResponse =
    await serverFetchGraphQL<seoServiceInstancesQuery>(
      SeoServiceInstancesQuery
    );

  const seoServiceInstancesData = seoServiceInstancesResponse.data
    .seoServiceInstances as unknown as serviceList_fragment$data[];
  const routableSeoServiceInstances = seoServiceInstancesData.filter(
    (service) => service.slug !== null
  );

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  for (const service of routableSeoServiceInstances) {
    sitemap.push({
      url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    });

    const resources: (SeoCustomDashboard | SeoCsvFeed)[] = [];
    switch (service.service_definition!.identifier) {
      case 'custom_dashboards':
        const customDashboardsResponse =
          await serverFetchGraphQL<seoCustomDashboardsByServiceSlugQuery>(
            SeoCustomDashboardsByServiceSlugQuery,
            { serviceSlug: service.slug! }
          );
        const customDashboards = customDashboardsResponse.data
          .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[];
        resources.push(...customDashboards);
        break;
      case 'csv_feeds':
        const csvFeedsResponse =
          await serverFetchGraphQL<seoCsvFeedsByServiceSlugQuery>(
            SeoCsvFeedsByServiceSlugQuery,
            { serviceSlug: service.slug! }
          );
        const csvFeeds = csvFeedsResponse.data
          .seoCsvFeedsByServiceSlug as unknown as SeoCsvFeed[];
        resources.push(...csvFeeds);
        break;
    }

    for (const resource of resources) {
      sitemap.push({
        url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${service.slug}/${resource.slug}`,
        lastModified: resource.updated_at ?? resource.created_at,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return sitemap;
}
