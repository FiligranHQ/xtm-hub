import config from 'config';
import { Request } from 'express';
import { validatePassword } from './user';

// Token for marketing tooling (e.g. HubSpot), kept apart from the system token so it only opens
// what marketing needs and can be rotated on its own.
export const MARKETING_TOKEN_HEADER = 'x-xtm-hub-marketing-token';
const MARKETING_TOKEN_HASH = config.get<string>('marketing_token_hash');
const MARKETING_TOKEN_SALT = config.get<string>('marketing_token_salt');

export const isValidMarketingToken = (req: Request): boolean => {
  const token = req.header(MARKETING_TOKEN_HEADER);
  if (!token) {
    return false;
  }
  return validatePassword(MARKETING_TOKEN_SALT, token, MARKETING_TOKEN_HASH);
};
