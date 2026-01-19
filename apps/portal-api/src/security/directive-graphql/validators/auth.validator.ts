import { UserLoadUserBy } from '../../../model/user';
import { userHasBypassCapability } from '../../auth.helper';

export const AUTH_DIRECTIVE_NAME = 'auth';

/**
 * Checks if a user is authenticated
 */
export const isAuthenticated = (user: UserLoadUserBy): boolean => {
  return !!user;
};

/**
 * Checks if a user has the required capabilities
 */
export const hasCapability = (
  user: UserLoadUserBy,
  capabilitiesRequired: string[]
): boolean => {
  // Admin bypass
  if (userHasBypassCapability(user)) {
    return true;
  }

  //TODO rework this function to seperate capability concern
  // https://github.com/FiligranHQ/xtm-hub/issues/1503
  if (
    user.capabilities.some((capability) =>
      capabilitiesRequired.includes(capability.name)
    )
  ) {
    return true;
  }

  // Allow if user is active and no specific capabilities required
  if (!user.disabled && capabilitiesRequired.length === 0) {
    return true;
  }

  // Check if user has at least one required capability
  const userCapabilities = user.selected_org_capabilities ?? [];
  return userCapabilities.some((capability) =>
    capabilitiesRequired.includes(capability)
  );
};
