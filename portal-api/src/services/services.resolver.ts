import { Service, Resolvers } from "../__generated__/resolvers-types.js";
import {dbFrom} from "../../knexfile.js";

const resolvers: Resolvers = {
    Query: {
        services: (_, __, context) => {
            return dbFrom<Service>(context, 'Service').select('*');
        },
    },
};

export default resolvers;