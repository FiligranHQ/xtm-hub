import { Knex } from 'knex';
import { ActionType, DatabaseType, QueryOpts } from '../../knexfile';
import CapabilityPortal from '../model/kanel/public/CapabilityPortal';
import MalwareAnalysis from '../model/kanel/public/MalwareAnalysis';
import { PortalContext } from '../model/portal-context';
import { loadUserBy } from '../modules/users/users.domain';
import { CAPABILITY_BYPASS, CAPABILITY_FRT_MANAGE_USER } from '../portal.const';
import { TypedNode } from '../pub';

import { UserLoadUserBy } from '../model/user';

const isUserGranted = (user: UserLoadUserBy, capability: CapabilityPortal) =>
  !!user &&
  user.capabilities.some(
    (c) => c.id === CAPABILITY_BYPASS.id || c.id === capability.id
  );
/**
 * This method will filter every event to distribute real time data to users that have access to it
 * Data event must be consistent to provide all information needed to infer security access.
 */
export const isNodeAccessible = async (
  user: UserLoadUserBy,
  data: { [action in ActionType]: TypedNode }
) => {
  const isInvalidActionSize = Object.keys(data).length !== 1;
  if (isInvalidActionSize) {
    // Event can only be setup to one action
    throw new Error('Invalid action size', { cause: data });
  }
  // Getting the node, we don't really care about the action to check the visibility
  const node = Object.values(data)[0];
  const availableTypes = [
    'Service',
    'Service_Price',
    'Service_Link',
    'User_Service',
    'Service_Capability',
    'ActionTracking',
    'Document'
  ];
  const type = node.__typename;
  // If user have bypass do not apply security layer
  if (isUserGranted(user, CAPABILITY_BYPASS)) {
    return true;
  }
  if (type === 'User') {
    // Users can only be dispatched to admin
    return isUserGranted(user, CAPABILITY_FRT_MANAGE_USER);
  }
  if (type === 'Organization') {
    // TODO Organization can be dispatched to admin or if user is part of
    // We do not send any organization by SSE for the moment
    return true;
  }
  if (type === 'MalwareAnalysis') {
    // TODO Dispatch only if user is part of the same organization
    const malwareObj = node as unknown as MalwareAnalysis;
    const userFromMalwareObj = await loadUserBy({ id: malwareObj.user_id });
    return (
      user.selected_organization_id ===
      userFromMalwareObj.selected_organization_id
    );
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
  const types = [
    'Service',
    'RolePortal',
    'Subscription',
    'Service_Price',
    'Service_Link',
    'User_Service',
    'Service_Capability',
    'MalwareAnalysis',
    'Organization',
    'ActionTracking',
    'Document',
    'User_Organization',
  ];
  // If user is admin, user has no access restriction
  if (unsecured || isUserGranted(context?.user, CAPABILITY_BYPASS)) {
    return queryContext;
  }
  // Standard user can access to all users from its own organization
  if (type === 'User') {
    return queryContext;
  }
  // Standard user can access only its own organization
  //if (type === 'Organization') {
  //  queryContext.rightJoin(
  //    'User as security',
  //    'security.organization_id',
  //    '=',
  //    'Organization.id'
  //  );
  //  return queryContext;
  //}
  // Standard user can access all services
  if (types.includes(type)) {
    return queryContext;
  }

  throw new Error('Security behavior must be defined for type ' + type);
};
