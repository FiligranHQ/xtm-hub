import { AuthenticationClient, ManagementClient } from 'auth0';
import config from 'config';
import { Auth0Client, Auth0UpdateUser } from './client';

const CONNECTION_TYPE = 'Username-Password-Authentication';

interface ClientConfiguration {
  domain: string;
  clientId: string;
  clientSecret: string;
}

const clientConfiguration: ClientConfiguration = {
  domain: config.get('auth0.config.domain'),
  clientId: config.get('oidc_provider.client_id'),
  clientSecret: config.get('oidc_provider.client_secret'),
};

const managementClient = new ManagementClient(clientConfiguration);
const authenticationClient = new AuthenticationClient(clientConfiguration);

export const auth0ClientImplementation: Auth0Client = {
  updateUser: async (user: Auth0UpdateUser): Promise<void> => {
    const users_response = await managementClient.usersByEmail.getByEmail({
      email: user.email,
    });
    const auth0_user = users_response.data[0];
    if (!auth0_user) {
      throw new Error('AUTH0_USER_NOT_FOUND_ERROR');
    }

    await managementClient.users.update(
      { id: auth0_user.user_id },
      {
        given_name: user.first_name,
        family_name: user.last_name,
        user_metadata: {
          country: user.country,
        },
        picture: user.picture,
      }
    );
  },
  resetPassword: async (email: string): Promise<void> => {
    await authenticationClient.database.changePassword({
      email,
      connection: CONNECTION_TYPE,
    });
  },
};
