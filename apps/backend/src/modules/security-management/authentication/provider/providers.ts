import passport from 'passport';
import { addOIDCStrategy } from './oidc';

export const initProviders = async (): Promise<passport.PassportStatic> => {
  await addOIDCStrategy(passport);
  return passport;
};
