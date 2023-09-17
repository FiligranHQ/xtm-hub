import {Resolvers, Service, ServiceConnection} from "../__generated__/resolvers-types.js";
import {DatabaseType, db, paginate} from "../../knexfile.js";
import {v4 as uuidv4} from "uuid";
import {dispatch, listen} from "../pub.js";
import {fromGlobalId} from "graphql-relay/node/node.js";

const resolvers: Resolvers = {
    Query: {
        services: async (_, {first, after, orderMode, orderBy}, context) => {
            return paginate<Service>(context, 'Service', {first, after, orderMode, orderBy}).select('*')
                .asConnection<ServiceConnection>();
        },
    },
    Mutation: {
        deleteService: async (_, {id}, context) => {
            const {id: databaseId} = fromGlobalId(id) as { type: DatabaseType, id: string };
            const [deletedService] = await db<Service>(context, 'Service').where({id: databaseId}).delete('*');
            await dispatch('Service', 'delete', deletedService);
            return deletedService;
        },
        editService: async (_, {id, name}, context) => {
            const {id: databaseId} = fromGlobalId(id) as { type: DatabaseType, id: string };
            const [updatedService] = await db<Service>(context, 'Service').where({id: databaseId}).update({name}).returning('*');
            await dispatch('Service', 'edit', updatedService);
            return updatedService;
        },
        addService: async (_, {name}, context) => {
            const data = {id: uuidv4(), name};
            const [addedService] = await db<Service>(context, 'Service').insert(data).returning('*');
            await dispatch('Service', 'add', addedService);
            return addedService;
        },
    },
    Subscription: {
        Service: {
            subscribe: (_, __, context) => ({
                [Symbol.asyncIterator]: () => listen(context, ['Service']),
            }),
        },
    },
};

export default resolvers;

