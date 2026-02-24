import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import { contextBypassUser } from '../../../tests/tests.const';
import {
  PlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { DocumentId } from '../../model/kanel/public/Document';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import * as pub from '../../pub';
import * as securityGuardModule from '../../security/guard';
import * as subscriptionDomain from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { UserServiceDomain } from '../user_service/user_service.domain';
import * as documentHelper from './document/document.helper';
import { PlatformConfiguration } from './registration/registration.domain';
import {
  ServiceInstanceApp,
  withServiceInstanceGlobalIDs,
} from './service-instance.app';
import * as serviceInstanceDomain from './service-instance.domain';

describe('Service Instance app', () => {
  describe('loadServiceInstance', () => {
    let loadSubscriptionBySpy: MockInstance;
    let loadUserServiceBySpy: MockInstance;
    let loadServiceInstanceBySpy: MockInstance;
    let grantServiceAccessSpy: MockInstance;

    const mockServiceInstanceId = uuidv4() as ServiceInstanceId;
    const mockSubscriptionId = uuidv4() as SubscriptionId;
    const mockUserId = contextBypassUser.user.id;

    const mockSubscription = {
      id: mockSubscriptionId,
      service_instance_id: mockServiceInstanceId,
      organization_id: uuidv4(),
      joining: 'INVITE_ONLY',
      start_date: new Date(),
      end_date: null,
    };

    const mockUserService = {
      id: uuidv4(),
      user_id: mockUserId,
      subscription_id: mockSubscriptionId,
      service_capability_id: GenericServiceCapabilityIds.AccessId,
    };

    const mockServiceInstance = {
      id: mockServiceInstanceId,
      name: 'Service instance 1',
      description: 'description 1',
      service_definition_id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    beforeEach(() => {
      loadSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionBy'
      );
      loadUserServiceBySpy = vi.spyOn(UserServiceDomain, 'loadUserServiceBy');
      loadServiceInstanceBySpy = vi.spyOn(
        serviceInstanceDomain,
        'loadServiceInstanceBy'
      );
      grantServiceAccessSpy = vi.spyOn(
        serviceInstanceDomain,
        'grantServiceAccess'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should load service instance when user already has access', async () => {
      loadSubscriptionBySpy.mockResolvedValueOnce(mockSubscription);
      loadUserServiceBySpy.mockResolvedValueOnce([mockUserService]);
      loadServiceInstanceBySpy.mockResolvedValueOnce(mockServiceInstance);

      const result = await ServiceInstanceApp.loadServiceInstance(
        contextBypassUser.user,
        mockServiceInstanceId
      );

      expect(loadSubscriptionBySpy).toHaveBeenCalledWith({
        service_instance_id: mockServiceInstanceId,
        organization_id: contextBypassUser.user.selected_organization_id,
      });
      expect(loadUserServiceBySpy).toHaveBeenCalledWith({
        subscription_id: mockSubscriptionId,
        user_id: mockUserId,
      });
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(loadServiceInstanceBySpy).toHaveBeenCalledWith(
        'id',
        mockServiceInstanceId
      );
      expect(result).toEqual(mockServiceInstance);
    });

    it('should auto-join user when subscription has AUTO_JOIN mode and user has no access', async () => {
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);
      grantServiceAccessSpy.mockResolvedValue(undefined);

      const result = await ServiceInstanceApp.loadServiceInstance(
        contextBypassUser.user,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        mockSubscriptionId
      );
      expect(result).toEqual(mockServiceInstance);
    });

    it('should use subscription from user organization, not from another organization', async () => {
      const userOrganizationId =
        contextBypassUser.user.selected_organization_id;
      const otherOrganizationId = uuidv4() as OrganizationId;

      const userOrgSubscriptionId = uuidv4() as SubscriptionId;
      const otherOrgSubscriptionId = uuidv4() as SubscriptionId;

      const userOrgSubscription = {
        id: userOrgSubscriptionId,
        service_instance_id: mockServiceInstanceId,
        organization_id: userOrganizationId,
        joining: 'AUTO_JOIN',
        start_date: new Date(),
        end_date: null,
      };

      const otherOrgSubscription = {
        id: otherOrgSubscriptionId,
        service_instance_id: mockServiceInstanceId,
        organization_id: otherOrganizationId,
        joining: 'AUTO_JOIN',
        start_date: new Date(),
        end_date: null,
      };

      loadSubscriptionBySpy.mockImplementation((filter) => {
        if (filter.organization_id === userOrganizationId) {
          return Promise.resolve(userOrgSubscription);
        } else if (filter.organization_id === otherOrganizationId) {
          return Promise.resolve(otherOrgSubscription);
        }
        return Promise.resolve(otherOrgSubscription);
      });

      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);
      grantServiceAccessSpy.mockResolvedValue(undefined);

      await ServiceInstanceApp.loadServiceInstance(
        contextBypassUser.user,
        mockServiceInstanceId
      );

      expect(loadSubscriptionBySpy).toHaveBeenCalledWith({
        service_instance_id: mockServiceInstanceId,
        organization_id: userOrganizationId,
      });

      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        userOrgSubscriptionId
      );
    });

    it('should not auto-join user when subscription has INVITE_ONLY mode', async () => {
      const inviteOnlySubscription = {
        ...mockSubscription,
        joining: 'INVITE_ONLY',
      };
      loadSubscriptionBySpy.mockResolvedValue(inviteOnlySubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      const result = await ServiceInstanceApp.loadServiceInstance(
        contextBypassUser.user,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockServiceInstance);
    });

    it('should handle multiple user services', async () => {
      const multipleUserServices = [
        mockUserService,
        {
          ...mockUserService,
          id: uuidv4(),
          service_capability_id: uuidv4(),
        },
      ];
      loadSubscriptionBySpy.mockResolvedValue(mockSubscription);
      loadUserServiceBySpy.mockResolvedValue(multipleUserServices);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      const result = await ServiceInstanceApp.loadServiceInstance(
        contextBypassUser.user,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockServiceInstance);
    });

    it('should propagate errors from loadSubscriptionBy', async () => {
      const error = new Error('Error');
      loadSubscriptionBySpy.mockRejectedValue(error);

      await expect(
        ServiceInstanceApp.loadServiceInstance(
          contextBypassUser.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Error');

      expect(loadUserServiceBySpy).not.toHaveBeenCalled();
      expect(loadServiceInstanceBySpy).not.toHaveBeenCalled();
    });

    it('should propagate errors from grantServiceAccess', async () => {
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      const error = new Error('Other error');
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      grantServiceAccessSpy.mockRejectedValue(error);

      await expect(
        ServiceInstanceApp.loadServiceInstance(
          contextBypassUser.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Other error');

      expect(loadServiceInstanceBySpy).not.toHaveBeenCalled();
    });

    it('should handle different context users', async () => {
      const differentUserId = uuidv4() as UserId;
      const differentContext = {
        ...contextBypassUser,
        user: {
          ...contextBypassUser.user,
          id: differentUserId,
        },
      };
      requestContext.set(differentContext);
      loadSubscriptionBySpy.mockResolvedValue(mockSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      await ServiceInstanceApp.loadServiceInstance(
        differentContext.user,
        mockServiceInstanceId
      );

      expect(loadUserServiceBySpy).toHaveBeenCalledWith({
        subscription_id: mockSubscriptionId,
        user_id: differentUserId,
      });
    });
  });

  describe('updatePlatformServiceMetadata', () => {
    let dispatchSpy: MockInstance;
    let uploadNewFileSpy: MockInstance;

    const mockPlatformConfig: PlatformConfiguration = {
      registerer_id: contextBypassUser.user.id,
      platform_id: 'test-platform',
      platform_title: 'Test Platform',
      platform_url: 'https://test.com',
      platform_contract: PlatformContract.Ee,
      platform_version: '1.0.0',
      token: 'test-token',
    };

    const mockFileUpload: FileUpload = {
      filename: 'illustration.png',
      mimetype: 'image/png',
      encoding: '7bit',
      createReadStream: vi.fn(),
    };

    const mockUpload = {
      file: mockFileUpload,
      promise: Promise.resolve(mockFileUpload),
    };

    const createPlatformServiceData = async () => {
      const serviceDefId = uuidv4() as ServiceDefinitionId;
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const subscriptionId = uuidv4() as SubscriptionId;
      await db('ServiceDefinition').insert({
        id: serviceDefId,
        name: 'OpenCTI',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });
      await serviceInstanceDomain.insertServiceInstance({
        id: serviceInstanceId,
        name: 'Test Platform',
        service_definition_id: serviceDefId,
      });
      await db('Subscription').insert({
        id: subscriptionId,
        organization_id: contextBypassUser.user.selected_organization_id,
        service_instance_id: serviceInstanceId,
      });
      await db('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: mockPlatformConfig,
      });
      return { serviceDefId, serviceInstanceId, subscriptionId };
    };

    beforeEach(() => {
      dispatchSpy = vi.spyOn(pub, 'dispatch').mockResolvedValue(undefined);
      uploadNewFileSpy = vi.spyOn(documentHelper, 'uploadNewFile');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should update name, sync config title, dispatch, and return RegisteredPlatform', async () => {
      const { serviceInstanceId } = await createPlatformServiceData();
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstanceId),
        name: 'Updated Platform Name',
      };

      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextBypassUser.user,
        serviceInstanceId,
        input,
        null
      );

      expect(result.id).toBe(serviceInstanceId);
      expect(result.title).toBe('Updated Platform Name');
      expect(result.platform_id).toBe(mockPlatformConfig.platform_id);
      expect(result.url).toBe(mockPlatformConfig.platform_url);
      expect(dispatchSpy).toHaveBeenCalledWith(
        'ServiceInstance',
        'edit',
        expect.objectContaining({
          id: serviceInstanceId,
          name: 'Updated Platform Name',
        })
      );
    });

    it('should upload illustration and include global document ID in response', async () => {
      const { serviceInstanceId } = await createPlatformServiceData();
      const illustrationId = uuidv4();
      uploadNewFileSpy.mockResolvedValue({
        id: illustrationId,
        name: 'illustration.png',
        mime_type: 'image/png',
      });
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstanceId),
        name: 'Updated Platform Name',
      };

      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextBypassUser.user,
        serviceInstanceId,
        input,
        mockUpload
      );

      expect(uploadNewFileSpy).toHaveBeenCalledWith(
        mockUpload,
        serviceInstanceId
      );
      expect(result.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
    });

    it('should not update service instance or config when no fields to update', async () => {
      const { serviceInstanceId } = await createPlatformServiceData();
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstanceId),
      };

      await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextBypassUser.user,
        serviceInstanceId,
        input,
        null
      );

      const unchangedInstance =
        await serviceInstanceDomain.loadServiceInstanceBy(
          'id',
          serviceInstanceId
        );
      expect(unchangedInstance.name).toBe('Test Platform');
    });

    it('should return null illustration_document_id when service instance has none', async () => {
      const { serviceInstanceId } = await createPlatformServiceData();
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstanceId),
        name: 'Updated Name',
      };

      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextBypassUser.user,
        serviceInstanceId,
        input,
        null
      );

      expect(result.illustration_document_id).toBeNull();
    });

    it('should throw SERVICE_INSTANCE_NOT_FOUND when service instance does not exist', async () => {
      const nonExistentId = uuidv4() as ServiceInstanceId;

      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextBypassUser.user,
          nonExistentId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', nonExistentId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow('SERVICE_INSTANCE_NOT_FOUND');
    });

    it('should throw SERVICE_DEFINITION_NOT_FOUND when service definition does not exist', async () => {
      // Cannot reproduce with real DB: loadPlatformServiceInstance filters by
      // ServiceDefinition.identifier, so a result is only returned when a
      // matching ServiceDefinition exists in the join.
      const mockId = uuidv4() as ServiceInstanceId;
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformServiceInstance'
      ).mockResolvedValue({ id: mockId, name: 'Mock Platform' });
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);

      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextBypassUser.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow('SERVICE_DEFINITION_NOT_FOUND');
    });

    it('should throw when user cannot modify platform service', async () => {
      // Cannot test with real DB: the bypass user always passes
      // assertUserCanModifyPlatformService due to CAPABILITY_BYPASS.
      const mockId = uuidv4() as ServiceInstanceId;
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformServiceInstance'
      ).mockResolvedValue({ id: mockId, name: 'Mock Platform' });
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue({
        id: uuidv4(),
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        name: 'Mock Platform',
      });
      vi.spyOn(
        securityGuardModule.securityGuard,
        'assertUserCanModifyPlatformService'
      ).mockRejectedValue(new Error('Insufficient permissions'));

      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextBypassUser.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow('Insufficient permissions');
    });

    it('should throw when upload fails and not update service instance', async () => {
      const { serviceInstanceId } = await createPlatformServiceData();
      uploadNewFileSpy.mockRejectedValue(new Error('Upload failed'));
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstanceId),
        name: 'Updated Name',
      };

      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextBypassUser.user,
          serviceInstanceId,
          input,
          mockUpload
        )
      ).rejects.toThrow('Upload failed');

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should throw SERVICE_CONFIGURATION_NOT_FOUND when config is missing after update', async () => {
      // Cannot reproduce with real DB: simulates a race condition where the
      // configuration is deleted between the update transaction and the
      // response-building query.
      const mockId = uuidv4() as ServiceInstanceId;
      const mockServiceConfiguration = {
        service_instance_id: mockId,
        config: mockPlatformConfig,
        status: ServiceConfigurationStatus.Active,
      };
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformServiceInstance'
      ).mockResolvedValue({
        id: mockId,
        name: 'Mock Platform',
        illustration_document_id: null,
      });
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue({
        id: uuidv4(),
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        name: 'Mock Platform',
      });
      vi.spyOn(
        securityGuardModule.securityGuard,
        'assertUserCanModifyPlatformService'
      ).mockResolvedValue(undefined);
      vi.spyOn(
        serviceInstanceDomain,
        'updateServiceInstance'
      ).mockResolvedValue({
        id: mockId,
        name: 'Mock Platform',
      } as ServiceInstance);
      const configSpy = vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      );

      configSpy
        .mockResolvedValueOnce(mockServiceConfiguration)
        .mockResolvedValueOnce(null);
      vi.spyOn(
        serviceInstanceDomain,
        'updatePlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue(mockServiceConfiguration);

      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextBypassUser.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Updated',
          },
          null
        )
      ).rejects.toThrow('SERVICE_CONFIGURATION_NOT_FOUND');
    });
  });

  describe('loadLinkServiceInstancesByTags', () => {
    it('should load service instances links with tags', async () => {
      const serviceInstances =
        await ServiceInstanceApp.loadLinkServiceInstancesByTags([
          ServiceInstanceTag.OpenCti,
          ServiceInstanceTag.Trial,
        ]);

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
  });

  describe('loadSeoServiceInstance', () => {
    // Uses the vault ServiceDefinition inserted by seeds
    const SERVICE_DEF_ID =
      '2634d52b-f061-4ebc-bed2-c6cc94297ad1' as ServiceDefinitionId;

    it('should return the service instance with global document IDs', async () => {
      const slug = 'test-seo-slug-with-docs';
      const logoId = uuidv4() as DocumentId;
      const illustrationId = uuidv4();

      // logo_document_id has a FK to Document, so insert the document first
      await db('Document').insert({ id: logoId, type: 'logo' });
      await serviceInstanceDomain.insertServiceInstance({
        id: uuidv4() as ServiceInstanceId,
        name: 'Test SEO Service',
        slug,
        logo_document_id: logoId,
        illustration_document_id: illustrationId,
        tags: [ServiceInstanceTag.OpenCti],
        service_definition_id: SERVICE_DEF_ID,
      });

      const result = await ServiceInstanceApp.loadSeoServiceInstance(slug);

      expect(result.name).toBe('Test SEO Service');
      expect(result.logo_document_id).toBe(toGlobalId('Document', logoId));
      expect(result.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
      expect(result.tags).toEqual([ServiceInstanceTag.OpenCti]);
    });

    it('should throw NotFoundError when the slug does not match any service', async () => {
      await expect(
        ServiceInstanceApp.loadSeoServiceInstance('non-existent-slug')
      ).rejects.toThrow('SERVICE_NOT_FOUND');
    });

    it('should handle null document IDs without converting them', async () => {
      const slug = 'test-seo-slug-no-docs';
      await serviceInstanceDomain.insertServiceInstance({
        id: uuidv4() as ServiceInstanceId,
        name: 'Test SEO Service No Docs',
        slug,
        service_definition_id: SERVICE_DEF_ID,
      });

      const result = await ServiceInstanceApp.loadSeoServiceInstance(slug);

      expect(result.logo_document_id).toBeNull();
      expect(result.illustration_document_id).toBeNull();
    });
  });

  describe('loadSeoServiceInstances', () => {
    // Uses the vault ServiceDefinition inserted by seeds
    const SERVICE_DEF_ID =
      '2634d52b-f061-4ebc-bed2-c6cc94297ad1' as ServiceDefinitionId;

    it('should return public service instances with document IDs converted to global IDs', async () => {
      const logoId = uuidv4() as DocumentId;
      const illustrationId = uuidv4();
      const instanceId = uuidv4() as ServiceInstanceId;

      // logo_document_id has a FK to Document, so insert the document first
      await db('Document').insert({ id: logoId, type: 'logo' });
      await serviceInstanceDomain.insertServiceInstance({
        id: instanceId,
        name: 'Test Public SEO Service',
        public: true,
        logo_document_id: logoId,
        illustration_document_id: illustrationId,
        service_definition_id: SERVICE_DEF_ID,
      });

      const results = await ServiceInstanceApp.loadSeoServiceInstances();
      const result = results.find(({ id }) => id === instanceId);

      expect(result).toBeDefined();
      expect(result!.logo_document_id).toBe(toGlobalId('Document', logoId));
      expect(result!.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
    });

    it('should not include non-public service instances', async () => {
      const instanceId = uuidv4() as ServiceInstanceId;
      await serviceInstanceDomain.insertServiceInstance({
        id: instanceId,
        name: 'Non-Public Service',
        public: false,
        service_definition_id: SERVICE_DEF_ID,
      });

      const results = await ServiceInstanceApp.loadSeoServiceInstances();

      expect(results.find(({ id }) => id === instanceId)).toBeUndefined();
    });

    it('should return instances ordered by ordering field ascending', async () => {
      const firstId = uuidv4() as ServiceInstanceId;
      const secondId = uuidv4() as ServiceInstanceId;

      // Insert in reverse order to confirm sorting is applied
      await serviceInstanceDomain.insertServiceInstance({
        id: secondId,
        name: 'SEO Ordering B',
        public: true,
        ordering: 200,
        service_definition_id: SERVICE_DEF_ID,
      });
      await serviceInstanceDomain.insertServiceInstance({
        id: firstId,
        name: 'SEO Ordering A',
        public: true,
        ordering: 100,
        service_definition_id: SERVICE_DEF_ID,
      });

      const results = await ServiceInstanceApp.loadSeoServiceInstances();
      const firstIndex = results.findIndex(({ id }) => id === firstId);
      const secondIndex = results.findIndex(({ id }) => id === secondId);

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);
    });
  });

  describe('addServicePicture', () => {
    let uploadNewFileSpy: MockInstance;
    let updateServiceInstanceSpy: MockInstance;
    let dispatchSpy: MockInstance;

    const mockServiceInstanceId = uuidv4() as ServiceInstanceId;
    const mockDocumentId = uuidv4();

    const mockFileUpload: FileUpload = {
      filename: 'logo.png',
      mimetype: 'image/png',
      encoding: '7bit',
      createReadStream: vi.fn(),
    };

    const mockUpload = {
      file: mockFileUpload,
      promise: Promise.resolve(mockFileUpload),
    };

    const mockUploadedDocument = {
      id: mockDocumentId,
      name: 'logo.png',
      mime_type: 'image/png',
    };

    const mockUpdatedServiceInstance = {
      id: mockServiceInstanceId,
      name: 'Updated Service',
      logo_document_id: mockDocumentId,
    };

    beforeEach(() => {
      uploadNewFileSpy = vi.spyOn(documentHelper, 'uploadNewFile');
      updateServiceInstanceSpy = vi.spyOn(
        serviceInstanceDomain,
        'updateServiceInstance'
      );
      dispatchSpy = vi.spyOn(pub, 'dispatch');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should upload a logo, update the service instance, and dispatch an edit event', async () => {
      uploadNewFileSpy.mockResolvedValue(mockUploadedDocument);
      updateServiceInstanceSpy.mockResolvedValue(mockUpdatedServiceInstance);
      dispatchSpy.mockResolvedValue(undefined);

      const result = await ServiceInstanceApp.addServicePicture(
        mockServiceInstanceId,
        mockUpload,
        true
      );

      expect(uploadNewFileSpy).toHaveBeenCalledWith(
        mockUpload,
        mockServiceInstanceId
      );
      expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
        mockServiceInstanceId,
        { logo_document_id: mockDocumentId }
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        'ServiceInstance',
        'edit',
        mockUpdatedServiceInstance
      );
      expect(result).toEqual(mockUpdatedServiceInstance);
    });

    it('should update illustration_document_id when isLogo is false', async () => {
      uploadNewFileSpy.mockResolvedValue(mockUploadedDocument);
      updateServiceInstanceSpy.mockResolvedValue(mockUpdatedServiceInstance);
      dispatchSpy.mockResolvedValue(undefined);

      await ServiceInstanceApp.addServicePicture(
        mockServiceInstanceId,
        mockUpload,
        false
      );

      expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
        mockServiceInstanceId,
        { illustration_document_id: mockDocumentId }
      );
    });

    it('should throw a mapped GraphQL error when upload fails', async () => {
      uploadNewFileSpy.mockRejectedValue(new Error('Upload failed'));

      await expect(
        ServiceInstanceApp.addServicePicture(
          mockServiceInstanceId,
          mockUpload,
          true
        )
      ).rejects.toThrow();

      expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('withServiceInstanceGlobalIDs', () => {
    it('should convert both logo and illustration document IDs to global IDs', () => {
      const logoId = uuidv4();
      const illustrationId = uuidv4();
      const service = {
        logo_document_id: logoId,
        illustration_document_id: illustrationId,
      };

      const result = withServiceInstanceGlobalIDs(service);

      expect(result.logo_document_id).toBe(toGlobalId('Document', logoId));
      expect(result.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
    });

    it('should convert only logo_document_id when illustration_document_id is null', () => {
      const logoId = uuidv4();
      const service = {
        logo_document_id: logoId,
        illustration_document_id: null,
      };

      const result = withServiceInstanceGlobalIDs(service);

      expect(result.logo_document_id).toBe(toGlobalId('Document', logoId));
      expect(result.illustration_document_id).toBeNull();
    });

    it('should convert only illustration_document_id when logo_document_id is null', () => {
      const illustrationId = uuidv4();
      const service = {
        logo_document_id: null,
        illustration_document_id: illustrationId,
      };

      const result = withServiceInstanceGlobalIDs(service);

      expect(result.logo_document_id).toBeNull();
      expect(result.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
    });

    it('should return unchanged object when both IDs are null', () => {
      const service = {
        logo_document_id: null,
        illustration_document_id: null,
      };

      const result = withServiceInstanceGlobalIDs(service);

      expect(result.logo_document_id).toBeNull();
      expect(result.illustration_document_id).toBeNull();
    });

    it('should preserve additional properties on the input object', () => {
      const logoId = uuidv4();
      const service = {
        id: uuidv4(),
        name: 'Test Service',
        slug: 'test-service',
        logo_document_id: logoId,
        illustration_document_id: null,
      };

      const result = withServiceInstanceGlobalIDs(service);

      expect(result.id).toBe(service.id);
      expect(result.name).toBe(service.name);
      expect(result.slug).toBe(service.slug);
      expect(result.logo_document_id).toBe(toGlobalId('Document', logoId));
    });
  });
});
