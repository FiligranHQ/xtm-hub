import config from 'config';
import { requestContext } from '../../../context/request.context';
import { PortalContext } from '../../../model/portal-context';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import { validatePassword } from '../../utils/user';

export const SYSTEM_TOKEN_HEADER = 'x-xtm-hub-token';
export const SYSTEM_TOKEN_HASH = config.get<string>('system_token_hash');
export const SYSTEM_TOKEN_SALT = config.get<string>('system_token_salt');
export const SYSTEM_TOKEN_DIRECTIVE_NAME = 'system_token';

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

export const createSystemTokenResolver = (originalResolve) => {
  return async function secureResolver(
    source,
    args,
    portalContext: PortalContext,
    info
  ) {
    const hasValidToken = validateSystemToken(portalContext);

    if (!hasValidToken) {
      throw new Error('Valid system token is required for this operation');
    }

    const enhancedContext: PortalContext = {
      ...portalContext,
      user: SYSTEM_USER_CONTEXT.user,
    };
    requestContext.update({
      user: SYSTEM_USER_CONTEXT.user,
      portalContext: enhancedContext,
    });

    return originalResolve(source, args, enhancedContext, info);
  };
};
