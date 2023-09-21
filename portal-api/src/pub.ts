import {PubSub, withFilter} from 'graphql-subscriptions';
import {Node} from "./__generated__/resolvers-types.js";
import {PortalContext} from "./index.js";
import {ActionType, DatabaseType} from "../knexfile.js";
import {isNodeAccessible} from "./security/access.js";

export interface TypedNode extends Node {
    __typename: DatabaseType
}

type PubEvent = {
    [k in DatabaseType]: {
        [action in ActionType]: TypedNode;
    };
};

const pubsub = new PubSub();

export const dispatch = async (type: DatabaseType, action: ActionType, data: Node) => {
    const node = {[action]: {...data, __typename: type}}
    await pubsub.publish(type, {[type]: node});
}

export const listen = (context: PortalContext, topics: (DatabaseType)[]) => {
    const iteratorFn = () => pubsub.asyncIterator(topics);
    const filterFn = (event: PubEvent) => {
        const values = Object.values(event);
        return isNodeAccessible(context.user, values[0]);
    }
    return withFilter(iteratorFn, filterFn)();
}