import { AuthenticationClient, ManagementClient } from 'auth0';
import config from 'config';
import { Auth0Client, Auth0UpdateUser } from './type';

export class Auth0ClientImplementation implements Auth0Client {
  private managementClient: ManagementClient;
  private authenticationClient: AuthenticationClient;
  private static instance: Auth0ClientImplementation;

  private constructor() {
    this.managementClient = new ManagementClient({
      domain: config.get<string>('auth0.domain') ?? '',
      clientId: config.get<string>('auth0.client_id') ?? '',
      clientSecret: config.get<string>('auth0.client_secret') ?? '',
    });

    this.authenticationClient = new AuthenticationClient({
      domain: config.get<string>('auth0.domain') ?? '',
      clientId: config.get<string>('auth0.client_id') ?? '',
      clientSecret: config.get<string>('auth0.client_secret') ?? '',
    });
  }

  public static getInstance(): Auth0ClientImplementation {
    if (!this.instance) {
      this.instance = new Auth0ClientImplementation();
    }

    return this.instance;
  }

  public async updateUser(user: Auth0UpdateUser) {
    const users_response = await this.managementClient.usersByEmail.getByEmail({
      email: user.email,
    });
    const auth0_user = users_response.data[0];
    if (!auth0_user) {
      throw new Error('AUTH0_USER_NOT_FOUND');
    }

    await this.managementClient.users.update(
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

  public async resetPassword(email: string): Promise<void> {
    await this.authenticationClient.database.changePassword({
      email,
      connection: 'Username-Password-Authentication',
    });
  }
}
