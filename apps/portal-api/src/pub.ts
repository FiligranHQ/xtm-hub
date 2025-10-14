import { FieldNode, GraphQLResolveInfo, Kind } from 'graphql';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { ActionType, DatabaseType } from '../knexfile';
import { Node } from './__generated__/resolvers-types';
import { PortalContext } from './model/portal-context';
import { isNodeAccessible } from './security/access';
import { logApp } from './utils/app-logger.util';

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

export const listen = (
  context: PortalContext,
  topics: string[],
  info?: GraphQLResolveInfo,
  filter?: (payload: unknown) => boolean
) => {
  const iteratorFn = () => pubsub.asyncIterator(topics);
  const getRequestedFields = () => {
    if (!info) return null;

    const selections = info.fieldNodes[0].selectionSet?.selections || [];
    return selections
      .filter((sel): sel is FieldNode => sel.kind === Kind.FIELD)
      .map((sel) => sel.name.value);
  };

  const filterFn = async (event: PubEvent) => {
    try {
      const [topic] = Object.keys(event);
      const payload = event[topic];
      if (!payload) return false;

      const values = Object.values(event);
      const [action] = Object.keys(payload);
      const requestedFields = getRequestedFields();

      if (requestedFields && !requestedFields.includes(action)) {
        return false;
      }

      const isAccessible = await isNodeAccessible(
        context.user,
        topic,
        values[0]
      );
      const isFiltered = filter ? filter(payload) : true;
      return isAccessible && isFiltered;
    } catch (error) {
      logApp.error('Error while sending SSE payload', { error });
    }
  };
  return withFilter(iteratorFn, filterFn)();
};
