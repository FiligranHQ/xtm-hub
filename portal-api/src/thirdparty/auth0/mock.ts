import { Auth0Management, Auth0UpdateUser } from './type';

export class Auth0ManagementMock implements Auth0Management {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(user: Auth0UpdateUser): Promise<void> {
    return Promise.resolve();
  }
}
