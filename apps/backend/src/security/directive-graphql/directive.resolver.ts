import { PortalContext } from '../../model/portal-context';
import { UserDomain } from '../../modules/organization-management/user/user-domain/user.domain';
import {
  ForbiddenAccess,
  UnauthenticatedAccess,
} from '../../utils/error/error.util';
import { AuthFn, RoleFn, RoleType, ServiceFn } from './directive.model';

/**
 * Creates a field resolver with authentication and authorization checks
 */
export const createSecureFieldResolver = (
  originalResolve,
  context: {
    isAuthenticatedFn: AuthFn;
    hasCapabilityFn: RoleFn;
    hasServiceCapabilityFn: ServiceFn;
    authDirective?;
    serviceCapaDirective?;
  }
) => {
  return async function secureResolver(
    source,
    args,
    portalContext: PortalContext,
    info
  ) {
    const { user } = portalContext;
    const {
      isAuthenticatedFn,
      hasCapabilityFn,
      hasServiceCapabilityFn,
      authDirective,
      serviceCapaDirective,
    } = context;

    // Load user capabilities if not already loaded
    if (user && !user.capabilities) {
      user.capabilities = await UserDomain.getCapabilities(user.id);
    }

    // Authentication check
    if (authDirective && !isAuthenticatedFn(user)) {
      throw UnauthenticatedAccess('Not authorized: You are not authenticated');
    }

    if (authDirective && serviceCapaDirective) {
      const portalCapabilitiesRequired = authDirective.portalCapa || [];
      const orgaCapabilitiesRequired = authDirective.orgaCapa || [];
      const hasRoleCapability = hasCapabilityFn(user, {
        [RoleType.PORTAL]: portalCapabilitiesRequired,
        [RoleType.ORGA]: orgaCapabilitiesRequired,
      });
      const serviceCapabilitiesRequired = serviceCapaDirective.requires || [];
      const hasServiceCapability = await hasServiceCapabilityFn(
        user,
        args,
        serviceCapabilitiesRequired
      );

      if (!hasRoleCapability && !hasServiceCapability) {
        throw ForbiddenAccess(
          'Not authorized: The provided role does not meet schema requirements and you do not have access to this service'
        );
      }

      return originalResolve(source, args, portalContext, info);
    }

    // Authorization check
    if (authDirective) {
      const portalCapabilitiesRequired = authDirective.portalCapa || [];
      const orgaCapabilitiesRequired = authDirective.orgaCapa || [];
      if (
        !hasCapabilityFn(user, {
          [RoleType.PORTAL]: portalCapabilitiesRequired,
          [RoleType.ORGA]: orgaCapabilitiesRequired,
        })
      ) {
        throw ForbiddenAccess(
          'Not authorized: The provided role does not meet schema requirements'
        );
      }
    }

    // Service capability check
    if (serviceCapaDirective) {
      const serviceCapabilitiesRequired = serviceCapaDirective.requires || [];
      const hasCapability = await hasServiceCapabilityFn(
        user,
        args,
        serviceCapabilitiesRequired
      );

      if (!hasCapability) {
        throw ForbiddenAccess(
          "Not authorized: You don't have access to this service"
        );
      }
    }

    // Execute original resolver
    return originalResolve(source, args, portalContext, info);
  };
};
