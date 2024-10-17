import {Resolvers} from "../../../__generated__/resolvers-types";
import {insertInMinio} from "./file-storage";

const resolvers: Resolvers = {
    Mutation: {
        vaultFile: async (_, opt, context) => {
            try {
                await insertInMinio(opt.file.file, context.user.id);
            } catch (error) {
                console.error("Error while inserting file:", error);
            }
            return opt.file.file.filename;
        }
    }
}

export default resolvers;
