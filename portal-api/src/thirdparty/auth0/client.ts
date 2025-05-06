import config from 'config';
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

export const auth0Client: Auth0Client = config.get<boolean>('auth0.mock')
  ? auth0ClientMock
  : auth0ClientImplementation;
