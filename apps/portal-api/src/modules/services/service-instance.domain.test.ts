import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { dbTx, dbUnsecure } from '../../../knexfile';
import { contextAdminUser, SERVICE_VAULT_ID } from '../../../tests/tests.const';
import {
  PlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { PlatformConfiguration } from './registration/registration.domain';
import {
  loadLinks,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  updatePlatformConfigurationByServiceInstanceId,
  updateServiceInstance,
} from './service-instance.domain';

describe('Service instance domain', () => {
  describe('loadLinks', () => {
    it('should return the service link when the service instance exists and has links', async () => {
      const links = await loadLinks(contextAdminUser, SERVICE_VAULT_ID);
      expect(links.length).toBe(1);
    });

    it('should return an empty array when the service instance exists but has no links', async () => {
      const generateId = uuidv4();
      const test = await dbUnsecure('ServiceInstance')
        .insert([
          {
            id: generateId,
            name: 'OpenCTI Platform',
            description: 'short description',
            creation_status: 'READY',
            public: false,
            join_type: 'JOIN_AUTO',
            tags: '{others}',
            service_definition_id: '5f769173-5ace-4ef3-b04f-2c95609c5b59',
          },
        ])
        .returning('id');
      expect(test).toBeTruthy();
      const links = await loadLinks(contextAdminUser, generateId);
      expect(links.length).toBe(0);
    });

    it('should return an empty array when the service instance does not exist', async () => {
      const generateId = uuidv4();
      const links = await loadLinks(contextAdminUser, generateId);
      expect(links.length).toBe(0);
    });
  });

  describe('loadPlatformServiceInstance', () => {
    it('should load platform service instance when it exists and user has subscription', async () => {
      // Create a test service instance
      const serviceInstanceId = uuidv4();
      const serviceDefinitionId = uuidv4();

      // Insert test data
      await dbUnsecure('ServiceDefinition').insert({
        id: serviceDefinitionId,
        name: 'OpenCTI Registration',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });

      await dbUnsecure('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'Test OpenCTI Platform',
        description: 'Test platform',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      await dbUnsecure('Subscription').insert({
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
        organization_id: contextAdminUser.user.selected_organization_id,
        start_date: new Date(),
        status: 'ACCEPTED',
      });

      const result = await loadPlatformServiceInstance(
        contextAdminUser,
        serviceInstanceId
      );

      expect(result).toBeTruthy();
      expect(result.id).toBe(serviceInstanceId);
      expect(result.name).toBe('Test OpenCTI Platform');
    });

    it('should return null when service instance does not exist', async () => {
      const nonExistentId = uuidv4();
      const result = await loadPlatformServiceInstance(
        contextAdminUser,
        nonExistentId
      );
      expect(result).toBeUndefined();
    });

    it('should return null when user has no subscription to the service', async () => {
      const serviceInstanceId = uuidv4();
      const serviceDefinitionId = uuidv4();

      await dbUnsecure('ServiceDefinition').insert({
        id: serviceDefinitionId,
        name: 'OpenCTI Registration',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });

      await dbUnsecure('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'Test Platform No Sub',
        description: 'Test platform without subscription',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      const result = await loadPlatformServiceInstance(
        contextAdminUser,
        serviceInstanceId
      );
      expect(result).toBeUndefined();
    });
  });

  describe('updateServiceInstance', () => {
    let mockServiceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      mockServiceInstanceId = uuidv4() as ServiceInstanceId;
      const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59'; // Use existing service definition
      await dbUnsecure('ServiceInstance').insert({
        id: mockServiceInstanceId,
        name: 'Original Name',
        description: 'Original Description',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });
    });

    it('should update service instance with new data', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const result = await updateServiceInstance(
        contextAdminUser,
        mockServiceInstanceId,
        updateData
      );

      expect(result).toBeTruthy();
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated Description');
      expect(result.id).toBe(mockServiceInstanceId);
    });

    it('should update service instance with transaction', async () => {
      const trx = await dbTx();

      try {
        const updateData = {
          name: 'Transaction Updated Name',
        };

        const result = await updateServiceInstance(
          contextAdminUser,
          mockServiceInstanceId,
          updateData,
          trx
        );

        expect(result).toBeTruthy();
        expect(result.name).toBe('Transaction Updated Name');

        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    });

    it('should update only provided fields', async () => {
      const updateData = {
        name: 'Only Name Updated',
      };

      const result = await updateServiceInstance(
        contextAdminUser,
        mockServiceInstanceId,
        updateData
      );

      expect(result.name).toBe('Only Name Updated');
      expect(result.description).toBe('Original Description'); // Should remain unchanged
    });

    it('should return undefined when service instance does not exist', async () => {
      const nonExistentId = uuidv4();
      const updateData = { name: 'New Name' };

      const result = await updateServiceInstance(
        contextAdminUser,
        nonExistentId as ServiceInstanceId,
        updateData
      );
      expect(result).toBeUndefined();
    });
  });

  describe('loadPlatformConfigurationByServiceInstanceId', () => {
    let mockServiceInstanceId: string;

    beforeEach(async () => {
      mockServiceInstanceId = uuidv4();
      const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59'; // Use existing service definition

      // Create ServiceInstance first
      await dbUnsecure('ServiceInstance').insert({
        id: mockServiceInstanceId,
        name: 'Test Service Config',
        description: 'Test service for configuration',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      const mockConfig: PlatformConfiguration = {
        registerer_id: contextAdminUser.user.id,
        platform_id: 'test-platform',
        platform_title: 'Test Platform',
        platform_url: 'https://test.com',
        platform_contract: PlatformContract.Ee,
        platform_version: '1.0.0',
        token: 'test-token',
      };

      await dbUnsecure('Service_Configuration').insert({
        service_instance_id: mockServiceInstanceId,
        config: JSON.stringify(mockConfig),
        status: ServiceConfigurationStatus.Active,
      });
    });

    it('should load platform configuration when it exists', async () => {
      const result = await loadPlatformConfigurationByServiceInstanceId(
        contextAdminUser,
        mockServiceInstanceId
      );

      expect(result).toBeTruthy();
      expect(result?.service_instance_id).toBe(mockServiceInstanceId);

      const config = result?.config as PlatformConfiguration;
      expect(config.platform_title).toBe('Test Platform');
      expect(config.platform_url).toBe('https://test.com');
    });

    it('should load configuration with transaction and for update lock', async () => {
      const trx = await dbTx();

      try {
        const result = await loadPlatformConfigurationByServiceInstanceId(
          contextAdminUser,
          mockServiceInstanceId,
          trx
        );

        expect(result).toBeTruthy();
        expect(result?.service_instance_id).toBe(mockServiceInstanceId);

        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    });

    it('should return null when configuration does not exist', async () => {
      const nonExistentServiceId = uuidv4();
      const result = await loadPlatformConfigurationByServiceInstanceId(
        contextAdminUser,
        nonExistentServiceId
      );

      expect(result).toBeUndefined();
    });
  });

  describe('updatePlatformConfigurationByServiceInstanceId', () => {
    let mockServiceInstanceId: string;
    let originalConfig: PlatformConfiguration;

    beforeEach(async () => {
      mockServiceInstanceId = uuidv4();
      const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59'; // Use existing service definition

      // Create ServiceInstance first
      await dbUnsecure('ServiceInstance').insert({
        id: mockServiceInstanceId,
        name: 'Test Update Config',
        description: 'Test service for configuration update',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      originalConfig = {
        registerer_id: contextAdminUser.user.id,
        platform_id: 'original-platform',
        platform_title: 'Original Title',
        platform_url: 'https://original.com',
        platform_contract: PlatformContract.Ce,
        platform_version: '1.0.0',
        token: 'original-token',
      };

      await dbUnsecure('Service_Configuration').insert({
        service_instance_id: mockServiceInstanceId,
        config: JSON.stringify(originalConfig),
        status: ServiceConfigurationStatus.Active,
      });
    });

    it('should update platform configuration', async () => {
      const updatedConfig: PlatformConfiguration = {
        ...originalConfig,
        platform_title: 'Updated Title',
        platform_url: 'https://updated.com',
        platform_version: '2.0.0',
      };

      const result = await updatePlatformConfigurationByServiceInstanceId(
        contextAdminUser,
        mockServiceInstanceId,
        updatedConfig
      );

      expect(result).toBeTruthy();
      expect(result?.service_instance_id).toBe(mockServiceInstanceId);

      const config = result?.config as PlatformConfiguration;
      expect(config.platform_title).toBe('Updated Title');
      expect(config.platform_url).toBe('https://updated.com');
      expect(config.platform_version).toBe('2.0.0');
      expect(config.platform_contract).toBe(PlatformContract.Ce);
    });

    it('should update configuration with transaction', async () => {
      const trx = await dbTx();

      try {
        const updatedConfig: PlatformConfiguration = {
          ...originalConfig,
          platform_title: 'Transaction Updated Title',
        };

        const result = await updatePlatformConfigurationByServiceInstanceId(
          contextAdminUser,
          mockServiceInstanceId,
          updatedConfig,
          trx
        );

        expect(result).toBeTruthy();
        const config = result?.config as PlatformConfiguration;
        expect(config.platform_title).toBe('Transaction Updated Title');

        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    });

    it('should return null when configuration does not exist', async () => {
      const nonExistentServiceId = uuidv4();
      const updatedConfig: PlatformConfiguration = {
        ...originalConfig,
        platform_title: 'Should Not Update',
      };

      const result = await updatePlatformConfigurationByServiceInstanceId(
        contextAdminUser,
        nonExistentServiceId,
        updatedConfig
      );

      expect(result).toBeUndefined();
    });

    it('should handle complete configuration replacement', async () => {
      const newConfig: PlatformConfiguration = {
        registerer_id: 'new-registerer',
        platform_id: 'completely-new-platform',
        platform_title: 'Completely New Title',
        platform_url: 'https://completelynew.com',
        platform_contract: PlatformContract.Ee,
        platform_version: '3.0.0',
        token: 'new-token',
      };

      const result = await updatePlatformConfigurationByServiceInstanceId(
        contextAdminUser,
        mockServiceInstanceId,
        newConfig
      );

      expect(result).toBeTruthy();
      const config = result?.config as PlatformConfiguration;
      expect(config.registerer_id).toBe('new-registerer');
      expect(config.platform_id).toBe('completely-new-platform');
      expect(config.platform_title).toBe('Completely New Title');
      expect(config.platform_contract).toBe(PlatformContract.Ee);
    });
  });
});
