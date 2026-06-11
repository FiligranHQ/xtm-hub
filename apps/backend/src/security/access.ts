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

import { AuthHelper } from '../modules/security-management/capability/auth.helper';
import { ErrorCode, UnknownErrorCode } from '../utils/error/error.code';

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
    (!requiredCapability ||
      AuthHelper.isUserAllowed({
        userCapabilities: user.capabilities,
        organizationCapabilities: user.selected_org_capabilities,
        requiredCapability: requiredCapability,
      }))
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
    data: { [action in ActionType]: TypedNode };
    type: string;
    topic: string;
  }) => boolean;

  const mapping: Partial<Record<AccessibleTopics, AccessibilityChecker>> = {
    User: userSSESecurity,
    MeUser: meUserSSESecurity,
    UserPending: userPendingSSESecurity,
  };
  const node = Object.values(data)[0];
  if (!node) {
    throw new Error(UnknownErrorCode.UnknownError);
  }
  const type = node.__typename;

  const selectedFunction =
    mapping[topic as AccessibleTopics] || applySSESecurity;
  if (!selectedFunction) {
    throw new Error(`Security behavior must be defined for type ${type}`);
  }
  return selectedFunction({ user, data, type, topic });
};
