import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import { RegisteredPlatform } from '../../../../__generated__/resolvers-types';
import ServiceGroup from '../../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { DeploymentRequestDomain } from '../../../deployment/deployment.domain';
import { ServiceGroupDomain } from '../../../deployment/group/service-group.domain';
import * as ServiceInstanceDomain from '../../../service/instance/service-instance.domain';
import registrationResolver from '../../registration.resolver';

vi.mock('../../../deployment/deployment.domain', () => ({
  DeploymentRequestDomain: {
    loadFullDeploymentRequest: vi.fn(),
  },
}));

vi.mock('../../../deployment/group/service-group.domain', () => ({
  ServiceGroupDomain: {
    loadServiceGroupsByServiceInstanceAndUser: vi.fn(),
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
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        loadSubscriptionByServiceInstanceAndOrganizationSpy
      ).toHaveBeenCalledWith(
        contextSimpleUserFiligran2.user.selected_organization_id,
        serviceInstanceId
      );
      expect(result).toMatchObject(expectedSubscription);
    });
  });

  describe('registeredPlatform.myGroups', () => {
    it('should call loadServiceGroupsByServiceInstanceAndUser with service instance id and context user id', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedGroups: ServiceGroup[] = [
        {
          id: uuidv4(),
          name: 'Admin',
          service_instance_id: serviceInstanceId,
        } as ServiceGroup,
      ];
      const loadServiceGroupsByServiceInstanceAndUserSpy = vi
        .spyOn(ServiceGroupDomain, 'loadServiceGroupsByServiceInstanceAndUser')
        .mockResolvedValue(expectedGroups);

      // When
      const result = await registrationResolver.RegisteredPlatform!.myGroups!(
        { id: serviceInstanceId } as unknown as RegisteredPlatform,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(loadServiceGroupsByServiceInstanceAndUserSpy).toHaveBeenCalledWith(
        serviceInstanceId,
        contextSimpleUserFiligran2.user.id
      );
      expect(result).toMatchObject(expectedGroups);
    });

    it('should return an empty list when the user has no group on the service instance', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      vi.spyOn(
        ServiceGroupDomain,
        'loadServiceGroupsByServiceInstanceAndUser'
      ).mockResolvedValue([]);

      // When
      const result = await registrationResolver.RegisteredPlatform!.myGroups!(
        { id: serviceInstanceId } as unknown as RegisteredPlatform,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('registeredPlatform.deployment_request', () => {
    it('should call DeploymentRequestDomain.loadFullDeploymentRequest with the service_instance_id from parent', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedRequest = {
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
        organization_name: 'Filigran',
        organization_domains: ['filigran.io'],
        requester_email: 'requester@filigran.io',
        requester_first_name: 'John',
        requester_last_name: 'Doe',
      };
      const loadFullDeploymentRequestSpy = vi
        .spyOn(DeploymentRequestDomain, 'loadFullDeploymentRequest')
        .mockResolvedValue(expectedRequest as never);

      // When
      const result = await registrationResolver.RegisteredPlatform!
        .deployment_request!(
        { id: serviceInstanceId } as unknown as RegisteredPlatform,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(loadFullDeploymentRequestSpy).toHaveBeenCalledWith({
        'DeploymentRequest.service_instance_id': serviceInstanceId,
      });
      expect(result).toMatchObject(expectedRequest);
    });
  });
});
