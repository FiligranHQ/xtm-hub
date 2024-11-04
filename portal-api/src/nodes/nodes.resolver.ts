import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
import { DatabaseType, db } from '../../knexfile';
import { Node, Resolvers } from '../__generated__/resolvers-types';

const resolvers: Resolvers = {
  Query: {
    node: async (_, { id }, context) => {
      // This method only accessible for authenticated user
      if (!context.user)
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      const { type, id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      return db<Node>(context, type).where({ id: databaseId }).first();
    },
  },
  Node: {
    id: (node) => toGlobalId(node.__typename, node.id),
    __resolveType: (node) => {
      return node.__typename;
    },
  },
};

export default resolvers;
