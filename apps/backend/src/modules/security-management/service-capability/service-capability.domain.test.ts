import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import ServiceDefinition, {
  ServiceDefinitionId,
} from '../../../model/kanel/public/ServiceDefinition';
import { ServiceCapabilityDomain } from './service-capability.domain';

describe('service Capability domain', () => {
  let serviceDefinition1: ServiceDefinition;
  let serviceDefinition2: ServiceDefinition;
  let testCapabilityIds: ServiceCapabilityId[] = [];
  let testServiceDefIds: ServiceDefinitionId[] = [];

  beforeAll(async () => {
    serviceDefinition1 = await TestHelper.serviceDefinition.create({
      name: 'Test Service Definition',
      description: 'Test service definition for capability tests',
    });
    serviceDefinition2 = await TestHelper.serviceDefinition.create({
      name: '2 Test Service Definition 2',
      description: '2 Test service definition for capability tests2 ',
    });
    const capabilities1 = await TestHelper.serviceCapability.create({
      name: 'Test Capability 1',
      description: 'First test capability',
      service_definition_id: serviceDefinition1.id,
    });
    const capabilities2 = await TestHelper.serviceCapability.create({
      name: 'Test Capability 2',
      description: 'Second test capability',
      service_definition_id: serviceDefinition1.id,
    });
    const capabilities3 = await TestHelper.serviceCapability.create({
      name: 'Test Capability 3',
      description: 'Third test capability',
      service_definition_id: serviceDefinition2.id,
    });

    testCapabilityIds = [capabilities1.id, capabilities2.id, capabilities3.id];
    testServiceDefIds = [serviceDefinition1.id, serviceDefinition2.id];
  });

  afterAll(async () => {
    if (testCapabilityIds.length > 0) {
      await Promise.all(
        testCapabilityIds.map((id) =>
          TestHelper.serviceCapability.delete({ id })
        )
      );
    }

    if (testServiceDefIds.length > 0) {
      await Promise.all(
        testServiceDefIds.map((id) =>
          TestHelper.serviceDefinition.delete({ id })
        )
      );
    }
  });

  describe('loadServiceCapabilitiesBy', () => {
    it('should load service capabilities by service_definition_id', async () => {
      const capabilities =
        await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
          service_definition_id: serviceDefinition1.id,
        });

      expect(capabilities).toHaveLength(2);
      expect(capabilities[0]?.service_definition_id).toBe(
        serviceDefinition1.id
      );
      expect(capabilities.map((cap) => cap.name)).toContain(
        'Test Capability 1'
      );
      expect(capabilities.map((cap) => cap.name)).toContain(
        'Test Capability 2'
      );
    });

    it('should load service capabilities by id', async () => {
      const capabilities =
        await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
          id: testCapabilityIds[0],
        });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.id).toBe(testCapabilityIds[0]);
      expect(capabilities[0]?.name).toBe('Test Capability 1');
    });

    it('should load service capabilities by name', async () => {
      const capabilities =
        await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
          name: 'Test Capability 2',
        });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.name).toBe('Test Capability 2');
      expect(capabilities[0]?.description).toBe('Second test capability');
    });

    it('should return empty array when no capabilities match', async () => {
      const capabilities =
        await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
          name: 'Non-existent Capability',
        });

      expect(capabilities).toHaveLength(0);
      expect(capabilities).toEqual([]);
    });

    it('should handle multiple criteria', async () => {
      const capabilities =
        await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
          service_definition_id: serviceDefinition1.id,
          name: 'Test Capability 1',
        });

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]?.name).toBe('Test Capability 1');
      expect(capabilities[0]?.service_definition_id).toBe(
        serviceDefinition1.id
      );
    });
  });
});
