import { cookies } from 'next/headers';
import { GraphQLResponse, OperationType, VariablesOf } from 'relay-runtime';
import { ConcreteRequest } from 'relay-runtime/lib/util/RelayConcreteNode';
import { getGraphqlApi, networkFetch } from './environment/fetchFn';

// Call into raw network fetch to get serializable GraphQL query response
// This response will be sent to the client to "warm" the QueryResponseCache
// to avoid the client fetches.
export default async function serverPortalApiFetch<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
>(request: TRequest, variables: VariablesOf<TQuery>): Promise<GraphQLResponse> {
  const c = await cookies();
  const portalCookie = c.get('cloud-portal');
  const apiDestination = getGraphqlApi(true, 'api');
  return networkFetch(apiDestination, request.params, variables, portalCookie);
}

export async function serverFetchGraphQL<TQuery extends OperationType>(
  request: ConcreteRequest,
  variables: VariablesOf<TQuery>
): Promise<{ data: TQuery['response'] }> {
  const rawResponse = await serverPortalApiFetch<typeof request, TQuery>(
    request,
    variables
  );
  const response =
    Array.isArray(rawResponse) && rawResponse.length > 0
      ? rawResponse[0]
      : rawResponse;
  return response as unknown as { data: TQuery['response'] };
}

export async function serverMutateGraphQL<TMutation extends OperationType>(
  request: ConcreteRequest,
  variables: VariablesOf<TMutation>
): Promise<{ data: TMutation['response'] }> {
  const rawResponse = await serverPortalApiFetch<typeof request, TMutation>(
    request,
    variables
  );
  const response =
    Array.isArray(rawResponse) && rawResponse.length > 0
      ? rawResponse[0]
      : rawResponse;
  return response as unknown as { data: TMutation['response'] };
}
