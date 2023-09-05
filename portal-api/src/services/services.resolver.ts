import {Resolvers, Service} from "../__generated__/resolvers-types.js";
import {db, paginate} from "../../knexfile.js";
import {v4 as uuidv4} from "uuid";
import {dispatch, listen} from "../pub.js";

const resolvers: Resolvers = {
    Query: {
        services: async (_, { first, after, orderMode, orderBy }, context) => {
            return paginate<Service>(context, 'Service', { first, after, orderMode, orderBy }).select('*');
        },
    },
    Mutation: {
        addService: async (_, {name}, context) => {
            const data = {id: uuidv4(), name};
            const [addedService] = await db<Service>(context, 'Service').insert(data).returning('*');
            await dispatch('Service', 'serviceCreated', addedService);
            return addedService;
        },
    },
    Subscription: {
        serviceCreated: {
            subscribe: (_, __, context) => ({
                [Symbol.asyncIterator]: () => listen(context, 'serviceCreated'),
            }),
        },
    },
};

export default resolvers;

