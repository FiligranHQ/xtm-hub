'use server';
import { publicDocumentsCacheTag } from '@/utils/shareable-resources/utils/shareable-resources.server.utils';
import { updateTag } from 'next/cache';

/**
 * Invalidates the cached list of public documents for a service instance, so
 * the public `[slug]/[docSlug]` page and `app/sitemap.ts` (both reuse
 * `fetchAllDocuments`) pick up newly created/updated/deleted document slugs
 * immediately instead of serving a stale list.
 *
 * Uses `updateTag` (not `revalidateTag`) on purpose: this is called from a
 * Server Action right after a document mutation, and we need read-your-own-
 * writes semantics — the very next request must see fresh data, not a
 * stale-while-revalidate response, otherwise a user could be redirected to
 * the document they just created/updated and hit a false 404.
 */
export default async function revalidateDocumentSlugsAction(
  serviceInstanceSlug: string
) {
  updateTag(publicDocumentsCacheTag(serviceInstanceSlug));
}
