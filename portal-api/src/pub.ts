import { PubSub, withFilter } from 'graphql-subscriptions';
import { ActionType, DatabaseType } from '../knexfile';
import { Node } from './__generated__/resolvers-types';
import { PortalContext } from './model/portal-context';
import { isNodeAccessible } from './security/access';

export interface TypedNode extends Node {
  __typename: DatabaseType;
}

type PubEvent = {
  [k in DatabaseType]: {
    [action in ActionType]: TypedNode;
  };
};

const pubsub = new PubSub();

export const dispatch = async (
  type: string,
  action: ActionType,
  data: Node,
  typename?: DatabaseType
) => {
  const node = { [action]: { ...data, __typename: typename ?? type } };
  await pubsub.publish(type, { [type]: node });
};

export const listen = (context: PortalContext, topics: string[]) => {
  const iteratorFn = () => pubsub.asyncIterator(topics);
  const filterFn = async (event: PubEvent) => {
    const [topic] = Object.keys(event);
    const payload = event[topic];
    if (!payload) return false;

    const values = Object.values(event);
    const isAccessible = await isNodeAccessible(context.user, values[0]);

    return isAccessible;
  };
  return withFilter(iteratorFn, filterFn)();
};
