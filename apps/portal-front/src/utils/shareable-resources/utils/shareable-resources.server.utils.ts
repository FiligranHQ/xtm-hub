import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';

import publicDocumentBySlugQueryGraphql from '@generated/publicDocumentBySlugQuery.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { queryMap } from '../shareable-resources.consts';
import { SeoResource, ServiceSlug } from '../shareable-resources.types';

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
  serviceInstanceId: string,
  slug: string
): Promise<publicDocumentItemFragment$data> {
  const response = await serverFetchGraphQL(
    publicDocumentBySlugQueryGraphql,
    { slug, serviceInstanceId },
    { cache: 'force-cache' }
  );
  const safeData = response.data as Record<string, unknown>;
  return safeData['publicDocumentBySlug'] as publicDocumentItemFragment$data;
}
