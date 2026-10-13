import { describe, expect, it, vi } from 'vitest';
import { DeploymentRequestId } from '../../model/kanel/public/DeploymentRequest';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { DeploymentRequestDataLoader } from './deployment.dataloader';
import {
  DeploymentRequestDomain,
  FullyQualifiedDeploymentRequest,
} from './deployment.domain';

const FIRST_BUNDLE_ID = 'bundle-1' as DeploymentRequestId;
const SECOND_BUNDLE_ID = 'bundle-2' as DeploymentRequestId;
const CHILDLESS_BUNDLE_ID = 'bundle-3' as DeploymentRequestId;
const FIRST_SERVICE_INSTANCE_ID = 'service-instance-1' as ServiceInstanceId;
const SECOND_SERVICE_INSTANCE_ID = 'service-instance-2' as ServiceInstanceId;
const UNKNOWN_SERVICE_INSTANCE_ID = 'service-instance-3' as ServiceInstanceId;

const makeChild = (id: string, parentId: DeploymentRequestId) =>
  ({
    id: id as DeploymentRequestId,
    parent_id: parentId,
  }) as FullyQualifiedDeploymentRequest;

const makeRequest = (id: string, serviceInstanceId: ServiceInstanceId) =>
  ({
    id: id as DeploymentRequestId,
    service_instance_id: serviceInstanceId,
  }) as FullyQualifiedDeploymentRequest;

describe('deploymentRequestDataLoader', () => {
  describe('batchLoadChildren', () => {
    it('should group the children under their own bundle, following the requested order', async () => {
      // Given
      const firstChild = makeChild('child-1', FIRST_BUNDLE_ID);
      const secondChild = makeChild('child-2', SECOND_BUNDLE_ID);
      const thirdChild = makeChild('child-3', FIRST_BUNDLE_ID);
      vi.spyOn(
        DeploymentRequestDomain,
        'loadChildrenByParentIds'
      ).mockResolvedValue([secondChild, firstChild, thirdChild]);

      // When
      const result = await DeploymentRequestDataLoader.batchLoadChildren([
        CHILDLESS_BUNDLE_ID,
        FIRST_BUNDLE_ID,
        SECOND_BUNDLE_ID,
      ]);

      // Then
      expect(result).toEqual([[], [firstChild, thirdChild], [secondChild]]);
    });
  });

  describe('batchLoadByServiceInstanceIds', () => {
    it('should return the deployment request of each service instance in the requested order, and null when it has none', async () => {
      // Given
      const firstRequest = makeRequest('request-1', FIRST_SERVICE_INSTANCE_ID);
      const secondRequest = makeRequest(
        'request-2',
        SECOND_SERVICE_INSTANCE_ID
      );
      vi.spyOn(
        DeploymentRequestDomain,
        'loadFullDeploymentRequestsByServiceInstanceIds'
      ).mockResolvedValue([secondRequest, firstRequest]);

      // When
      const result =
        await DeploymentRequestDataLoader.batchLoadByServiceInstanceIds([
          UNKNOWN_SERVICE_INSTANCE_ID,
          FIRST_SERVICE_INSTANCE_ID,
          SECOND_SERVICE_INSTANCE_ID,
        ]);

      // Then
      expect(result).toEqual([null, firstRequest, secondRequest]);
    });
  });
});
