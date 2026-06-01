import express from 'express';
import { PlatformConfigurationStatus } from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';
import { DeploymentRequestDomain } from '../../deployment/deployment.domain';
import { ServiceConfigurationDomain } from '../../registration/service-configuration/service-configuration.domain';

export const PLATFORM_TOKEN_HEADER = 'xtm-hub-platform-token';
export const PLATFORM_ID_HEADER = 'xtm-hub-platform-id';

export const extractPlatformToken = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_TOKEN_HEADER] as string) || null;
};

export const extractPlatformId = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_ID_HEADER] as string) || null;
};

export const validateExistsToken = (req: express.Request): boolean => {
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

  const platformConfiguration =
    await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
      platform_id: extractPlatformId(req),
      token: extractPlatformToken(req),
    });

  return platformConfiguration?.status === PlatformConfigurationStatus.Active;
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
    deploymentRequest.platform_id !== null &&
    deploymentRequest.platform_id === extractPlatformId(req);
  if (!isValid) {
    logApp.warn(
      '[validatePlatformToken] No registration matching token, or invalid platformId provided'
    );
  }

  return isValid ? deploymentRequest : null;
};
