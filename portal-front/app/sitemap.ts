import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import type { MetadataRoute } from 'next';
import { SeoCustomDashboard } from './(public)/cybersecurity-solutions/[slug]/page';

const CUSTOM_DASHBOARD_SERVICE_SLUG = 'custom-open-cti-dashboards';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResponse =
    await serverFetchGraphQL<settingsQuery>(SettingsQuery);
  const baseURI = settingsResponse.data.settings.base_url_front;

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseURI}/cybersecurity-solutions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseURI}/cybersecurity-solutions/${CUSTOM_DASHBOARD_SERVICE_SLUG}`,
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
      url: `${baseURI}/cybersecurity-solutions/${CUSTOM_DASHBOARD_SERVICE_SLUG}/${customDashboard.slug}`,
      lastModified: customDashboard.updated_at ?? customDashboard.created_at,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return sitemap;
}
