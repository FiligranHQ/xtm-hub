import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  OrganizationCapability,
  ServiceConfigurationStatus,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import {
  loadOrganizationBy,
  organizationDomain,
} from '../../../modules/organizations/organizations.domain';
import { ServiceContractDomain } from '../../../modules/services/contract/service-configuration.domain';
import { DeploymentRequestDomain } from '../../../modules/services/deployments/deployments.domain';
import { PLATFORM_USER_EMAIL, PLATFORM_USER_UUID } from '../../../portal.const';
import { logApp } from '../../../utils/app-logger.util';

export const PLATFORM_TOKEN_HEADER = 'xtm-hub-platform-token';
export const PLATFORM_ID_HEADER = 'xtm-hub-platform-id';
export const PLATFORM_TOKEN_DIRECTIVE_NAME = 'platform_token';

export const extractPlatformToken = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_TOKEN_HEADER] as string) || null;
};

export const extractPlatformId = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_ID_HEADER] as string) || null;
};

const validateExistsToken = (req: express.Request): boolean => {
  const token = extractPlatformToken(req);
  if (!token) {
    logApp.warn('[validatePlatformToken] Missing platformToken header');
    return false;
  }

  const platformId = extractPlatformId(req);
  if (!platformId) {
    logApp.warn('[validatePlatformToken] Missing platformId header');
    return false;
  }
  return true;
};

export const validateActivePlatformToken = async (
  req: express.Request
): Promise<boolean> => {
  if (!validateExistsToken(req)) return false;

  const serviceConfiguration: ServiceConfiguration | null =
    await ServiceContractDomain.loadConfigurationByPlatformAndToken({
      platformId: extractPlatformId(req),
      token: extractPlatformToken(req),
    });

  return serviceConfiguration?.status === ServiceConfigurationStatus.Active;
};

export const validateAndGetRequestedPlatformToken = async (
  req: express.Request
) => {
  if (!validateExistsToken(req)) return null;

  const deploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      platform_token: extractPlatformToken(req),
    });

  const isValid =
    deploymentRequest &&
    (!deploymentRequest.platform_id ||
      deploymentRequest.platform_id == extractPlatformId(req));
  if (!isValid) {
    logApp.warn(
      '[validatePlatformToken] No registration matching token, or invalid platformId provided'
    );
  }

  return isValid ? deploymentRequest : null;
};

const loadOrganizationFromPlatformIdAndTokenHeaders = async (
  req: express.Request
) => {
  if (!validateExistsToken(req)) {
    throw new Error('Invalid platform token provided');
  }

  const deploymentRequest = await validateAndGetRequestedPlatformToken(req);
  if (deploymentRequest) {
    return loadOrganizationBy({
      id: deploymentRequest.organization_requester_id,
    });
  }

  const serviceConfiguration =
    await ServiceContractDomain.loadConfigurationByPlatformAndToken({
      platformId: extractPlatformId(req),
      token: extractPlatformToken(req),
    });
  if (serviceConfiguration) {
    return organizationDomain.loadOrganizationSubscribedToServiceInstance(
      serviceConfiguration.service_instance_id
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
      portalContext: enhancedContext,
    });

    // Execute with original context
    return originalResolve(source, args, portalContext, info);
  };
};
