import {
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../__generated__/resolvers-types';
import { OrganizationId } from '../model/kanel/public/Organization';
import { ServiceInstanceId } from '../model/kanel/public/ServiceInstance';
import { UserLoadUserBy } from '../model/user';
import { organizationDomain } from '../modules/organizations/organizations.domain';
import { ErrorCode } from '../utils/error/error.code';
import { ForbiddenAccess } from '../utils/error/error.util';
import { isUserAllowedOnOrganization } from './auth.helper';

export const securityGuard = {
  assertUserIsAllowedOnServiceInstance: async (
    user: UserLoadUserBy,
    {
      serviceInstanceId,
      requiredCapability,
    }: {
      serviceInstanceId: ServiceInstanceId;
      requiredCapability: OrganizationCapability;
    }
  ) => {
    const organization =
      await organizationDomain.loadOrganizationSubscribedToServiceInstance(
        serviceInstanceId
      );
    if (!organization) {
      throw new Error(ErrorCode.OrganizationNotFound);
    }
    const { isAllowed } = await isUserAllowedOnOrganization(user, {
      organizationId: organization.id,
      requiredCapability,
    });
    if (!isAllowed) {
      throw new Error(ErrorCode.MissingCapabilityOnOrganization);
    }
  },
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
};
