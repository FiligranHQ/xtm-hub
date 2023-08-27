import { Service, Resolvers } from "../__generated__/resolvers-types.js";
import {database} from "../../knexfile.js";

const resolvers: Resolvers = {
    Query: {
        services: () => {
            return database<Service>('services').select('*');
        },
    },
};

export default resolvers;