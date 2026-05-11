import { createServerSideRelayEnvironment } from '@/relay/environment';
import { fetchQuery, VariablesOf } from 'react-relay';
import { GraphQLTaggedNode, OperationType } from 'relay-runtime';

export const useServerLoader = () => {
  const relayEnvironment = createServerSideRelayEnvironment({});

  const loadQuery = <T extends OperationType>(
    query: GraphQLTaggedNode,
    variables: VariablesOf<T>
  ) => fetchQuery(relayEnvironment, query, variables).toPromise();

  return {
    loadQuery,
  };
};

export default useServerLoader;
