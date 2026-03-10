import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';

import publicDocumentBySlugQueryGraphql from '@generated/publicDocumentBySlugQuery.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import publicDocumentsByServiceSlugQueryGraphql from '@generated/publicDocumentsByServiceSlugQuery.graphql';
import { ServiceSlug } from '../shareable-resources.types';

export async function fetchAllDocuments(
  serviceInstanceSlug: ServiceSlug
): Promise<publicDocumentItemFragment$data[]> {
  if (!Object.values(ServiceSlug).includes(serviceInstanceSlug)) {
    throw new Error(`Invalid service slug: ${serviceInstanceSlug}`);
  }
  const response = await serverFetchGraphQL(
    publicDocumentsByServiceSlugQueryGraphql,
    { serviceInstanceSlug },
    { cache: 'force-cache' }
  );

  const safeData = response.data as Record<string, unknown>;
  return safeData[
    'publicDocumentsByServiceSlug'
  ] as publicDocumentItemFragment$data[];
}

export async function fetchSingleDocument(
  serviceInstanceId: string,
  slug: string
): Promise<publicDocumentItemFragment$data | null> {
  const response = await serverFetchGraphQL(
    publicDocumentBySlugQueryGraphql,
    { slug, serviceInstanceId },
    { cache: 'force-cache' }
  );
  const safeData = response.data as Record<string, unknown>;
  return safeData[
    'publicDocumentBySlug'
  ] as publicDocumentItemFragment$data | null;
}
