import config from 'config';
import { PortalCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { CapabilityPortalId } from '../../../model/kanel/public/CapabilityPortal';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import { validatePassword } from '../../util/user';

export const SYSTEM_TOKEN_HEADER = 'x-xtm-hub-token';
export const SYSTEM_TOKEN_HASH = config.get<string>('system_token_hash');
export const SYSTEM_TOKEN_SALT = config.get<string>('system_token_salt');
export const SYSTEM_TOKEN_DIRECTIVE_NAME = 'system_token';

export type SystemTokenDirectiveArgs = {
  portalCapa?: PortalCapability[];
};

const buildScopedSystemUser = (
  requiredCapabilities: PortalCapability[] = []
): UserLoadUserBy => {
  const scopedPortalCapabilities = requiredCapabilities.map((name) => ({
    id: `system-token-${name}` as CapabilityPortalId,
    name,
  }));

  return {
    ...SYSTEM_USER_CONTEXT.user,
    capabilities: scopedPortalCapabilities,
    selected_org_capabilities: [],
    organization_capabilities: [],
  } as UserLoadUserBy;
};

export const extractSystemToken = (context: PortalContext): string | null => {
  return (context.req?.headers?.[SYSTEM_TOKEN_HEADER] as string) || null;
};

export const isValidSystemToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  return validatePassword(SYSTEM_TOKEN_SALT, token, SYSTEM_TOKEN_HASH);
};

export const validateSystemToken = (context: PortalContext): boolean => {
  const token = extractSystemToken(context);
  const isValid = isValidSystemToken(token);

  if (!isValid) {
    throw ForbiddenAccess('Invalid system token attempt');
  }

  return isValid;
};

export const createSystemTokenResolver = (
  originalResolve,
  directiveArgs: SystemTokenDirectiveArgs = {}
) => {
  return async function secureResolver(
    source,
    args,
    portalContext: PortalContext,
    info
  ) {
    validateSystemToken(portalContext);

    const scopedSystemUser = buildScopedSystemUser(
      directiveArgs.portalCapa ?? []
    );

    const enhancedContext: PortalContext = {
      ...portalContext,
      user: scopedSystemUser,
    };
    requestContext.update({
      user: scopedSystemUser,
      portalContext: enhancedContext,
    });

    return originalResolve(source, args, enhancedContext, info);
  };
};
