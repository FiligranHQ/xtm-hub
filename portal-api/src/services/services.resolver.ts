import {Resolvers, Service} from "../__generated__/resolvers-types.js";
import {paginate} from "../../knexfile.js";

const resolvers: Resolvers = {
    Query: {
        services: async (_, { first, after, orderMode, orderBy }, context) => {
            return paginate<Service>(context, 'Service', { first, after, orderMode, orderBy }).select('*');
        },
    },
};

export default resolvers;