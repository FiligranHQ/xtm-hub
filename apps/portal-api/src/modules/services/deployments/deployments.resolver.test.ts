import { describe, expect, it } from 'vitest';
import {
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
} from '../../../__generated__/resolvers-types';
import resolver from './deployments.resolver';

describe('Deployment app', () => {
  describe('createDeploymentRequest', () => {
    it('should return the deployment request created', async () => {
      const deployment = await resolver.Mutation.createDeploymentRequest(
        undefined,
        {
          input: {
            activity_sector: 'cybersecurity',
            job_title: 'myJob',
            use_case: 'use_case',
            platform_identifier: PlatformIdentifier.Opencti,
            region: PlatformRegion.Us,
            type: DeploymentType.Trial,
          },
        }
      );

      expect(deployment.type).toBe(DeploymentType.Trial);
      expect(deployment.platform_identifier).toBe(PlatformIdentifier.Opencti);
      expect(deployment.region).toBe(PlatformRegion.Us);
      expect(deployment.job_title).toBe('myJob');
      expect(deployment.activity_sector).toBe('cybersecurity');
      expect(deployment.use_case).toBe('use_case');
      expect(deployment.status).toBe(DeploymentRequestStatus.Pending);
    });
  });
});
