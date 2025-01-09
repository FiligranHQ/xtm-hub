import { Knex } from 'knex';
import { ActionType, DatabaseType, QueryOpts } from '../../knexfile';
import CapabilityPortal from '../model/kanel/public/CapabilityPortal';
import { PortalContext } from '../model/portal-context';
import { CAPABILITY_BYPASS } from '../portal.const';
import { TypedNode } from '../pub';

import { UserLoadUserBy } from '../model/user';
import { setQueryForDocument } from './document-security-access';
import {
  meUserSSESecurity,
  setQueryForUser,
  userSSESecurity,
} from './user-security-access';

export const isUserGranted = (
  user: UserLoadUserBy,
  capability: CapabilityPortal
) => {
  return (
    !!user &&
    user.capabilities.some(
      (c) => c.id === CAPABILITY_BYPASS.id || c.id === capability.id
    )
  );
};
/**
 * This method will filter every event to distribute real time data to users that have access to it
 * Data event must be consistent to provide all information needed to infer security access.
 */

export const applySSESecurity = (opt: {
  user: UserLoadUserBy;
  data: { [action in ActionType]: TypedNode };
  type: string;
  topic: string;
}) => {
  if (isUserGranted(opt.user, CAPABILITY_BYPASS)) {
    return true;
  }
  if (opt.type === opt.topic) {
    return true;
  }
  return false;
};

export type AccessibleTopics = 'MeUser' | DatabaseType;
export const isNodeAccessible = async (
  user: UserLoadUserBy,
  topic: string,
  data: { [action in ActionType]: TypedNode }
) => {
  const isInvalidActionSize = Object.keys(data).length !== 1;
  if (isInvalidActionSize) {
    // Event can only be setup to one action
    throw new Error('Invalid action size', { cause: data });
  }
  type AccessibilityChecker = (opt: {
    user: UserLoadUserBy;
    data?: { [action in ActionType]: TypedNode };
    type?: string;
    topic?: string;
  }) => boolean;

  const mapping: Partial<Record<AccessibleTopics, AccessibilityChecker>> = {
    User: userSSESecurity,
    MeUser: meUserSSESecurity,
  };
  const node = Object.values(data)[0];
  const type = node.__typename;

  const selectedFunction = mapping[topic] || applySSESecurity;
  if (!selectedFunction) {
    throw new Error(`Security behavior must be defined for type ${type}`);
  }
  return selectedFunction({ user, data, type, topic });
};

export const setQuery = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>
): Knex.QueryBuilder<T> => {
  return queryContext;
};
/**
 * This method will apply queries extra filter depending on the user context
 * Every get or listing will be protected by this method
 */
export const applyDbSecurity = <T>(
  context: PortalContext,
  type: DatabaseType,
  queryContext: Knex.QueryBuilder<T>,
  opts: QueryOpts = {}
) => {
  const { unsecured = false } = opts;

  // If user is admin, user has no access restriction
  // TODO We need to filter query that is not a select but the applyDbSecurity is used at the init of the query so we cannot not where it's used and how update/select etC..
  if (unsecured || isUserGranted(context?.user, CAPABILITY_BYPASS)) {
    return queryContext;
  }

  type AccessibilityChecker = <T>(
    context: PortalContext,
    queryContext: Knex.QueryBuilder<T>
  ) => Knex.QueryBuilder<T>;

  const mapping: Partial<Record<DatabaseType, AccessibilityChecker>> = {
    Document: setQueryForDocument,
    User: setQueryForUser,
  };

  const selectedFunction = mapping[type] || setQuery;
  if (!selectedFunction) {
    throw new Error(`Security behavior must be defined for type ${type}`);
  }
  return selectedFunction(context, queryContext);
};
