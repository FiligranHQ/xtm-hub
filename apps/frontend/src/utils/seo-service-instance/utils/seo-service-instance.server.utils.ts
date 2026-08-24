import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
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
    { cache: undefined, next: { revalidate: 3600 } }
  );

  return response.data
    .seoServiceInstances as unknown as seoServiceInstanceFragment$data[];
}

export async function fetchVisibleServiceSlugs(): Promise<string[]> {
  const services = await fetchSeoServiceInstances();

  return services.flatMap((service) => (service.slug ? [service.slug] : []));
}
