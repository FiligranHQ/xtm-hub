import {PubSub, withFilter} from 'graphql-subscriptions';
import {Node} from "./__generated__/resolvers-types.js";
import {PortalContext} from "./index.js";
import {ActionType, DatabaseType, isNodeAccessible} from "../knexfile.js";

export interface TypedNode extends Node  {
    __typename: DatabaseType
}

const pubsub = new PubSub();

export const dispatch = async (type: DatabaseType, action: ActionType, data: Node) => {
    const node = { [action]: {...data, __typename: type} }
    await pubsub.publish(type, {[type]: node});
}

export const listen = (context: PortalContext, topic: DatabaseType) => {
    const iteratorFn = () => pubsub.asyncIterator([topic]);
    const filterFn = (payload: TypedNode) => isNodeAccessible(context.user, payload[topic]);
    return withFilter(iteratorFn, filterFn)();
}