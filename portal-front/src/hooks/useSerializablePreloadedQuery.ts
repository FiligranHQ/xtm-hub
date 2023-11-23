// Convert preloaded query object (with raw GraphQL Response) into
// Relay's PreloadedQuery.

import {
  loadQuery,
  PreloadedQuery,
  PreloadFetchPolicy,
  useRelayEnvironment,
} from 'react-relay';
import {
  ConcreteRequest,
  createOperationDescriptor,
  OperationType,
} from 'relay-runtime';
import { SerializablePreloadedQuery } from '@/relay/loadSerializableQuery';
import { GraphQLSingularResponse } from 'relay-runtime/lib/network/RelayNetworkTypes';

// This hook convert serializable preloaded query
// into Relay's PreloadedQuery object.
// It is also writes this serializable preloaded query
// into QueryResponseCache, so we the network layer
// can use these cache results when fetching data
// in `usePreloadedQuery`.
export default function useSerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
>(
  preloadQuery: SerializablePreloadedQuery<TRequest, TQuery>,
  fetchPolicy: PreloadFetchPolicy = 'store-or-network'
): PreloadedQuery<TQuery> {
  const environment = useRelayEnvironment();
  const descriptor = createOperationDescriptor(
    preloadQuery.request,
    preloadQuery.variables
  );
  environment.commitPayload(
    descriptor,
    (preloadQuery.response as GraphQLSingularResponse).data!
  );
  return loadQuery(
    environment,
    descriptor.request.node,
    descriptor.request.variables,
    { fetchPolicy }
  );
}
