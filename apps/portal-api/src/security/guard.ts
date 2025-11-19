import { db } from '../../knexfile';
import {
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../__generated__/resolvers-types';
import { requestContext } from '../context/request.context';
import { OrganizationId } from '../model/kanel/public/Organization';
import { UserLoadUserBy } from '../model/user';
import { ErrorCode } from '../utils/error/error.code';
import { BadRequestError, ForbiddenAccess } from '../utils/error/error.util';
import { isUserAllowedOnOrganization } from './auth.helper';

export const securityGuard = {
  assertUserIsAllowedOnOrganization: async (
    user: UserLoadUserBy,
    {
      organizationId,
      requiredCapability,
    }: {
      organizationId: OrganizationId;
      requiredCapability: OrganizationCapability;
    }
  ) => {
    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      user,
      {
        organizationId,
        requiredCapability,
      }
    );

    if (!isAllowed) {
      const errorCode = isInOrganization
        ? ErrorCode.MissingCapabilityOnOrganization
        : ErrorCode.UserIsNotInOrganization;
      throw new Error(errorCode);
    }
  },

  assertUserCanModifyPlatformService: async (
    user: UserLoadUserBy,
    serviceDefinition: { identifier: string }
  ) => {
    // Verify it's an OpenCTI or OpenAEV platform
    const allowedIdentifiers = [
      ServiceDefinitionIdentifier.OpenctiRegistration,
      ServiceDefinitionIdentifier.OpenaevRegistration,
    ];

    if (
      !allowedIdentifiers.includes(
        serviceDefinition.identifier as ServiceDefinitionIdentifier
      )
    ) {
      throw ForbiddenAccess(ErrorCode.PlatformTypeNotSupported);
    }

    await securityGuard.assertUserIsAllowedOnOrganization(user, {
      organizationId: user.selected_organization_id,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });
  },

  assertUserCapabilities: async (
    requiredCapabilities: OrganizationCapability[],
    organizationId?: OrganizationId
  ) => {
    const { user } = requestContext.require();

    const targetOrgId = organizationId || user.selected_organization_id;

    if (!targetOrgId) {
      throw BadRequestError('Organization context required');
    }

    // Check if user has required capabilities in the specific organization
    const userCapabilities = await db('UserOrganization_Capability')
      .select('User_Organization.*')
      .innerJoin(
        'User_Organization',
        'UserOrganization_Capability.user_organization_id',
        'User_Organization.id'
      )
      .where({
        'User_Organization.user_id': user.id,
        'User_Organization.organization_id': targetOrgId,
      })
      .whereIn('UserOrganization_Capability.name', requiredCapabilities)
      .first();

    if (!userCapabilities) {
      throw ForbiddenAccess(ErrorCode.MissingCapabilityOnOrganization);
    }
  },
};
