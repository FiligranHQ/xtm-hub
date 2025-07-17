import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';

import { queryMap, querySlugMap } from '../shareable-resources.consts';
import {
  SeoResource,
  ServiceSlug,
  ShareableResource,
} from '../shareable-resources.types';

export async function fetchAllDocuments(
  serviceSlug: ServiceSlug
): Promise<SeoResource[]> {
  const config = queryMap[serviceSlug];
  if (!config) {
    throw new Error(`Invalid service slug: ${serviceSlug}`);
  }
  const response = await serverFetchGraphQL(
    config.query,
    { serviceSlug },
    { cache: 'force-cache' }
  );

  return config.cast(response.data);
}

export async function fetchSingleDocument(
  serviceSlug: ServiceSlug,
  slug: string
): Promise<ShareableResource> {
  const config = querySlugMap[serviceSlug];
  const response = await serverFetchGraphQL(
    config.query,
    { slug },
    { cache: 'force-cache' }
  );
  return config.cast(response.data);
}
