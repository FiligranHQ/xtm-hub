import {Resolvers, Node} from "../__generated__/resolvers-types.js";
import {database} from "../../knexfile.js";
import {GraphQLError} from "graphql/error/index.js";
import {fromGlobalId} from "graphql-relay/node/node.js";

const resolvers: Resolvers = {
    Query: {
        node: async (_, { id }, { user }) => {
            // This method only accessible for authenticated user
            if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
            const { type, id: databaseId } = fromGlobalId(id);
            return database<Node>(type).where('id', databaseId).first();
        },
    }
};

export default resolvers;