import { Capability } from '../__generated__/resolvers-types';
import { TypedNode } from '../pub';
import { ActionType, DatabaseType, QueryOpts } from '../../knexfile';
import { Knex } from 'knex';
import { User } from '../model/user';
import { PortalContext } from '../model/portal-context';
import { CAPABILITY_ADMIN, CAPABILITY_BYPASS } from '../portal.const';

export const isUserGranted = (user: User, capability: Capability) => {
  if (!user) return false;
  const ids = user.capabilities.map((c) => c.id);
  return ids.includes(CAPABILITY_BYPASS.id) || ids.includes(capability.id);
};

/**
 * This method will filter every event to distribute real time data to users that have access to it
 * Data event must be consistent to provide all information needed to infer security access.
 */
export const isNodeAccessible = (
  user: User,
  data: { [action in ActionType]: TypedNode }
) => {
  const isInvalidActionSize = Object.keys(data).length !== 1;
  if (isInvalidActionSize) {
    // Event can only be setup to one action
    throw new Error('Invalid action size', { cause: data });
  }
  // Getting the node, we don't really care about the action to check the visibility
  const node = Object.values(data)[0];
  const availableTypes = ['Service', 'ServicePrice'];
  const type = node.__typename;
  // If user have bypass do not apply security layer
  if (isUserGranted(user, CAPABILITY_BYPASS)) {
    return true;
  }
  if (type === 'User') {
    // TODO Users can only be dispatched to admin
    return true;
  }
  if (type === 'Organization') {
    // TODO Organization can be dispatched to admin or if user is part of
    return true;
  }
  if (availableTypes.includes(type)) {
    return true;
  }

  throw new Error('Security behavior must be defined for type ' + type);
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
  const types = ['Service', 'RolePortal', 'Subscription', 'ServicePrice'];
  // If user is admin, user has no access restriction
  if (unsecured || isUserGranted(context?.user, CAPABILITY_ADMIN)) {
    return queryContext;
  }
  // Standard user can access to all users from its own organization
  if (type === 'User') {
    const organizationId = context.user.organization_id;
    queryContext.where('User.organization_id', '=', organizationId);
    return queryContext;
  }
  // Standard user can access only its own organization
  if (type === 'Organization') {
    queryContext.rightJoin(
      'User as security',
      'security.organization_id',
      '=',
      'Organization.id'
    );
    return queryContext;
  }
  // Standard user can access all services
  if (types.includes(type)) {
    return queryContext;
  }

  throw new Error('Security behavior must be defined for type ' + type);
};
