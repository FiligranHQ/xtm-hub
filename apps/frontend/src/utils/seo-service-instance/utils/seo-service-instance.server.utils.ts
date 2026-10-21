import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/utils/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';

export async function fetchSeoServiceInstances(): Promise<
  seoServiceInstanceFragment$data[]
> {
  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery,
    {},
    { cache: undefined, next: { revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS } }
  );

  return response.data
    .seoServiceInstances as unknown as seoServiceInstanceFragment$data[];
}

export async function fetchVisibleServiceSlugs(): Promise<string[]> {
  const services = await fetchSeoServiceInstances();

  return services.flatMap((service) => (service.slug ? [service.slug] : []));
}

/**
 * Whether `slug` is a public service instance, checked against the cached
 * `seoServiceInstances` list so a guessed slug 404s on the frontend instead of
 * erroring on the backend.
 */
export async function isPublicServiceSlug(slug: string): Promise<boolean> {
  const slugs = await fetchVisibleServiceSlugs();
  return slugs.includes(slug);
}
