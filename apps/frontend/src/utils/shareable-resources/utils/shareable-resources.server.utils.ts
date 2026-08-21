import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';

import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import type { publicDocumentByServiceSlugItemFragment$data } from '@generated/publicDocumentByServiceSlugItemFragment.graphql';
import type { publicDocumentBySlugItemFragment$data } from '@generated/publicDocumentBySlugItemFragment.graphql';
import publicDocumentBySlugQueryGraphql from '@generated/publicDocumentBySlugQuery.graphql';
import publicDocumentsByServiceSlugQueryGraphql from '@generated/publicDocumentsByServiceSlugQuery.graphql';

/**
 * Cache tag used to (in)validate the cached list of public documents for a
 * given service instance. Call `updateTag(publicDocumentsCacheTag(slug))`
 * (see `revalidate-document-slugs.actions.ts`) whenever a document is
 * created, updated or deleted so both `fetchAllDocuments` and the
 * `app/sitemap.ts` route (which reuses this same function) stay fresh.
 */
export const publicDocumentsCacheTag = (serviceInstanceSlug: string): string =>
  `public-documents:${serviceInstanceSlug}`;

/**
 * Fallback time-based revalidation for public document data. Some documents
 * (e.g. connectors) are created/updated by backend processes (manifest
 * ingestion) that don't go through the front-end mutations wired to
 * `revalidateDocumentSlugsAction`, so on-demand tag invalidation alone
 * wouldn't pick up their changes. This periodic revalidation guarantees data
 * is never stale for longer than this window, regardless of how it changed.
 */
const PUBLIC_DOCUMENTS_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

export async function fetchAllDocuments(
  serviceInstanceSlug: ServiceSlug
): Promise<publicDocumentByServiceSlugItemFragment$data[]> {
  if (!Object.values(ServiceSlug).includes(serviceInstanceSlug)) {
    throw new Error(`Invalid service slug: ${serviceInstanceSlug}`);
  }
  const response = await serverFetchGraphQL(
    publicDocumentsByServiceSlugQueryGraphql,
    { serviceInstanceSlug },
    {
      cache: 'force-cache',
      next: {
        tags: [publicDocumentsCacheTag(serviceInstanceSlug)],
        revalidate: PUBLIC_DOCUMENTS_REVALIDATE_SECONDS,
      },
    }
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
    {
      cache: 'force-cache',
      next: { revalidate: PUBLIC_DOCUMENTS_REVALIDATE_SECONDS },
    }
  );
  const safeData = response.data as Record<string, unknown>;
  return safeData[
    'publicDocumentBySlug'
  ] as publicDocumentBySlugItemFragment$data | null;
}
