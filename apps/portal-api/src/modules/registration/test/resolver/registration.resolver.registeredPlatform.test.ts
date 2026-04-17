import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../../tests/tests.const';
import { RegisteredPlatform } from '../../../../__generated__/resolvers-types';
import DeploymentRequest from '../../../../model/kanel/public/DeploymentRequest';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { DeploymentRequestDomain } from '../../../deployment/deployment.domain';
import * as ServiceInstanceDomain from '../../../service/instance/service-instance.domain';
import registrationResolver from '../../registration.resolver';

vi.mock('../../../deployment/deployment.domain', () => ({
  DeploymentRequestDomain: {
    loadDeploymentRequestBy: vi.fn(),
  },
}));

describe('registeredPlatform type resolvers', () => {
  describe('registeredPlatform.subscription', () => {
    it('should call loadSubscriptionByServiceInstanceAndOrganization with the organization id and instance id from parent', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedSubscription = {
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
      };
      const loadSubscriptionByServiceInstanceAndOrganizationSpy = vi
        .spyOn(
          ServiceInstanceDomain,
          'loadSubscriptionByServiceInstanceAndOrganization'
        )
        .mockResolvedValue(expectedSubscription);

      // When
      const result = await registrationResolver.RegisteredPlatform!
        .subscription!(
        { id: serviceInstanceId } as unknown as RegisteredPlatform,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(
        loadSubscriptionByServiceInstanceAndOrganizationSpy
      ).toHaveBeenCalledWith(
        contextSimpleUserFiligran2.user.selected_organization_id,
        serviceInstanceId
      );
      expect(result).toEqual(expectedSubscription);
    });
  });

  describe('registeredPlatform.deployment_request', () => {
    it('should call DeploymentRequestDomain.loadDeploymentRequestBy with the service_instance_id from parent', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedRequest = {
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
      } as DeploymentRequest;
      const loadDeploymentRequestBySpy = vi
        .spyOn(DeploymentRequestDomain, 'loadDeploymentRequestBy')
        .mockResolvedValue(expectedRequest);

      // When
      const result = await registrationResolver.RegisteredPlatform!
        .deployment_request!(
        { id: serviceInstanceId } as unknown as RegisteredPlatform,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(loadDeploymentRequestBySpy).toHaveBeenCalledWith({
        service_instance_id: serviceInstanceId,
      });
      expect(result).toEqual(expectedRequest);
    });
  });
});
