import {
  ActionType,
  DatabaseType,
  KnexQueryBuilder,
  MethodType,
  SecuryQueryOpts,
} from '../../knexfile';
import { CAPABILITY_BYPASS } from '../portal.const';
import { TypedNode } from '../pub';

import { OrganizationCapability } from '../__generated__/resolvers-types';
import { UserLoadUserBy } from '../model/user';
import {
  meUserSSESecurity,
  userPendingSSESecurity,
  userSSESecurity,
} from './user-security-access';

import { requestContext } from '../context/request.context';
import { logApp } from '../utils/app-logger.util';
import { ErrorCode } from '../utils/error/error.code';
import { isUserAllowed } from './auth.helper';
import { userOrganizationSecurityLayer } from './layer/user-organization';
import { userServiceSecurityLayer } from './layer/user-service';

export type SecuryQueryHandlers = {
  [key in MethodType]: (
    qb: KnexQueryBuilder,
    opts?: SecuryQueryOpts
  ) => KnexQueryBuilder | Promise<KnexQueryBuilder>;
};

export const isUserGranted = (
  user?: UserLoadUserBy,
  requiredCapability?: OrganizationCapability
) => {
  return (
    !!user &&
    isUserAllowed({
      userCapabilities: user.capabilities,
      organizationCapabilities: user.selected_org_capabilities,
      requiredCapability: requiredCapability,
    })
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

export type AccessibleTopics = 'MeUser' | 'UserPending' | DatabaseType;
export const isNodeAccessible = async (
  user: UserLoadUserBy,
  topic: string,
  data: { [action in ActionType]: TypedNode }
) => {
  const isInvalidActionSize = Object.keys(data).length !== 1;
  if (isInvalidActionSize) {
    // Event can only be setup to one action
    throw new Error(ErrorCode.InvalidActionSize, { cause: data });
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
    UserPending: userPendingSSESecurity,
  };
  const node = Object.values(data)[0];
  const type = node.__typename;

  const selectedFunction = mapping[topic] || applySSESecurity;
  if (!selectedFunction) {
    throw new Error(`Security behavior must be defined for type ${type}`);
  }
  return selectedFunction({ user, data, type, topic });
};

export const applyDbSecurityLayer = async (
  qb: KnexQueryBuilder,
  opts: SecuryQueryOpts
) => {
  const table = qb._queryContext.__typename;
  const context = requestContext.require();
  let method = qb.toSQL().method;

  // First check if we have a valid table type
  if (!table) {
    logApp.error(`No table specified in query: ${qb}`);
    return qb;
  }

  // Define table-specific security handlers
  const tableSecurityMap: Partial<Record<DatabaseType, SecuryQueryHandlers>> = {
    User_Organization: userOrganizationSecurityLayer,
    User_Service: userServiceSecurityLayer,
  };

  if (tableSecurityMap[table]) {
    if (method === 'first') {
      method = 'select';
    }
    if (method && tableSecurityMap[table][method]) {
      // DEPRECATION WARNING: Security handler exists and needs to be updated
      logApp.warn(
        `DEPRECATION: Security handler exists for ${table}.${method} - please migrate to new security system`
      );

      // We could perform the verification earlier, but I want to be able to check everything in development.
      // By default, we're in ADMIN_PLTFM in dev, so this helps ensure the security is properly implemented.
      if (isUserAdminPlatform(context.user) || opts?.unsecured) {
        return qb;
      }
      // Check the promise and then if it not throwing error we return qb.
      // QB in promise execute automatically the query but we don't always want to execute the query at this moment
      await tableSecurityMap[table][method](qb, opts);
      return qb;
    }
  }

  return qb;
};
