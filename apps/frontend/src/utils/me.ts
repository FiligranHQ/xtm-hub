import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
} from '@generated/meLoaderQuery.graphql';

// Identity checks must never be served from the shared Next.js Data Cache
// (force-cache would leak/reuse another request's "me" response and can
// cause redirect loops).
export const fetchMe = async () => {
  const { data: meData } = await serverFetchGraphQL<meLoaderQuery>(
    meLoaderQueryNode,
    {},
    { cache: 'no-store' }
  );

  return (meData.me ?? null) as unknown as meContext_fragment$data | null;
};
