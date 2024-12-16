import passport from 'passport';
import { addOIDCStrategy } from './oidc';

addOIDCStrategy(passport);

export default passport;
