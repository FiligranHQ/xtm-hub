import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { OrganizationDomain } from '../../../modules/organization-management/organization/organization.domain';
import { PlatformConfigurationDomain } from '../../../modules/registration/platform-configuration/platform-configuration.domain';
import {
  extractPlatformId,
  extractPlatformToken,
  validateAndGetRequestedPlatformToken,
  validateExistsToken,
} from '../../../modules/security-management/token/platform-token.util';
import { PLATFORM_USER_EMAIL, PLATFORM_USER_UUID } from '../../../portal.const';

export {
  extractPlatformId,
  extractPlatformToken,
  PLATFORM_ID_HEADER,
  PLATFORM_TOKEN_HEADER,
  validateActivePlatformToken,
  validateAndGetRequestedPlatformToken,
  validateExistsToken,
} from '../../../modules/security-management/token/platform-token.util';
export const PLATFORM_TOKEN_DIRECTIVE_NAME = 'platform_token';

const loadOrganizationFromPlatformIdAndTokenHeaders = async (
  req: express.Request
) => {
  if (!validateExistsToken(req)) {
    throw new Error('Invalid platform token provided');
  }

  const deploymentRequest = await validateAndGetRequestedPlatformToken(req);
  if (deploymentRequest) {
    return OrganizationDomain.loadOrganizationBy({
      id: deploymentRequest.organization_requester_id,
    });
  }

  const platformConfiguration =
    await PlatformConfigurationDomain.loadConfigurationByPlatformAndToken({
      platform_id: extractPlatformId(req),
      token: extractPlatformToken(req),
    });
  if (platformConfiguration) {
    return OrganizationDomain.loadOrganizationSubscribedToServiceInstance(
      platformConfiguration.service_instance_id
    );
  }

  throw new Error('Invalid token provided');
};

export const createPlatformTokenResolver = (originalResolve) => {
  return async function secureResolver(
    source,
    args,
    portalContext: PortalContext,
    info
  ) {
    const organization = await loadOrganizationFromPlatformIdAndTokenHeaders(
      portalContext.req
    );

    const platformUser = {
      id: PLATFORM_USER_UUID,
      email: PLATFORM_USER_EMAIL,
      selected_organization_id: organization.id,
      organizations: [organization],
      capabilities: [],
      roles_portal: [],
      organization_capabilities: [
        {
          id: uuidv4(),
          organization: organization,
          capabilities: [OrganizationCapability.ManagePlatformRegistration],
        },
      ],
      selected_org_capabilities: [
        OrganizationCapability.ManagePlatformRegistration,
      ],
    } as UserLoadUserBy;

    // If token is valid, override context with system user
    const enhancedContext: PortalContext = {
      ...portalContext,
      user: platformUser,
    };
    requestContext.update({
      user: platformUser,
    });

    return originalResolve(source, args, enhancedContext, info);
  };
};
