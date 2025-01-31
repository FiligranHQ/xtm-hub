import { createServerSideRelayEnvironment } from '@/relay/environment';
import { fetchQuery, VariablesOf } from 'react-relay';
import { GraphQLTaggedNode, OperationType } from 'relay-runtime';

export const useServerLoader = () => {
  const relayEnvironment = createServerSideRelayEnvironment({
    next(_response) {
      //console.log('Relay SSR response:', _response);
    },
  });

  const loadQuery = <T extends OperationType>(
    query: GraphQLTaggedNode,
    variables: VariablesOf<T>
  ) => fetchQuery(relayEnvironment, query, variables).toPromise();

  return {
    loadQuery,
  };
};

export default useServerLoader;
