import { OrganizationCapability } from '../__generated__/resolvers-types';
import { OrganizationId } from '../model/kanel/public/Organization';
import { PortalContext } from '../model/portal-context';
import { ErrorCode } from '../modules/common/error-code';
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
};
