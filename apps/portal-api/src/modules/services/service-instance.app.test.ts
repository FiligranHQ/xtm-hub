import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextBypassUser } from '../../../tests/tests.const';
import {
  PlatformContract,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import * as securityGuard from '../../security/guard';
import * as subscriptionDomain from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { UserServiceDomain } from '../user_service/user_service.domain';
import * as documentHelper from './document/document.helper';
import { PlatformConfiguration } from './registration/registration.domain';
import { serviceInstanceApp } from './service-instance.app';
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

      const result = await serviceInstanceApp.loadServiceInstance(
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

      const result = await serviceInstanceApp.loadServiceInstance(
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

      await serviceInstanceApp.loadServiceInstance(
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

      const result = await serviceInstanceApp.loadServiceInstance(
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

      const result = await serviceInstanceApp.loadServiceInstance(
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
        serviceInstanceApp.loadServiceInstance(
          contextBypassUser.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Error');

      expect(loadUserServiceBySpy).not.toHaveBeenCalled();
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
        serviceInstanceApp.loadServiceInstance(
          contextBypassUser.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Other error');
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

      await serviceInstanceApp.loadServiceInstance(
        differentContext.user,
        mockServiceInstanceId
      );

      expect(loadUserServiceBySpy).toHaveBeenCalledWith({
        subscription_id: mockSubscriptionId,
        user_id: differentUserId,
      });
    });

    describe('updatePlatformServiceMetadata', () => {
      let loadPlatformServiceInstanceSpy: MockInstance;
      let loadServiceDefinitionByServiceInstanceSpy: MockInstance;
      let assertUserCanModifyPlatformServiceSpy: MockInstance;
      let uploadNewFileSpy: MockInstance;
      let updateServiceInstanceSpy: MockInstance;
      let loadPlatformConfigurationByServiceInstanceIdSpy: MockInstance;
      let updatePlatformConfigurationByServiceInstanceIdSpy: MockInstance;

      const mockServiceInstanceId = uuidv4() as ServiceInstanceId;
      const mockDocumentId = uuidv4();
      const globalServiceInstanceId = toGlobalId(
        'ServiceInstance',
        mockServiceInstanceId
      );

      const mockServiceInstance = {
        id: mockServiceInstanceId,
        name: 'Test Service',
        description: 'Test Description',
        service_definition_id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockServiceDefinition = {
        id: uuidv4(),
        identifier: 'test-service',
        name: 'Test Service Definition',
        platform_type: 'CONNECTOR',
      };

      const mockDocument = {
        id: mockDocumentId,
        name: 'test-image.png',
        mime_type: 'image/png',
        size: 12345,
      };

      const mockFileUpload: FileUpload = {
        filename: 'test-image.png',
        mimetype: 'image/png',
        encoding: '7bit',
        createReadStream: vi.fn(),
      };

      const mockUpload = {
        file: mockFileUpload,
        promise: Promise.resolve(mockFileUpload),
      };

      const mockInput: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: globalServiceInstanceId,
        name: 'Updated Service Name',
      };

      const mockPlatformConfig: PlatformConfiguration = {
        registerer_id: contextBypassUser.user.id,
        platform_id: 'test-platform',
        platform_title: 'Test Platform',
        platform_url: 'https://test.com',
        platform_contract: PlatformContract.Ee,
        platform_version: '1.0.0',
        token: 'test-token',
      };

      const mockServiceConfiguration = {
        id: uuidv4(),
        service_instance_id: mockServiceInstanceId,
        config: mockPlatformConfig,
      };

      beforeEach(() => {
        loadPlatformServiceInstanceSpy = vi.spyOn(
          serviceInstanceDomain,
          'loadPlatformServiceInstance'
        );
        loadServiceDefinitionByServiceInstanceSpy = vi.spyOn(
          serviceInstanceDomain,
          'loadServiceDefinitionByServiceInstance'
        );
        assertUserCanModifyPlatformServiceSpy = vi.spyOn(
          securityGuard.securityGuard,
          'assertUserCanModifyPlatformService'
        );
        uploadNewFileSpy = vi.spyOn(documentHelper, 'uploadNewFile');
        updateServiceInstanceSpy = vi.spyOn(
          serviceInstanceDomain,
          'updateServiceInstance'
        );
        loadPlatformConfigurationByServiceInstanceIdSpy = vi.spyOn(
          serviceInstanceDomain,
          'loadPlatformConfigurationByServiceInstanceId'
        );
        updatePlatformConfigurationByServiceInstanceIdSpy = vi.spyOn(
          serviceInstanceDomain,
          'updatePlatformConfigurationByServiceInstanceId'
        );
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('should update platform service metadata with name only', async () => {
        const updatedServiceInstance = {
          ...mockServiceInstance,
          name: mockInput.name,
        };

        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        updateServiceInstanceSpy.mockResolvedValue(updatedServiceInstance);
        loadPlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );
        updatePlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );

        const result = await serviceInstanceApp.updatePlatformServiceMetadata(
          mockInput,
          null
        );

        expect(loadPlatformServiceInstanceSpy).toHaveBeenCalledWith(
          contextBypassUser.user.selected_organization_id,
          mockServiceInstanceId
        );
        expect(loadServiceDefinitionByServiceInstanceSpy).toHaveBeenCalledWith(
          mockServiceInstanceId
        );
        expect(assertUserCanModifyPlatformServiceSpy).toHaveBeenCalledWith(
          contextBypassUser.user,
          mockServiceDefinition
        );
        expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
          mockServiceInstanceId,
          { name: mockInput.name }
        );
        expect(
          updatePlatformConfigurationByServiceInstanceIdSpy
        ).toHaveBeenCalledWith(mockServiceInstanceId, {
          ...mockPlatformConfig,
          platform_title: mockInput.name,
        });
        expect(result).toEqual({
          ...updatedServiceInstance,
          identifier: mockServiceDefinition.identifier,
        });
      });

      it('should update platform service metadata with name and upload', async () => {
        const updatedServiceInstance = {
          ...mockServiceInstance,
          name: mockInput.name,
          illustration_document_id: mockDocumentId,
        };

        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        uploadNewFileSpy.mockResolvedValue(mockDocument);
        updateServiceInstanceSpy.mockResolvedValue(updatedServiceInstance);
        loadPlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );
        updatePlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );

        const result = await serviceInstanceApp.updatePlatformServiceMetadata(
          mockInput,
          mockUpload
        );

        expect(uploadNewFileSpy).toHaveBeenCalledWith(
          mockUpload,
          mockServiceInstance.id
        );
        expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
          mockServiceInstanceId,
          {
            name: mockInput.name,
            illustration_document_id: mockDocumentId,
          }
        );
        expect(result).toEqual({
          ...updatedServiceInstance,
          identifier: mockServiceDefinition.identifier,
        });
      });

      it('should update only upload without name', async () => {
        const inputWithoutName = {
          serviceInstanceId: globalServiceInstanceId,
        };
        const updatedServiceInstance = {
          ...mockServiceInstance,
          illustration_document_id: mockDocumentId,
        };

        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        uploadNewFileSpy.mockResolvedValue(mockDocument);
        updateServiceInstanceSpy.mockResolvedValue(updatedServiceInstance);
        loadPlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );

        const result = await serviceInstanceApp.updatePlatformServiceMetadata(
          inputWithoutName,
          mockUpload
        );

        expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
          mockServiceInstanceId,
          { illustration_document_id: mockDocumentId }
        );
        expect(
          updatePlatformConfigurationByServiceInstanceIdSpy
        ).not.toHaveBeenCalled();
        expect(result).toEqual({
          ...updatedServiceInstance,
          identifier: mockServiceDefinition.identifier,
        });
      });

      it('should throw error when service instance not found', async () => {
        loadPlatformServiceInstanceSpy.mockResolvedValue(null);

        await expect(
          serviceInstanceApp.updatePlatformServiceMetadata(mockInput, null)
        ).rejects.toThrow();

        expect(
          loadServiceDefinitionByServiceInstanceSpy
        ).not.toHaveBeenCalled();
        expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      });

      it('should throw error when service definition not found', async () => {
        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(null);

        await expect(
          serviceInstanceApp.updatePlatformServiceMetadata(mockInput, null)
        ).rejects.toThrow();

        expect(assertUserCanModifyPlatformServiceSpy).not.toHaveBeenCalled();
        expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      });

      it('should throw error when user cannot modify platform service', async () => {
        const securityError = new Error('Insufficient permissions');
        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockRejectedValue(securityError);

        await expect(
          serviceInstanceApp.updatePlatformServiceMetadata(mockInput, null)
        ).rejects.toThrow('Insufficient permissions');

        expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      });

      it('should handle upload error and rollback transaction', async () => {
        const uploadError = new Error('Upload failed');
        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        uploadNewFileSpy.mockRejectedValue(uploadError);

        await expect(
          serviceInstanceApp.updatePlatformServiceMetadata(
            mockInput,
            mockUpload
          )
        ).rejects.toThrow('Upload failed');

        expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      });

      it('should handle case when no configuration exists for platform title update', async () => {
        const updatedServiceInstance = {
          ...mockServiceInstance,
          name: mockInput.name,
        };

        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        updateServiceInstanceSpy.mockResolvedValue(updatedServiceInstance);
        loadPlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(null);

        const result = await serviceInstanceApp.updatePlatformServiceMetadata(
          mockInput,
          null
        );

        expect(
          updatePlatformConfigurationByServiceInstanceIdSpy
        ).not.toHaveBeenCalled();
        expect(result).toEqual({
          ...updatedServiceInstance,
          identifier: mockServiceDefinition.identifier,
        });
      });

      it('should handle null upload without updating illustration', async () => {
        const updatedServiceInstance = {
          ...mockServiceInstance,
          name: mockInput.name,
        };

        loadPlatformServiceInstanceSpy.mockResolvedValue(mockServiceInstance);
        loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(
          mockServiceDefinition
        );
        assertUserCanModifyPlatformServiceSpy.mockResolvedValue(undefined);
        updateServiceInstanceSpy.mockResolvedValue(updatedServiceInstance);
        loadPlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );
        updatePlatformConfigurationByServiceInstanceIdSpy.mockResolvedValue(
          mockServiceConfiguration
        );

        const result = await serviceInstanceApp.updatePlatformServiceMetadata(
          mockInput,
          null
        );

        // uploadNewFile should not be called with null upload
        expect(uploadNewFileSpy).not.toHaveBeenCalled();

        // Only name should be updated, no illustration_document_id
        expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
          mockServiceInstanceId,
          { name: mockInput.name }
        );

        expect(result).toEqual({
          ...updatedServiceInstance,
          identifier: mockServiceDefinition.identifier,
        });
      });
    });
  });

  describe('loadLinkServiceInstancesByTags', () => {
    it('should load service instances links with tags', async () => {
      const serviceInstances =
        await serviceInstanceApp.loadLinkServiceInstancesByTags([
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
});
