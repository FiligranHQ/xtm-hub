import { ServiceDefinitionIdentifier } from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';
import { GraphQLID } from 'graphql';

// Type guard for ServiceDefinitionIdentifier
export function isValidServiceDefinitionIdentifier(
  value: unknown
): value is ServiceDefinitionIdentifier {
  return (
    typeof value === 'string' &&
    ['custom_dashboards', 'link', 'vault'].includes(value)
  );
}

// @see https://github.com/graphql/graphql-relay-js/blob/main/src/node/node.ts#L91
export function toGlobalId(type: string, id: string | number): string {
  return btoa([type, GraphQLID.serialize(id)].join(':'));
}

// @see https://github.com/graphql/graphql-relay-js/blob/main/src/node/node.ts#L99
export function fromGlobalId(globalId: string): { type: string; id: string } {
  const unbasedGlobalId = atob(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1),
  };
}
