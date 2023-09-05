import {PubSub, withFilter} from 'graphql-subscriptions';
import {Node} from "./__generated__/resolvers-types.js";
import {PortalContext} from "./index.js";
import {DatabaseType, isNodeAccessible} from "../knexfile.js";

export interface TypedNode extends Node  {
    __typename: DatabaseType
}

const pubsub = new PubSub();

export const dispatch = async (type: DatabaseType, topic: string, data: Node) => {
    await pubsub.publish(topic, {[topic]: {...data, __typename: type}});
}

export const listen = (context: PortalContext, topic: string) => {
    const iteratorFn = () => pubsub.asyncIterator([topic]);
    const filterFn = (payload: TypedNode) => isNodeAccessible(context.user, payload[topic]);
    return withFilter(iteratorFn, filterFn)();
}