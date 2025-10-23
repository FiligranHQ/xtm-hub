import { PortalContext } from '../../model/portal-context';
import { getCapabilities } from '../../modules/users/users.domain';
import { ForbiddenAccess } from '../../utils/error/error.util';
import { AuthFn, RoleFn, ServiceFn } from './directive.model';

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
      user.capabilities = await getCapabilities(undefined, user.id, {
        unsecured: true,
      });
    }

    // Authentication check
    if (authDirective && !isAuthenticatedFn(user)) {
      throw ForbiddenAccess('Not authorized: You are not authenticated');
    }

    // Authorization check
    if (authDirective) {
      const capabilitiesRequired = authDirective.requires || [];
      if (!hasCapabilityFn(user, capabilitiesRequired)) {
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
