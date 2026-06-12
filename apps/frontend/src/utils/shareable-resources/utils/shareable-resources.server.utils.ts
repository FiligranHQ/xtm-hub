import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';

import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import type { publicDocumentByServiceSlugItemFragment$data } from '@generated/publicDocumentByServiceSlugItemFragment.graphql';
import type { publicDocumentBySlugItemFragment$data } from '@generated/publicDocumentBySlugItemFragment.graphql';
import publicDocumentBySlugQueryGraphql from '@generated/publicDocumentBySlugQuery.graphql';
import publicDocumentsByServiceSlugQueryGraphql from '@generated/publicDocumentsByServiceSlugQuery.graphql';

export async function fetchAllDocuments(
  serviceInstanceSlug: ServiceSlug
): Promise<publicDocumentByServiceSlugItemFragment$data[]> {
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
  ] as publicDocumentByServiceSlugItemFragment$data[];
}

export async function fetchSingleDocument(
  serviceInstanceId: string,
  slug: string
): Promise<publicDocumentBySlugItemFragment$data | null> {
  const response = await serverFetchGraphQL(
    publicDocumentBySlugQueryGraphql,
    { slug, serviceInstanceId },
    { cache: 'force-cache' }
  );
  const safeData = response.data as Record<string, unknown>;
  return safeData[
    'publicDocumentBySlug'
  ] as publicDocumentBySlugItemFragment$data | null;
}
