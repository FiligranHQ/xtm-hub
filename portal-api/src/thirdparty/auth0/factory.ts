import config from 'config';
import { Auth0ClientImplementation } from './client';
import { Auth0ClientMock } from './mock';
import { Auth0Client } from './type';

export const getAuth0Client = (): Auth0Client => {
  if (config.get<boolean>('auth0.mock')) {
    return new Auth0ClientMock();
  }

  return Auth0ClientImplementation.getInstance();
};
