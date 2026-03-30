import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { ServiceConfigurationStatus } from '../../../__generated__/resolvers-types';
import DeploymentRequest from '../../../model/kanel/public/DeploymentRequest';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import { ServiceContractDomain } from '../../../modules/services/contract/service-configuration.domain';
import { DeploymentRequestDomain } from '../../../modules/services/deployments/deployments.domain';
import {
  PLATFORM_ID_HEADER,
  PLATFORM_TOKEN_HEADER,
  validateActivePlatformToken,
  validateAndGetRequestedPlatformToken,
} from './platform-token-validator';

describe('Platform Token Validation', () => {
  describe('validateActivePlatformToken', () => {
    it('should return false when platform token header is missing', async () => {
      const req: express.Request = {
        headers: {},
      } as unknown as express.Request;

      const result = await validateActivePlatformToken(req);

      expect(result).toBe(false);
    });

    it('should return false when platform id header is missing', async () => {
      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: 'anything',
        },
      } as unknown as express.Request;

      const result = await validateActivePlatformToken(req);

      expect(result).toBe(false);
    });
    it('should return false when headers are valid but no matching platform found', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();
      vi.spyOn(
        ServiceContractDomain,
        'loadConfigurationByPlatformAndToken'
      ).mockResolvedValue(undefined);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateActivePlatformToken(req);

      expect(result).toBe(false);
    });
    it('should return false when platform is found but inactive', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();
      vi.spyOn(
        ServiceContractDomain,
        'loadConfigurationByPlatformAndToken'
      ).mockResolvedValue({
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Inactive,
      } as unknown as ServiceConfiguration);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateActivePlatformToken(req);

      expect(result).toBe(false);
    });
    it('should return true when valid header for registered platform are provided', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();
      vi.spyOn(
        ServiceContractDomain,
        'loadConfigurationByPlatformAndToken'
      ).mockResolvedValue({
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Active,
      } as unknown as ServiceConfiguration);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateActivePlatformToken(req);

      expect(result).toBe(true);
    });
  });
  describe('validateAndGetRequestedPlatformToken', () => {
    it('should return null when headers are missing', async () => {
      const req: express.Request = {
        headers: {},
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });

    it('should return null when platform id header is missing', async () => {
      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: 'anything',
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });

    it('should return null when platform token header is missing', async () => {
      const req: express.Request = {
        headers: {
          [PLATFORM_ID_HEADER]: 'anything',
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });

    it('should return true when valid header for requested are provided', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();

      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue({
        platform_id: platformId,
      } as DeploymentRequest);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBeTruthy();
    });

    it('should return null when platform id header provided is unknown', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();

      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue(undefined);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });

    it('should return null when platform id header provided is not matching token', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();

      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue({
        platform_id: uuidv4(),
      } as DeploymentRequest);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });

    it('should return null when deployment request has no platform_id yet', async () => {
      const platformId = uuidv4();
      const platformToken = uuidv4();

      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue({
        platform_id: null,
      } as DeploymentRequest);

      const req: express.Request = {
        headers: {
          [PLATFORM_TOKEN_HEADER]: platformToken,
          [PLATFORM_ID_HEADER]: platformId,
        },
      } as unknown as express.Request;

      const result = await validateAndGetRequestedPlatformToken(req);

      expect(result).toBe(null);
    });
  });
});
