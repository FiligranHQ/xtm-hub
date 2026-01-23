import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  contextAdminUser,
  FILIGRAN_ORGA_ID,
  SERVICE_VAULT_ID,
  THALES_ORGA_ID,
  THALES_SIMPLE_USER_ID,
} from '../../../tests/tests.const';
import {
  PlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceTag,
} from '../../__generated__/resolvers-types';
import ServiceDefinition from '../../model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import UserService from '../../model/kanel/public/UserService';
import * as mailService from '../../server/mail-service';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { PlatformConfiguration } from './registration/registration.domain';
import {
  grantServiceAccess,
  loadLinks,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  ServiceInstanceDomain,
  updatePlatformConfigurationByServiceInstanceId,
  updateServiceInstance,
} from './service-instance.domain';

describe('Service instance domain', () => {
  describe('loadServiceInstancesByServiceDefinitionAndTags', () => {
    it('should return service instances linked to service definition and with tags', async () => {
      const serviceInstances =
        await ServiceInstanceDomain.loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription(
          ServiceDefinitionIdentifier.Link,
          [ServiceInstanceTag.OpenCti, ServiceInstanceTag.Trial]
        );

      expect(serviceInstances.length).toBe(3);
      expect(
        serviceInstances.find(({ name }) => name === 'Filigran Blog')
      ).toBeDefined();

      expect(
        serviceInstances.find(({ name }) => name === 'OpenCTI 101')
      ).toBeDefined();

      expect(
        serviceInstances.find(({ name }) => name === 'OpenCTI Demo')
      ).toBeDefined();
    });

    it('should not return service instance linked to a subscription', async () => {
      const linkServiceDefinition = await db<ServiceDefinition>(
        'ServiceDefinition'
      )
        .where('identifier', '=', ServiceDefinitionIdentifier.Link)
        .select('*')
        .first();

      expect(linkServiceDefinition).toBeDefined();

      const [subscribedServiceInstance] = await db<ServiceInstance>(
        'ServiceInstance'
      )
        .insert({
          id: uuidv4() as ServiceInstanceId,
          name: 'ServiceInstance 1',
          tags: [ServiceInstanceTag.OpenCti, ServiceInstanceTag.Trial],
          service_definition_id: linkServiceDefinition!.id,
        })
        .returning('*');
      expect(subscribedServiceInstance).toBeDefined();

      await db<Subscription>('Subscription').insert({
        id: uuidv4() as SubscriptionId,
        service_instance_id: subscribedServiceInstance!.id,
      });

      const serviceInstances =
        await ServiceInstanceDomain.loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription(
          ServiceDefinitionIdentifier.Link,
          [ServiceInstanceTag.OpenCti, ServiceInstanceTag.Trial]
        );

      expect(
        serviceInstances.find(
          (serviceInstance) =>
            serviceInstance.id === subscribedServiceInstance!.id
        )
      ).not.toBeDefined();
    });

    it('should return an empty array when no service instance has tags', async () => {
      const serviceInstances =
        await ServiceInstanceDomain.loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription(
          ServiceDefinitionIdentifier.Link,
          ['test' as ServiceInstanceTag]
        );

      expect(serviceInstances.length).toBe(0);
    });
  });

  describe('loadLinks', () => {
    it('should return the service link when the service instance exists and has links', async () => {
      const links = await loadLinks(SERVICE_VAULT_ID);
      expect(links.length).toBe(1);
    });

    it('should return an empty array when the service instance exists but has no links', async () => {
      const generateId = uuidv4();
      const test = await db('ServiceInstance')
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
      const links = await loadLinks(generateId);
      expect(links.length).toBe(0);
    });

    it('should return an empty array when the service instance does not exist', async () => {
      const generateId = uuidv4();
      const links = await loadLinks(generateId);
      expect(links.length).toBe(0);
    });
  });

  describe('loadPlatformServiceInstance', () => {
    it('should load platform service instance when it exists and user has subscription', async () => {
      // Create a test service instance
      const serviceInstanceId = uuidv4();
      const serviceDefinitionId = uuidv4();

      // Insert test data
      await db('ServiceDefinition').insert({
        id: serviceDefinitionId,
        name: 'OpenCTI Registration',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });

      await db('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'Test OpenCTI Platform',
        description: 'Test platform',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      await db('Subscription').insert({
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
        organization_id: contextAdminUser.user.selected_organization_id,
        start_date: new Date(),
        status: 'ACCEPTED',
      });

      const result = await loadPlatformServiceInstance(
        contextAdminUser.user.selected_organization_id,
        serviceInstanceId
      );

      expect(result).toBeTruthy();
      expect(result.id).toBe(serviceInstanceId);
      expect(result.name).toBe('Test OpenCTI Platform');
    });

    it('should return null when service instance does not exist', async () => {
      const nonExistentId = uuidv4();
      const result = await loadPlatformServiceInstance(
        contextAdminUser.user.selected_organization_id,
        nonExistentId
      );
      expect(result).toBeUndefined();
    });

    it('should return null when user has no subscription to the service', async () => {
      const serviceInstanceId = uuidv4();
      const serviceDefinitionId = uuidv4();

      await db('ServiceDefinition').insert({
        id: serviceDefinitionId,
        name: 'OpenCTI Registration',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });

      await db('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'Test Platform No Sub',
        description: 'Test platform without subscription',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      const result = await loadPlatformServiceInstance(
        contextAdminUser.user.selected_organization_id,
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
      await db('ServiceInstance').insert({
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
        mockServiceInstanceId,
        updateData
      );

      expect(result).toBeTruthy();
      expect(result?.name).toBe('Updated Name');
      expect(result?.description).toBe('Updated Description');
      expect(result?.id).toBe(mockServiceInstanceId);
    });

    it('should update only provided fields', async () => {
      const updateData = {
        name: 'Only Name Updated',
      };

      const result = await updateServiceInstance(
        mockServiceInstanceId,
        updateData
      );

      expect(result?.name).toBe('Only Name Updated');
      expect(result?.description).toBe('Original Description'); // Should remain unchanged
    });

    it('should return undefined when service instance does not exist', async () => {
      const nonExistentId = uuidv4();
      const updateData = { name: 'New Name' };

      const result = await updateServiceInstance(
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
      await db('ServiceInstance').insert({
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

      await db('Service_Configuration').insert({
        service_instance_id: mockServiceInstanceId,
        config: JSON.stringify(mockConfig),
        status: ServiceConfigurationStatus.Active,
      });
    });

    it('should load platform configuration when it exists', async () => {
      const result = await loadPlatformConfigurationByServiceInstanceId(
        mockServiceInstanceId
      );

      expect(result).toBeTruthy();
      expect(result?.service_instance_id).toBe(mockServiceInstanceId);

      const config = result?.config as PlatformConfiguration;
      expect(config.platform_title).toBe('Test Platform');
      expect(config.platform_url).toBe('https://test.com');
    });

    it('should return null when configuration does not exist', async () => {
      const nonExistentServiceId = uuidv4();
      const result =
        await loadPlatformConfigurationByServiceInstanceId(
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
      await db('ServiceInstance').insert({
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

      await db('Service_Configuration').insert({
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

    it('should return null when configuration does not exist', async () => {
      const nonExistentServiceId = uuidv4();
      const updatedConfig: PlatformConfiguration = {
        ...originalConfig,
        platform_title: 'Should Not Update',
      };

      const result = await updatePlatformConfigurationByServiceInstanceId(
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

  describe('grantServiceAccess', () => {
    let testServiceInstanceId: ServiceInstanceId;
    let filigranSubscriptionId: SubscriptionId;
    let thalesSubscriptionId: SubscriptionId;

    beforeEach(async () => {
      vi.spyOn(mailService, 'sendMail').mockResolvedValue();
      testServiceInstanceId = uuidv4() as ServiceInstanceId;
      filigranSubscriptionId = uuidv4() as SubscriptionId;
      thalesSubscriptionId = uuidv4() as SubscriptionId;

      const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';

      await db('ServiceInstance').insert({
        id: testServiceInstanceId,
        name: 'Test Service for Grant Access',
        description: 'Test service',
        service_definition_id: serviceDefinitionId,
        creation_status: 'READY',
      });

      await db('Subscription').insert({
        id: filigranSubscriptionId,
        service_instance_id: testServiceInstanceId,
        organization_id: FILIGRAN_ORGA_ID,
        start_date: new Date(),
        status: 'ACCEPTED',
        joining: 'AUTO_JOIN',
      });

      await db('Subscription').insert({
        id: thalesSubscriptionId,
        service_instance_id: testServiceInstanceId,
        organization_id: THALES_ORGA_ID,
        start_date: new Date(),
        status: 'ACCEPTED',
        joining: 'AUTO_JOIN',
      });
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await db<UserService>('User_Service')
        .where('user_id', '=', THALES_SIMPLE_USER_ID)
        .delete();
    });

    it('should create user_service linked to the correct subscription', async () => {
      const result = await grantServiceAccess(
        [GenericServiceCapabilityIds.AccessId],
        [THALES_SIMPLE_USER_ID],
        thalesSubscriptionId
      );

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(THALES_SIMPLE_USER_ID);
      expect(result[0].subscription_id).toBe(thalesSubscriptionId);

      const userServiceInDb = await db<UserService>('User_Service')
        .where('id', '=', result[0].id)
        .first();

      expect(userServiceInDb).toBeDefined();
      expect(userServiceInDb?.subscription_id).toBe(thalesSubscriptionId);
    });

    it('should not link user_service to a different organization subscription', async () => {
      const result = await grantServiceAccess(
        [GenericServiceCapabilityIds.AccessId],
        [THALES_SIMPLE_USER_ID],
        thalesSubscriptionId
      );

      expect(result[0].subscription_id).toBe(thalesSubscriptionId);
      expect(result[0].subscription_id).not.toBe(filigranSubscriptionId);

      const userServicesInDb = await db<UserService>('User_Service')
        .where('user_id', '=', THALES_SIMPLE_USER_ID)
        .select('*');

      expect(userServicesInDb).toHaveLength(1);
      expect(userServicesInDb[0].subscription_id).toBe(thalesSubscriptionId);
    });
  });
});
