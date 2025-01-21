import { fetchOrSubscribe } from '@/relay/environment/fetchFn';
import {
  Environment,
  FetchFunction,
  GraphQLResponse,
  Network,
  Observer,
  RecordSource,
  Store,
} from 'relay-runtime';
import { networkFetch } from './fetchFn';
import { buildQueryId, fieldLogger, isRelayObservable } from './helpers';

export type QueryResponsePayload = {
  queryId: string;
  response: GraphQLResponse;
};

/**
 * Creates a Relay environment, while also re-publishing all the responses
 * received from the network layer to the provided observer.
 *
 * @param observer An observer that receives the incremental GraphQL responses.
 * @returns The server-side Relay helper.
 */
export function createServerSideRelayEnvironment(
  observer: Observer<QueryResponsePayload>
) {
  const curriedFetchFn: FetchFunction = (request, variables) => {
    const observable = networkFetch('/graphql-api', request, variables);

    if (isRelayObservable(observable)) {
      const queryId = buildQueryId(request, variables);

      // Re-emit the observable responses to the provided observer,
      // while still returning them to Relay itself.
      return observable.do({
        next(response) {
          observer.next?.({
            queryId,
            response,
          });
        },
      });
    }

    return observable;
  };

  return new Environment({
    network: Network.create(curriedFetchFn, fetchOrSubscribe),
    store: new Store(new RecordSource()),
    isServer: true,
    // @ts-expect-error
    relayFieldLogger: fieldLogger,
  });
}
