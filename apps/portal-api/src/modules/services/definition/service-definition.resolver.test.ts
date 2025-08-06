import { GraphQLResolveInfo } from 'graphql';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextAdminUser } from '../../../../tests/tests.const';
import { ServiceDefinition } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import * as ServiceCapabilityDomain from './service-capability/service-capability.domain';
import serviceDefinitionResolver from './service-definition.resolver';

describe('ServiceDefinition resolver fields', () => {
  afterEach(async () => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  describe('service_capability field resolver', () => {
    it('should load service capabilities for a given service definition', async () => {
      const mockServiceDefinitionId =
        'test-service-def-id' as ServiceDefinitionId;
      const mockServiceCapabilities = [
        {
          id: toGlobalId('Service_Capability', '1') as ServiceCapabilityId,
          name: 'Capability 1',
          description: null,
          service_definition_id: null,
        },
        {
          id: toGlobalId('Service_Capability', '2') as ServiceCapabilityId,
          name: 'Capability 2',
          description: null,
          service_definition_id: null,
        },
      ];

      const mockLoadServiceCapabilitiesBy = vi
        .spyOn(ServiceCapabilityDomain, 'loadServiceCapabilitiesBy')
        .mockResolvedValueOnce(mockServiceCapabilities);
      const resolver =
        serviceDefinitionResolver.ServiceDefinition?.service_capability;
      if (!resolver) {
        throw new Error('service_capability resolver is not defined');
      }

      const response = await resolver(
        { id: mockServiceDefinitionId } as unknown as ServiceDefinition,
        {},
        contextAdminUser,
        {} as GraphQLResolveInfo
      );

      expect(mockLoadServiceCapabilitiesBy).toHaveBeenCalledWith(
        contextAdminUser,
        {
          service_definition_id: mockServiceDefinitionId,
        }
      );
      expect(response).toEqual(mockServiceCapabilities);
    });

    it('should handle empty service capabilities', async () => {
      const mockServiceDefinitionId =
        'test-service-def-id' as ServiceDefinitionId;

      const mockLoadServiceCapabilitiesBy = vi
        .spyOn(ServiceCapabilityDomain, 'loadServiceCapabilitiesBy')
        .mockResolvedValueOnce([]);

      const resolver =
        serviceDefinitionResolver.ServiceDefinition?.service_capability;
      if (!resolver) {
        throw new Error('service_capability resolver is not defined');
      }

      const response = await resolver(
        { id: mockServiceDefinitionId } as unknown as ServiceDefinition,
        {},
        contextAdminUser,
        {} as GraphQLResolveInfo
      );

      expect(response).toEqual([]);
      expect(mockLoadServiceCapabilitiesBy).toHaveBeenCalledOnce();
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
          contextAdminUser,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrow('Failed to load capabilities');
    });
  });
});
