import { defaultLocale, publicLocales } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { fetchAllDocuments } from '@/utils/shareable-resources/utils/shareable-resources.server.utils';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const buildLanguageMap = (baseURI: string, path: string) => {
  const languages: Record<string, string> = {};
  for (const loc of publicLocales) {
    languages[loc] = `${baseURI}/${loc}${path}`;
  }
  languages['x-default'] = `${baseURI}/${defaultLocale}${path}`;
  return languages;
};

const pushPerLocale = (
  sitemap: MetadataRoute.Sitemap,
  baseURI: string,
  path: string,
  entry: {
    lastModified: string | Date;
    changeFrequency: 'monthly';
    priority: number;
  }
) => {
  const languages = buildLanguageMap(baseURI, path);
  for (const loc of publicLocales) {
    sitemap.push({
      ...entry,
      url: `${baseURI}/${loc}${path}`,
      alternates: { languages },
    });
  }
};

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

  const sitemap: MetadataRoute.Sitemap = [];

  pushPerLocale(sitemap, baseURI, '', {
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  const documentBearingServiceSlugs = new Set<string>(
    Object.values(ServiceSlug)
  );

  for (const service of routableSeoServiceInstances) {
    const servicePath = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${service.slug}`;
    pushPerLocale(sitemap, baseURI, servicePath, {
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    });

    if (!documentBearingServiceSlugs.has(service.slug as string)) {
      continue;
    }

    const resources = await fetchAllDocuments(service.slug as ServiceSlug);
    for (const resource of resources) {
      if (!resource.slug) continue;
      const docPath = `${servicePath}/${resource.slug}`;
      pushPerLocale(sitemap, baseURI, docPath, {
        lastModified: resource.updated_at ?? resource.created_at,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return sitemap;
}
