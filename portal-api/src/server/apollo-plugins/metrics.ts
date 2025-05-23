import { ApolloServerPlugin } from '@apollo/server';
import { Counter, Histogram, Registry } from 'prom-client';

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

export const graphqlOperationDuration = new Histogram({
  name: 'graphql_operation_duration_seconds',
  help: 'Duration of GraphQL operations in seconds',
  labelNames: ['operation', 'name'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

registry.registerMetric(graphqlMutationCounter);
registry.registerMetric(graphqlQueryCounter);
registry.registerMetric(graphqlOperationDuration);
export const operationMetricsPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    let endTimer: (() => void) | null = null;

    const operationMapping = {
      mutation: (name: string) => {
        graphqlMutationCounter.inc({ mutation: name });
        return 'mutation';
      },
      query: (name: string) => {
        graphqlQueryCounter.inc({ query: name });
        return 'query';
      },
    } as const;

    return {
      async didResolveOperation({ request, document }) {
        const { operationName } = request;
        if (!operationName) return;

        for (const def of document.definitions) {
          if (def.kind === 'OperationDefinition') {
            const operation = def.operation as keyof typeof operationMapping;
            if (operationMapping[operation]) {
              const operationType = operationMapping[operation](operationName);
              endTimer = graphqlOperationDuration.startTimer({
                operation: operationType,
                name: operationName,
              });
              break;
            }
          }
        }
      },

      async willSendResponse() {
        if (endTimer) {
          endTimer();
        }
      },
    };
  },
};
