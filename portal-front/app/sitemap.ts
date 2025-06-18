import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { fetchAllDocuments } from '@/utils/shareable-resources/shareable-resources.utils';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import type { MetadataRoute } from 'next';

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
    (service) => service.slug !== null && service.slug !== undefined
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

    const resources = await fetchAllDocuments(service.slug as ServiceSlug);
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
