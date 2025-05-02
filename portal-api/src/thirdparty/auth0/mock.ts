import { Auth0Client, Auth0UpdateUser } from './type';

export class Auth0ClientMock implements Auth0Client {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(user: Auth0UpdateUser): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetPassword(email: string): Promise<void> {
    return Promise.resolve();
  }
}
