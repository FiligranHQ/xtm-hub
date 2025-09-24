import {
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../__generated__/resolvers-types';
import { OrganizationId } from '../model/kanel/public/Organization';
import { PortalContext } from '../model/portal-context';
import {
  organizationCapabilityMappedByPlatformIdentifier,
  platformIdentifierMappedByServiceDefinitionIdentifier,
} from '../modules/services/registration/registration.mapping';
import { ErrorCode } from '../utils/error/error.code';
import { ForbiddenAccess } from '../utils/error/error.util';
import { isUserAllowedOnOrganization } from './auth.helper';

export const securityGuard = {
  assertUserIsAllowedOnOrganization: async (
    context: PortalContext,
    {
      organizationId,
      requiredCapability,
    }: {
      organizationId: OrganizationId;
      requiredCapability: OrganizationCapability;
    }
  ) => {
    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      context,
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
    context: PortalContext,
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
      throw ForbiddenAccess('PLATFORM_TYPE_NOT_SUPPORTED');
    }

    // Check specific capabilities based on platform type
    const platformIdentifier =
      platformIdentifierMappedByServiceDefinitionIdentifier[
        serviceDefinition.identifier as ServiceDefinitionIdentifier
      ];

    if (platformIdentifier) {
      const requiredCapability =
        organizationCapabilityMappedByPlatformIdentifier[platformIdentifier];
      await securityGuard.assertUserIsAllowedOnOrganization(context, {
        organizationId: context.user.selected_organization_id,
        requiredCapability,
      });
    }
  },
};
