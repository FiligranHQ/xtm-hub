import { GraphQLResolveInfo } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TestServiceHelper } from '../../../../tests/helper/test.service.helper';
import { contextSimpleUserSecondOrga } from '../../../../tests/tests.const';
import { ServiceDefinition } from '../../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import * as ServiceCapabilityDomain from '../../security-management/service-capability/service-capability.domain';
import serviceDefinitionResolver from './service-definition.resolver';

describe('serviceDefinition resolver fields', () => {
  afterEach(async () => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  describe('service_capability field resolver', () => {
    it('should load service capabilities for a given service definition', async () => {
      // Given
      const serviceDefinition =
        await TestServiceHelper.serviceDefinition.create();
      await TestServiceHelper.serviceCapability.create({
        service_definition_id: serviceDefinition.id,
      });
      await TestServiceHelper.serviceCapability.create();
      const resolver =
        serviceDefinitionResolver.ServiceDefinition?.service_capability;
      if (!resolver) {
        throw new Error('service_capability resolver is not defined');
      }
      // When
      const response = await resolver(
        { id: serviceDefinition.id } as unknown as ServiceDefinition,
        {},
        contextSimpleUserSecondOrga,
        {} as GraphQLResolveInfo
      );

      // Then

      expect(response).toHaveLength(1);
      expect(response?.[0]).toMatchObject({
        service_definition_id: serviceDefinition.id,
        name: 'RANDOM SERVICE CAPABILITY',
        description: 'This is a short description',
      });
    });

    it('should handle empty service capabilities', async () => {
      const resolver =
        serviceDefinitionResolver.ServiceDefinition?.service_capability;
      if (!resolver) {
        throw new Error('service_capability resolver is not defined');
      }

      const response = await resolver(
        { id: uuidv4() } as unknown as ServiceDefinition,
        {},
        contextSimpleUserSecondOrga,
        {} as GraphQLResolveInfo
      );

      expect(response).toEqual([]);
    });

    it('should handle errors from loadServiceCapabilitiesBy', async () => {
      const mockServiceDefinitionId =
        'test-service-def-id' as ServiceDefinitionId;
      const mockError = new Error('Failed to load capabilities');

      vi.spyOn(
        ServiceCapabilityDomain,
        'loadServiceCapabilitiesBy'
      ).mockRejectedValue(mockError);

      const resolver =
        serviceDefinitionResolver.ServiceDefinition?.service_capability;
      if (!resolver) {
        throw new Error('service_capability resolver is not defined');
      }

      await expect(
        resolver(
          { id: mockServiceDefinitionId } as unknown as ServiceDefinition,
          {},
          contextSimpleUserSecondOrga,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrow('Failed to load capabilities');
    });
  });
});
