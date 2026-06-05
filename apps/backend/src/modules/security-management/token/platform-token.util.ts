import express from 'express';
import { PlatformConfigurationStatus } from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';
import { DeploymentRequestDomain } from '../../deployment/deployment.domain';
import { PlatformConfigurationDomain } from '../../registration/platform-configuration/platform-configuration.domain';

export const PLATFORM_TOKEN_HEADER = 'xtm-hub-platform-token';
export const PLATFORM_ID_HEADER = 'xtm-hub-platform-id';

export const extractPlatformToken = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_TOKEN_HEADER] as string) || null;
};

export const extractPlatformId = (req: express.Request): string | null => {
  return (req?.headers?.[PLATFORM_ID_HEADER] as string) || null;
};

export const validateExistsPlatformAndToken = (
  req: express.Request
): boolean => {
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
  if (!validateExistsPlatformAndToken(req)) return false;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const platform_id = extractPlatformId(req)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = extractPlatformToken(req)!;

  const platformConfiguration =
    await PlatformConfigurationDomain.loadConfigurationByPlatformAndToken({
      platform_id,
      token,
    });

  return platformConfiguration?.status === PlatformConfigurationStatus.Active;
};

export const validateAndGetRequestedPlatformToken = async (
  req: express.Request
) => {
  if (!validateExistsPlatformAndToken(req)) return null;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const platform_token = extractPlatformToken(req)!;

  const deploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      platform_token,
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
