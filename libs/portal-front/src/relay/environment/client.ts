import { isEmpty, isNil } from '@/lib/utils';
import { fetchOrSubscribe } from '@/relay/environment/fetchFn';
import { fetchFormData } from '@/relay/environment/fetchFormData';
import {
  Environment,
  FetchFunction,
  GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  ReplaySubject,
  Store,
} from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import { networkFetch } from './fetchFn';
import {
  buildQueryId,
  fieldLogger,
  hasHydrationResponses,
  RELAY_WINDOW_KEY,
} from './helpers';

// A singleton helper that is shared on the client.
let clientSideRelayEnvironment: RelayModernEnvironment | null = null;

/**
 * Creates a Relay Environment, while hydrating the Relay store with the responses
 * that were previously received from the server.
 *
 * @param resolveReplaySubject A function used to produce a ReplaySubject for a given queryId.
 * @returns The client-side Relay helper.
 */
export function createClientSideRelayEnvironment() {
  if (clientSideRelayEnvironment) {
    return clientSideRelayEnvironment;
  }

  const curriedFetchFn: FetchFunction = (
    request,
    variables,
    _,
    uploadables
  ) => {
    if (hasHydrationResponses()) {
      const queryId = buildQueryId(request, variables);

      const replaySubject = tryResolveReplaySubject(queryId);

      if (replaySubject) {
        // Replay all responses to the observable that is returned to Relay.
        return Observable.create<GraphQLResponse>((sink) =>
          replaySubject.subscribe(sink)
        );
      }
    }

    if (!isNil(uploadables) && !isEmpty(uploadables)) {
      return fetchFormData('/graphql-api', request, variables, uploadables);
    }
    // If we don't have hydration responses, execute the request as usual.
    return networkFetch({ request, variables });
  };

  // Create a new helper or reuse the existing one, if one has already been created.
  clientSideRelayEnvironment ||= new Environment({
    network: Network.create(curriedFetchFn, fetchOrSubscribe),
    store: new Store(new RecordSource()),
    // @ts-expect-error https://github.com/facebook/relay/issues/4666
    relayFieldLogger: fieldLogger,
  });
  return clientSideRelayEnvironment;
}

function tryResolveReplaySubject(queryId: string) {
  const win = window as Window & typeof globalThis;
  // @ts-expect-error
  const rawResponses = win[RELAY_WINDOW_KEY]?.[queryId];

  const responses: GraphQLResponse[] = Array.isArray(rawResponses)
    ? rawResponses
    : [];

  if (responses.length < 1) {
    return null;
  }

  const replaySubject = new ReplaySubject<GraphQLResponse>();

  function replayResponse(response: GraphQLResponse) {
    replaySubject.next(response);

    if (!('hasNext' in response) || !response.hasNext) {
      replaySubject.complete();

      delete win[rawResponses];
    }
  }

  function handlePushResponses(responses: GraphQLResponse[]) {
    if (Array.isArray(responses)) {
      for (const response of responses) {
        replayResponse(response);
      }
    } else {
      replayResponse(responses);
    }
  }

  // Replay the responses we got from the window.
  handlePushResponses(responses);

  // Setup a listener for responses that are pushed onto the window
  // by script tags that are being inserted later.
  // @ts-expect-error
  win[RELAY_WINDOW_KEY][queryId] = {
    push: handlePushResponses,
  };

  return replaySubject;
}
