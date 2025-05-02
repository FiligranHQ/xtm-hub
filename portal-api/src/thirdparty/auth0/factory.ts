import { Auth0ClientImplementation } from './client';
import { Auth0ClientMock } from './mock';
import { Auth0Client } from './type';

export const getAuth0Client = (): Auth0Client => {
  if (process.env.NODE_ENV === 'test') {
    return new Auth0ClientMock();
  }

  return Auth0ClientImplementation.getInstance();
};
