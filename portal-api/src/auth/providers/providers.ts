import passport from 'passport/lib/index.js';
import { addOIDCStrategy } from './oidc';

addOIDCStrategy(passport);

export default passport;
