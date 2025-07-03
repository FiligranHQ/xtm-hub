import { Knex } from 'knex';
import {
  ActionType,
  DatabaseType,
  KnexQueryBuilder,
  MethodType,
  QueryOpts,
  SecuryQueryOpts,
} from '../../knexfile';
import { PortalContext } from '../model/portal-context';
import { CAPABILITY_BYPASS } from '../portal.const';
import { TypedNode } from '../pub';

import { OrganizationCapability } from '../__generated__/resolvers-types';
import { UserLoadUserBy } from '../model/user';
import { setQueryForDocument } from './document-security-access';
import { meUserSSESecurity, userSSESecurity } from './user-security-access';
import { setDeleteSecurityForUserServiceCapability } from './user-service-capability-access';

import { logApp } from '../utils/app-logger.util';
import { userSecurityLayer } from './layer/user';
import { userOrganizationCapabilitySecurityLayer } from './layer/user-organization-capability';
import { userServiceCapabilitySecurityLayer } from './layer/user-service-capability';

export type SecuryQueryHandlers = {
  [key in MethodType]: (
    context: PortalContext,
    qb: KnexQueryBuilder,
    opts?: SecuryQueryOpts
  ) => KnexQueryBuilder | Promise<KnexQueryBuilder>;
};

export const isUserGranted = (
  user?: UserLoadUserBy,
  orgCapabilitities?: OrganizationCapability
) => {
  return (
    !!user &&
    (user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id) ||
      user.selected_org_capabilities?.includes(orgCapabilitities) ||
      user.selected_org_capabilities?.includes(
        OrganizationCapability.AdministrateOrganization
      ))
  );
};

export const isUserAdminPlatform = (user: UserLoadUserBy) =>
  !!user && user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id);
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
  if (isUserGranted(opt.user)) {
    return true;
  }
  return opt.type === opt.topic;
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
  if (unsecured || isUserGranted(context?.user)) {
    return queryContext;
  }

  type AccessibilityChecker = <T>(
    context: PortalContext,
    queryContext: Knex.QueryBuilder<T>
  ) => Knex.QueryBuilder<T>;

  type UpdateAccessibilityChecker = <T>(
    context: PortalContext,
    queryContext: Knex.QueryBuilder<T>,
    opts: QueryOpts
  ) => Knex.QueryBuilder<T>;

  if (opts.methodType === 'update') {
    return queryContext;
  }

  if (opts.methodType === 'del') {
    const updateMapping: Partial<
      Record<DatabaseType, UpdateAccessibilityChecker>
    > = {
      UserService_Capability: setDeleteSecurityForUserServiceCapability,
    };
    const selectedFunction = updateMapping[type] || setQuery;
    if (!selectedFunction) {
      throw new Error(`Security behavior must be defined for type ${type}`);
    }
    return selectedFunction(context, queryContext, opts);
  }

  const queryMapping: Partial<Record<DatabaseType, AccessibilityChecker>> = {
    Document: setQueryForDocument,
  };
  const selectedFunction = queryMapping[type] || setQuery;
  if (!selectedFunction) {
    throw new Error(`Security behavior must be defined for type ${type}`);
  }
  return selectedFunction(context, queryContext);
};

export const applyDbSecurityLayer = async (
  qb: KnexQueryBuilder,
  opts: SecuryQueryOpts
) => {
  const table = qb._queryContext.__typename;
  const context = qb._queryContext.context;
  const method = qb.toSQL().method;

  // First check if we have a valid table type
  if (!table) {
    logApp.error(`No table specified in query: ${qb}`);
    return qb;
  }

  // Define table-specific security handlers
  const tableSecurityMap: Partial<Record<DatabaseType, SecuryQueryHandlers>> = {
    User: userSecurityLayer,
    UserService_Capability: userServiceCapabilitySecurityLayer,
    UserOrganization_Capability: userOrganizationCapabilitySecurityLayer,
  };

  if (tableSecurityMap[table]) {
    if (method && tableSecurityMap[table][method]) {
      // We could perform the verification earlier, but I want to be able to check everything in development.
      // By default, we're in ADMIN_PLTFM in dev, so this helps ensure the security is properly implemented.
      if (isUserAdminPlatform(context.user)) {
        return qb;
      }
      if (method === 'select') {
        return tableSecurityMap[table][method](context, qb, opts);
      }
      // Check the promise and then if it not throwing error we return qb.
      // QB in promise execute automatically the query but we don't always want to execute the query at this moment
      await tableSecurityMap[table][method](context, qb, opts);
      return qb;
    } else {
      logApp.warn(`No ${method} security handler for ${table}`);
    }
  } else {
    logApp.warn(`No security handlers defined for table: ${table}`);
  }

  return qb;
};
