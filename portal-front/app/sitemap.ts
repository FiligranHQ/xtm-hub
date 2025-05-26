import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { SeoCustomDashboard } from '@/utils/shareable-resources/shareable-resources.utils';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import type { MetadataRoute } from 'next';

const CUSTOM_DASHBOARD_SERVICE_SLUG = 'custom-open-cti-dashboards';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResponse =
    await serverFetchGraphQL<settingsQuery>(SettingsQuery);
  const baseURI = settingsResponse.data.settings.base_url_front;

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${CUSTOM_DASHBOARD_SERVICE_SLUG}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const customDashboardsResponse =
    await serverFetchGraphQL<seoCustomDashboardsByServiceSlugQuery>(
      SeoCustomDashboardsByServiceSlugQuery,
      { serviceSlug: CUSTOM_DASHBOARD_SERVICE_SLUG }
    );

  const customDashboards = customDashboardsResponse.data
    .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[];

  for (const customDashboard of customDashboards) {
    sitemap.push({
      url: `${baseURI}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${CUSTOM_DASHBOARD_SERVICE_SLUG}/${customDashboard.slug}`,
      lastModified: customDashboard.updated_at ?? customDashboard.created_at,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return sitemap;
}
