import { logApp } from '@xtm-hub/logger';
import { auth0ClientImplementation } from './implementation';
import { auth0ClientMock } from './mock';

export interface Auth0UpdateUser {
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  country?: string;
}

export interface Auth0Client {
  updateUser(user: Auth0UpdateUser): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

const isAuth0Enabled = !(
  process.env.VITEST_MODE || process.env.NODE_ENV === 'test'
);
if (!isAuth0Enabled) {
  logApp.warn('auth0 disabled, using client mock');
}

export const auth0Client: Auth0Client = isAuth0Enabled
  ? auth0ClientImplementation
  : auth0ClientMock;
