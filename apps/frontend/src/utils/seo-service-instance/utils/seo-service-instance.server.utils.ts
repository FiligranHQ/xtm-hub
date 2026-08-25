import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/utils/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { notFound } from 'next/navigation';

export async function fetchSeoServiceInstances(): Promise<
  seoServiceInstanceFragment$data[]
> {
  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery,
    {},
    { cache: undefined, next: { revalidate: 3600 } }
  );

  return response.data
    .seoServiceInstances as unknown as seoServiceInstanceFragment$data[];
}

/**
 * Fetches the public SEO service instance for a slug. `seoServiceInstance` is
 * a non-nullable GraphQL field, so when the backend can't find a public
 * ServiceInstance for this slug it returns a GraphQL error (SERVICE_NOT_FOUND)
 * rather than a null field. The relay network layer turns that into a thrown
 * Error, so we must catch it here and resolve it as a normal 404 instead of
 * letting it bubble up as an unhandled exception.
 */
export async function fetchSeoServiceInstanceBySlug(
  slug: string
): Promise<seoServiceInstanceFragment$data> {
  let response;
  try {
    response = await serverFetchGraphQL<seoServiceInstanceQuery>(
      SeoServiceInstanceQuery,
      { slug },
      {
        cache: undefined,
        next: { revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS },
      }
    );
  } catch {
    notFound();
  }

  const serviceInstance = response.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;

  if (!serviceInstance) {
    notFound();
  }

  return serviceInstance;
}

export async function fetchVisibleServiceSlugs(): Promise<string[]> {
  const services = await fetchSeoServiceInstances();

  return services.flatMap((service) => (service.slug ? [service.slug] : []));
}
