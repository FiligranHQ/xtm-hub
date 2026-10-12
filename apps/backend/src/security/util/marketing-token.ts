import config from 'config';
import { Request } from 'express';
import { validatePassword } from './user';

// Token for marketing tooling (e.g. HubSpot), kept apart from the system token so it only opens
// what marketing needs and can be rotated on its own.
export const MARKETING_TOKEN_HEADER = 'x-xtm-hub-marketing-token';
// Empty by default: only development/test config ship a known dev token, every other environment
// must set MARKETING_TOKEN_HASH / MARKETING_TOKEN_SALT.
const MARKETING_TOKEN_HASH = config.get<string>('marketing_token_hash');
const MARKETING_TOKEN_SALT = config.get<string>('marketing_token_salt');

export const isValidMarketingToken = (req: Request): boolean => {
  const token = req.header(MARKETING_TOKEN_HEADER);
  // Fail closed when the environment has not configured the token.
  if (!token || !MARKETING_TOKEN_HASH || !MARKETING_TOKEN_SALT) {
    return false;
  }
  return validatePassword(MARKETING_TOKEN_SALT, token, MARKETING_TOKEN_HASH);
};
