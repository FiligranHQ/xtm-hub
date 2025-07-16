import { GraphQLID } from 'graphql';

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
