import { Auth0Management, Auth0UpdateUserPayload } from './type';

export class Auth0ManagementMock implements Auth0Management {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(_id: string, user: Auth0UpdateUserPayload): Promise<void> {
    return Promise.resolve();
  }

  updateUserWithoutPassword(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: Auth0UpdateUserPayload
  ): Promise<void> {
    return Promise.resolve();
  }
}
