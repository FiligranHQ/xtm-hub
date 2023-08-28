import { Service, Resolvers } from "../__generated__/resolvers-types.js";
import {dbFrom} from "../../knexfile.js";

const resolvers: Resolvers = {
    Query: {
        services: () => {
            return dbFrom<Service>('Service').select('*');
        },
    },
};

export default resolvers;