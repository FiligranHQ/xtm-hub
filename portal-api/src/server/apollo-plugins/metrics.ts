import { ApolloServerPlugin } from '@apollo/server';
import { Counter, Registry } from 'prom-client';

export const registry = new Registry();

export const graphqlMutationCounter = new Counter({
  name: 'graphql_mutation_total',
  help: 'Total number of GraphQL mutations called on XTM Hub',
  labelNames: ['mutation'],
});

export const graphqlQueryCounter = new Counter({
  name: 'graphql_query_total',
  help: 'Total number of GraphQL queries called on XTM Hub',
  labelNames: ['query'],
});

registry.registerMetric(graphqlMutationCounter);
registry.registerMetric(graphqlQueryCounter);

export const operationMetricsPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, document }) {
        if (!request.operationName) {
          return;
        }
        document.definitions.forEach((def) => {
          if (def.kind === 'OperationDefinition') {
            if (def.operation === 'mutation') {
              graphqlMutationCounter.inc({ mutation: request.operationName });
            } else if (def.operation === 'query') {
              graphqlQueryCounter.inc({ query: request.operationName });
            }
          }
        });
      },
    };
  },
};
