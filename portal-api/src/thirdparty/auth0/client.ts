import { ManagementClient } from 'auth0';
import config from 'config';
import { Auth0Management, Auth0UpdateUserPayload } from './type';

export class Auth0ManagementClient implements Auth0Management {
  private client: ManagementClient;

  public constructor() {
    this.client = new ManagementClient({
      domain: config.get<string>('auth0.domain') ?? '',
      clientId: config.get<string>('auth0.client_id') ?? '',
      clientSecret: config.get<string>('auth0.client_secret') ?? '',
    });
  }

  public async updateUserWithoutPassword(
    id: string,
    payload: Auth0UpdateUserPayload
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = payload;
    return this.updateUser(id, user);
  }

  public async updateUser(id: string, user: Auth0UpdateUserPayload) {
    await this.client.users.update(
      { id },
      {
        given_name: user.first_name,
        last_name: user.last_name,
        user_metadata: {
          country: user.country,
        },
        picture: user.picture,
        password: user.password,
      }
    );
  }
}
