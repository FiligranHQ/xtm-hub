import { GraphQLResponse, OperationType, VariablesOf } from 'relay-runtime';
import { ConcreteRequest } from 'relay-runtime/lib/util/RelayConcreteNode';
import { getGraphqlApi, networkFetch } from './environment/fetchFn';
import { cookies } from 'next/headers';

// Call into raw network fetch to get serializable GraphQL query response
// This response will be sent to the client to "warm" the QueryResponseCache
// to avoid the client fetches.
export default async function serverPortalApiFetch<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
>(request: TRequest, variables: VariablesOf<TQuery>): Promise<GraphQLResponse> {
  const portalCookie = cookies().get('cloud-portal');
  const apiDestination = getGraphqlApi(true, 'api');
  return networkFetch(apiDestination, request.params, variables, portalCookie);
}
