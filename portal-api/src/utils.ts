import {fromGlobalId} from "graphql-relay/node/node.js";
import {DatabaseType} from "../knexfile.js";

export const extractId = (id: string) => {
    const {id: databaseId} = fromGlobalId(id) as { type: DatabaseType, id: string };
    return databaseId;
}