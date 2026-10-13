import { XTM_PLATFORM_TRIAL_PATH } from '@/utils/path/constant';
import { registeredPlatformDetailPath } from '@/utils/path/registered-platform-detail-path';
import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

const SERVICE_INSTANCE_ID = 'service-instance-1';
const BUNDLE_DEPLOYMENT_REQUEST_ID = 'bundle-deployment-request-1';

describe('registeredPlatformDetailPath', () => {
  it.each([
    {
      description: 'it has a service instance',
      serviceInstanceId: SERVICE_INSTANCE_ID,
    },
    {
      description: 'it has no service instance',
      serviceInstanceId: null,
    },
  ])(
    'should return the XTM Platform trial path when the platform is a bundle product and $description',
    ({ serviceInstanceId }) => {
      // Given
      const input = {
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        deploymentRequest: { parent_id: BUNDLE_DEPLOYMENT_REQUEST_ID },
        serviceInstanceId,
      };

      // When
      const path = registeredPlatformDetailPath(input);

      // Then
      expect(path).toBe(XTM_PLATFORM_TRIAL_PATH);
    }
  );

  it.each([
    {
      description: 'an OpenCTI platform without deployment request',
      identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      deploymentRequest: null,
      expectedPath: `/app/service/opencti_registration/${SERVICE_INSTANCE_ID}`,
    },
    {
      description: 'an OpenAEV platform whose deployment request has no parent',
      identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
      deploymentRequest: { parent_id: null },
      expectedPath: `/app/service/openaev_registration/${SERVICE_INSTANCE_ID}`,
    },
  ])(
    'should return the service instance page when the platform is $description',
    ({ identifier, deploymentRequest, expectedPath }) => {
      // Given
      const input = {
        identifier,
        deploymentRequest,
        serviceInstanceId: SERVICE_INSTANCE_ID,
      };

      // When
      const path = registeredPlatformDetailPath(input);

      // Then
      expect(path).toBe(expectedPath);
    }
  );

  it('should return undefined when the platform is not a bundle product and has no service instance', () => {
    // Given
    const input = {
      identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      deploymentRequest: null,
      serviceInstanceId: null,
    };

    // When
    const path = registeredPlatformDetailPath(input);

    // Then
    expect(path).toBeUndefined();
  });
});
