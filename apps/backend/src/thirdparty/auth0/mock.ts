/* eslint-disable @typescript-eslint/no-unused-vars */

import { OrganizationId } from '../../model/kanel/public/Organization';
import {
  Auth0Client,
  Auth0UpdateUser,
  Auth0UpdateUserRBACInstance,
} from './client';

export const auth0ClientMock: Auth0Client = {
  updateUser(user: Auth0UpdateUser): Promise<void> {
    return Promise.resolve();
  },

  resetPassword(email: string): Promise<void> {
    return Promise.resolve();
  },

  createAudienceAPI(
    organization_name: string,
    platform_id: string
  ): Promise<void> {
    return Promise.resolve();
  },

  deleteAudienceAPI(
    organization_id: OrganizationId,
    platform_id: string
  ): Promise<void> {
    return Promise.resolve();
  },

  updateUserRBACInstance(
    email: string,
    userRBACInstance: Auth0UpdateUserRBACInstance
  ): Promise<void> {
    return Promise.resolve();
  },
};
