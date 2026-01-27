import { UserLoadUserBy } from '../../../model/user';
import { userHasBypassCapability } from '../../auth.helper';
import { RoleType } from '../directive.model';

export const AUTH_DIRECTIVE_NAME = 'auth';

/**
 * Checks if a user is authenticated
 */
export const isAuthenticated = (user: UserLoadUserBy): boolean => {
  return !!user && !user.disabled;
};

/**
 * Checks if a user has the required capabilities
 */
export const hasCapability = (
  user: UserLoadUserBy,
  capabilitiesRequired: Record<RoleType, string[]>
): boolean => {
  // Admin bypass
  if (userHasBypassCapability(user)) {
    return true;
  }
  const portalCapabilitiesRequired = capabilitiesRequired.PORTAL;
  const orgaCapabilitiesRequired = capabilitiesRequired.ORGA;

  // Allow if user is active and no specific capabilities required
  if (
    portalCapabilitiesRequired.length === 0 &&
    orgaCapabilitiesRequired.length === 0
  ) {
    return true;
  }

  if (
    user.capabilities.some((capability) =>
      portalCapabilitiesRequired.includes(capability.name)
    )
  ) {
    return true;
  }

  // Check if user has at least one required capability
  const userCapabilities = user.selected_org_capabilities ?? [];
  return userCapabilities.some((capability) =>
    orgaCapabilitiesRequired.includes(capability)
  );
};
