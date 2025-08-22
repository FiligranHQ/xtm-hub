import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dbUnsecure } from '../../../../../knexfile';
import { contextAdminUser } from '../../../../../tests/tests.const';
import ServiceCapability, {
  ServiceCapabilityId,
} from '../../../../model/kanel/public/ServiceCapability';
import ServiceDefinition, {
  ServiceDefinitionId,
} from '../../../../model/kanel/public/ServiceDefinition';
import { loadServiceCapabilitiesBy } from './service-capability.domain';

describe('Service Capability domain', () => {
  let testServiceDefinitionId: ServiceDefinitionId;
  let testServiceDefinitionId2: ServiceDefinitionId;
  let testCapabilityIds: ServiceCapabilityId[] = [];
  let testServiceDefIds: ServiceDefinitionId[] = [];

  beforeAll(async () => {
    const serviceDefinition = await dbUnsecure<ServiceDefinition>(
      'ServiceDefinition'
    )
      .insert([
        {
          id: uuidv4() as ServiceDefinitionId,
          name: 'Test Service Definition',
          description: 'Test service definition for capability tests',
        },
        {
          id: uuidv4() as ServiceDefinitionId,
          name: '2 Test Service Definition 2',
          description: '2 Test service definition for capability tests2 ',
        },
      ])
      .returning('*');

    testServiceDefinitionId =
      serviceDefinition[0]?.id ?? (uuidv4() as ServiceDefinitionId);
    testServiceDefinitionId2 =
      serviceDefinition[1]?.id ?? (uuidv4() as ServiceDefinitionId);

    const capabilities = await dbUnsecure<ServiceCapability>(
      'Service_Capability'
    )
      .insert([
        {
          id: uuidv4() as ServiceCapabilityId,
          name: 'Test Capability 1',
          description: 'First test capability',
          service_definition_id: testServiceDefinitionId,
        },
        {
          id: uuidv4() as ServiceCapabilityId,
          name: 'Test Capability 2',
          description: 'Second test capability',
          service_definition_id: testServiceDefinitionId,
        },
        {
          id: uuidv4() as ServiceCapabilityId,
          name: 'Test Capability 3',
          description: 'Third test capability',
          service_definition_id: testServiceDefinitionId2,
        },
      ])
      .returning('*');

    testCapabilityIds = capabilities.map((cap) => cap.id);
    testServiceDefIds = serviceDefinition.map((def) => def.id);
  });

  afterAll(async () => {
    if (testCapabilityIds.length > 0) {
      await dbUnsecure<ServiceCapability>('Service_Capability')
        .whereIn('id', testCapabilityIds)
        .delete();
    }

    if (testServiceDefinitionId) {
      await dbUnsecure<ServiceDefinition>('ServiceDefinition')
        .whereIn('id', testServiceDefIds)
        .delete();
    }
  });

  describe('loadServiceCapabilitiesBy', () => {
    it('should load service capabilities by service_definition_id', async () => {
      const capabilities = await loadServiceCapabilitiesBy(contextAdminUser, {
        service_definition_id: testServiceDefinitionId,
      });

      expect(capabilities).toHaveLength(2);
      expect(capabilities[0]?.service_definition_id).toBe(
        testServiceDefinitionId
      );
      expect(capabilities.map((cap) => cap.name)).toContain(
        'Test Capability 1'
      );
      expect(capabilities.map((cap) => cap.name)).toContain(
        'Test Capability 2'
      );
    });

    it('should load service capabilities by id', async () => {
      const capabilities = await loadServiceCapabilitiesBy(contextAdminUser, {
        id: testCapabilityIds[0],
      });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.id).toBe(testCapabilityIds[0]);
      expect(capabilities[0]?.name).toBe('Test Capability 1');
    });

    it('should load service capabilities by name', async () => {
      const capabilities = await loadServiceCapabilitiesBy(contextAdminUser, {
        name: 'Test Capability 2',
      });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.name).toBe('Test Capability 2');
      expect(capabilities[0]?.description).toBe('Second test capability');
    });

    it('should return empty array when no capabilities match', async () => {
      const capabilities = await loadServiceCapabilitiesBy(contextAdminUser, {
        name: 'Non-existent Capability',
      });

      expect(capabilities).toHaveLength(0);
      expect(capabilities).toEqual([]);
    });

    it('should handle multiple criteria', async () => {
      const capabilities = await loadServiceCapabilitiesBy(contextAdminUser, {
        service_definition_id: testServiceDefinitionId,
        name: 'Test Capability 1',
      });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.name).toBe('Test Capability 1');
      expect(capabilities[0]?.service_definition_id).toBe(
        testServiceDefinitionId
      );
    });
  });
});
