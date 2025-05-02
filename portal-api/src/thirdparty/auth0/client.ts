import { ManagementClient } from 'auth0';
import config from 'config';
import { Auth0Management, Auth0UpdateUser } from './type';

export class Auth0ManagementClient implements Auth0Management {
  private client: ManagementClient;
  private static instance: Auth0ManagementClient;

  private constructor() {
    this.client = new ManagementClient({
      domain: config.get<string>('auth0.domain') ?? '',
      clientId: config.get<string>('auth0.client_id') ?? '',
      clientSecret: config.get<string>('auth0.client_secret') ?? '',
    });
  }

  public static getInstance(): Auth0ManagementClient {
    if (!this.instance) {
      this.instance = new Auth0ManagementClient();
    }

    return this.instance;
  }

  public async updateUser(user: Auth0UpdateUser) {
    const users_response = await this.client.usersByEmail.getByEmail({
      email: user.email,
    });
    const auth0_user = users_response.data[0];
    if (!auth0_user) {
      throw new Error('AUTH0_USER_NOT_FOUND');
    }

    await this.client.users.update(
      { id: auth0_user.user_id },
      {
        given_name: user.first_name,
        last_name: user.last_name,
        user_metadata: {
          country: user.country,
        },
        picture: user.picture,
      }
    );
  }
}
