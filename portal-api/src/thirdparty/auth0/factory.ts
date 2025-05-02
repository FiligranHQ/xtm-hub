import { Auth0ManagementClient } from './client';
import { Auth0ManagementMock } from './mock';
import { Auth0Management } from './type';

export const getAuth0Management = (): Auth0Management => {
  if (process.env.NODE_ENV === 'test') {
    return new Auth0ManagementMock();
  }

  return Auth0ManagementClient.getInstance();
};
