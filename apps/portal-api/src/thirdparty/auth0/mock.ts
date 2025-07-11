import { Auth0Client, Auth0UpdateUser } from './client';

export const auth0ClientMock: Auth0Client = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(user: Auth0UpdateUser): Promise<void> {
    return Promise.resolve();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetPassword(email: string): Promise<void> {
    return Promise.resolve();
  },
};
