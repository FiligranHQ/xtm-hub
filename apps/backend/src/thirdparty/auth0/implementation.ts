import { AuthenticationClient, ManagementClient } from 'auth0';
import config from 'config';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { OrganizationDomain } from '../../modules/organization-management/organization/organization.domain';
import { logApp } from '../../utils/app-logger.util';
import { buildUserMetadataUpdate } from './auth0.util';
import {
  Auth0Client,
  Auth0UpdateUser,
  Auth0UpdateUserRBACInstance,
} from './client';

const CONNECTION_TYPE = 'Username-Password-Authentication';

interface ClientConfiguration {
  domain: string;
  clientId: string;
  clientSecret: string;
}

const clientConfiguration: ClientConfiguration = config.get('auth0');

const managementClient = new ManagementClient(clientConfiguration);
const authenticationClient = new AuthenticationClient(clientConfiguration);

export const auth0ClientImplementation: Auth0Client = {
  updateUser: async (user: Auth0UpdateUser): Promise<void> => {
    const auth0_users = await managementClient.users.listUsersByEmail({
      email: user.email,
    });
    if (auth0_users.length === 0) {
      throw new Error('AUTH0_USER_NOT_FOUND_ERROR');
    }

    await Promise.all(
      auth0_users.map((auth0_user) =>
        managementClient.users.update(auth0_user.user_id, {
          given_name: user.first_name,
          family_name: user.last_name,
          user_metadata: {
            country: user.country,
          },
          picture: user.picture,
        })
      )
    );
  },
  updateUserRBACInstance: async (
    email: string,
    userRBACInstance: Auth0UpdateUserRBACInstance
  ): Promise<void> => {
    const auth0_users = await managementClient.users.listUsersByEmail({
      email,
    });
    if (auth0_users.length === 0) {
      throw new Error('AUTH0_USER_NOT_FOUND_ERROR');
    }

    await Promise.all(
      auth0_users.map((auth0_user) =>
        managementClient.users.update(
          auth0_user.user_id,
          buildUserMetadataUpdate(auth0_user, userRBACInstance)
        )
      )
    );
  },
  resetPassword: async (email: string): Promise<void> => {
    await authenticationClient.database.changePassword({
      email,
      connection: CONNECTION_TYPE,
    });
  },
  createAudienceAPI: async (
    organization_name: string,
    platform_id: string
  ): Promise<void> => {
    await managementClient.resourceServers.create({
      name: `${organization_name}_${platform_id}`,
      identifier: platform_id,
      signing_alg: 'RS256',
    });
  },
  deleteAudienceAPI: async (
    organization_id: OrganizationId,
    platform_id: string
  ): Promise<void> => {
    const organization = await OrganizationDomain.loadOrganizationBy({
      id: organization_id,
    });
    logApp.info(
      `Delete API Audience for organization ${organization.name} with platform_id ${platform_id}`
    );
    await managementClient.resourceServers.delete(platform_id);
  },
};
