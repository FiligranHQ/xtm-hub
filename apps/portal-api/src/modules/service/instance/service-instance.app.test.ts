import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { v4 as uuidv4 } from 'uuid';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  mockPlatformConfig,
  TestHelper,
} from '../../../../tests/helper/test.helper';
import {
  contextRegistererUserSecondOrga,
  contextSimpleUserSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceJoinType,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceDefinition, {
  ServiceDefinitionId,
} from '../../../model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import * as pub from '../../../pub';
import * as securityGuardModule from '../../../security/guard';
import { ErrorCode } from '../../../utils/error/error.code';
import * as documentHelper from '../../document/document.helper';
import { GenericServiceCapabilityIds } from '../../security-management/service-capability/generic-service-capability.const';
import { subscriptionApp } from '../../subscription/subscription.app';
import * as subscriptionDomain from '../../subscription/subscription.domain';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import {
  ServiceInstanceApp,
  withServiceInstanceGlobalIDs,
} from './service-instance.app';
import * as serviceInstanceDomain from './service-instance.domain';

describe('service Instance app', () => {
  describe('loadServiceInstance', () => {
    let loadSubscriptionBySpy: MockInstance;
    let loadUserServiceBySpy: MockInstance;
    let loadServiceInstanceBySpy: MockInstance;
    let grantServiceAccessSpy: MockInstance;
    let subscribeOrganizationToServiceSpy: MockInstance;

    const mockServiceInstanceId = uuidv4() as ServiceInstanceId;
    const mockSubscriptionId = uuidv4() as SubscriptionId;
    const mockUserId = contextSimpleUserSecondOrga.user.id;

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
      subscribeOrganizationToServiceSpy = vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should load service instance when user already has access', async () => {
      // Given
      loadSubscriptionBySpy.mockResolvedValueOnce(mockSubscription);
      loadUserServiceBySpy.mockResolvedValueOnce([mockUserService]);
      loadServiceInstanceBySpy.mockResolvedValueOnce(mockServiceInstance);

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(loadSubscriptionBySpy).toHaveBeenCalledWith({
        service_instance_id: mockServiceInstanceId,
        organization_id:
          contextSimpleUserSecondOrga.user.selected_organization_id,
      });
      expect(loadUserServiceBySpy).toHaveBeenCalledWith({
        subscription_id: mockSubscriptionId,
        user_id: mockUserId,
      });
      expect(loadServiceInstanceBySpy).toHaveBeenCalledWith(
        'id',
        mockServiceInstanceId
      );
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
    });

    it('should auto-join user when subscription has AUTO_JOIN mode and user has no access', async () => {
      // Given
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);
      grantServiceAccessSpy.mockResolvedValue(undefined);

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        mockSubscriptionId
      );
    });

    it('should auto-join organization and user when service has JOIN_AUTO and user has no access', async () => {
      // Given
      loadSubscriptionBySpy.mockResolvedValue(null);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue({
        ...mockServiceInstance,
        join_type: ServiceInstanceJoinType.JoinAuto,
      });
      subscribeOrganizationToServiceSpy.mockResolvedValue({
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      });
      grantServiceAccessSpy.mockResolvedValue(undefined);
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01'));

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(subscribeOrganizationToServiceSpy).toHaveBeenCalledWith({
        organizationId:
          contextSimpleUserSecondOrga.user.selected_organization_id,
        serviceInstanceId: mockServiceInstanceId,
        startDate: new Date('2024-01-01'),
        endDate: null,
        capabilityIds: [],
      });
      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        mockSubscriptionId
      );
    });

    it('should use subscription from user organization, not from another organization', async () => {
      // Given
      const userOrganizationId =
        contextSimpleUserSecondOrga.user.selected_organization_id;
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

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(loadSubscriptionBySpy).toHaveBeenCalledWith({
        service_instance_id: mockServiceInstanceId,
        organization_id: userOrganizationId,
      });

      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        userOrgSubscriptionId
      );
      expect(loadServiceInstanceBySpy).toHaveBeenCalledBefore(
        loadSubscriptionBySpy
      );
    });

    it('should not auto-join user when subscription has INVITE_ONLY mode', async () => {
      // Given
      const inviteOnlySubscription = {
        ...mockSubscription,
        joining: 'INVITE_ONLY',
      };
      loadSubscriptionBySpy.mockResolvedValue(inviteOnlySubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple user services', async () => {
      // Given
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

      // When
      await ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        contextSimpleUserSecondOrga.user,
        mockServiceInstanceId
      );

      // Then
      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
    });

    it('should propagate errors from loadSubscriptionBy', async () => {
      // Given
      const error = new Error('Error');
      loadSubscriptionBySpy.mockRejectedValue(error);

      // When
      await expect(
        ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
          contextRegistererUserSecondOrga.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Error');

      // Then
      expect(loadUserServiceBySpy).not.toHaveBeenCalled();
      expect(subscribeOrganizationToServiceSpy).not.toHaveBeenCalled();
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
    });

    it('should propagate errors from grantServiceAccess', async () => {
      // Given
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      const error = new Error('Other error');
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      grantServiceAccessSpy.mockRejectedValue(error);

      // When
      await expect(
        ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
          contextSimpleUserSecondOrga.user,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Other error');
    });
  });

  describe('updatePlatformServiceMetadata', () => {
    let dispatchSpy: MockInstance;
    let uploadNewFileSpy: MockInstance;

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
    let serviceDefinition: ServiceDefinition;
    let serviceInstance: ServiceInstance;

    beforeEach(async () => {
      dispatchSpy = vi.spyOn(pub, 'dispatch').mockResolvedValue(undefined);
      uploadNewFileSpy = vi.spyOn(documentHelper, 'uploadNewFile');
      vi.spyOn(
        securityGuardModule.securityGuard,
        'assertUserIsAllowedOnOrganization'
      ).mockResolvedValue(undefined);
      serviceDefinition = await TestServiceHelper.serviceDefinition.create({
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });
      serviceInstance = await TestServiceHelper.serviceInstance.create({
        service_definition_id: serviceDefinition.id as ServiceDefinitionId,
      });
      await TestHelper.subscription.create({
        service_instance_id: serviceInstance.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      await TestServiceHelper.serviceConfiguration.create({
        service_instance_id: serviceInstance.id,
      });
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await TestServiceHelper.serviceConfiguration.delete({});
      await TestHelper.subscription.delete({});
      await TestServiceHelper.serviceInstance.delete({
        id: serviceInstance.id,
      });
      await TestServiceHelper.serviceDefinition.delete({
        id: serviceDefinition.id,
      });
    });

    it('should update name, sync config title, dispatch, and return RegisteredPlatform', async () => {
      // Given
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstance.id),
        name: 'Updated Platform Name',
      };

      // When
      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextRegistererUserSecondOrga.user,
        serviceInstance.id,
        input,
        null
      );

      // Then
      expect(result).toMatchObject({
        id: serviceInstance.id,
        title: 'Updated Platform Name',
        url: 'https://test.com',
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        'ServiceInstance',
        'edit',
        expect.objectContaining({
          id: serviceInstance.id,
          name: 'Updated Platform Name',
        })
      );
    });

    it('should upload illustration and include global document ID in response', async () => {
      // Given
      const illustrationId = uuidv4();
      uploadNewFileSpy.mockResolvedValue({
        id: illustrationId,
        name: 'illustration.png',
        mime_type: 'image/png',
      });
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstance.id),
        name: 'Updated Platform Name',
      };

      // When
      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextRegistererUserSecondOrga.user,
        serviceInstance.id,
        input,
        mockUpload
      );

      // Then
      expect(uploadNewFileSpy).toHaveBeenCalledWith(
        mockUpload,
        serviceInstance.id
      );
      expect(result.illustration_document_id).toBe(
        toGlobalId('Document', illustrationId)
      );
    });

    it('should not update service instance or config when no fields to update', async () => {
      // Given
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstance.id),
      };

      // When
      await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextRegistererUserSecondOrga.user,
        serviceInstance.id,
        input,
        null
      );

      // Then
      const unchangedInstance =
        await serviceInstanceDomain.loadServiceInstanceBy(
          'id',
          serviceInstance.id
        );
      expect(unchangedInstance.name).toBe('Default name serviceInstance');
    });

    it('should return null illustration_document_id when service instance has none', async () => {
      // Given
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstance.id),
        name: 'Updated Name',
      };

      // When
      const result = await ServiceInstanceApp.updatePlatformServiceMetadata(
        contextRegistererUserSecondOrga.user,
        serviceInstance.id,
        input,
        null
      );

      // Then
      expect(result.illustration_document_id).toBeNull();
    });

    it('should throw SERVICE_INSTANCE_NOT_FOUND when service instance does not exist', async () => {
      // Given
      const nonExistentId = uuidv4() as ServiceInstanceId;

      // When / Then
      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextRegistererUserSecondOrga.user,
          nonExistentId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', nonExistentId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow(ErrorCode.ServiceInstanceNotFound);
    });

    it('should throw SERVICE_DEFINITION_NOT_FOUND when service definition does not exist', async () => {
      // Cannot reproduce with real DB: loadPlatformServiceInstance filters by
      // ServiceDefinition.identifier, so a result is only returned when a
      // matching ServiceDefinition exists in the join.

      // Given
      const mockId = uuidv4() as ServiceInstanceId;
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformServiceInstance'
      ).mockResolvedValue({ id: mockId, name: 'Mock Platform' });
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);

      // When / Then
      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextRegistererUserSecondOrga.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should throw when user cannot modify platform service', async () => {
      // Given
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
        'assertUserIsAllowedOnOrganization'
      ).mockRejectedValue(undefined);

      // When / Then
      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextSimpleUserSecondOrga.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Name',
          },
          null
        )
      ).rejects.toThrow(ErrorCode.MissingCapabilityOnOrganization);
    });

    it('should throw when upload fails and not update service instance', async () => {
      // Given
      uploadNewFileSpy.mockRejectedValue(new Error('Upload failed'));
      const input: UpdatePlatformServiceMetadataInput = {
        serviceInstanceId: toGlobalId('ServiceInstance', serviceInstance.id),
        name: 'Updated Name',
      };

      // When
      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextRegistererUserSecondOrga.user,
          serviceInstance.id,
          input,
          mockUpload
        )
      ).rejects.toThrow('Upload failed');

      // Then
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should throw SERVICE_CONFIGURATION_NOT_FOUND when config is missing after update', async () => {
      // Cannot reproduce with real DB: simulates a race condition where the
      // configuration is deleted between the update transaction and the
      // response-building query.

      // Given
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

      // When / Then
      await expect(
        ServiceInstanceApp.updatePlatformServiceMetadata(
          contextRegistererUserSecondOrga.user,
          mockId,
          {
            serviceInstanceId: toGlobalId('ServiceInstance', mockId),
            name: 'Updated',
          },
          null
        )
      ).rejects.toThrow(ErrorCode.ServiceConfigurationNotFound);
    });
  });

  describe('loadLinkServiceInstancesByTags', () => {
    it('should load service instances links with tags', async () => {
      // When
      const serviceInstances =
        await ServiceInstanceApp.loadLinkServiceInstancesByTags([
          ServiceInstanceTag.OpenCti,
          ServiceInstanceTag.Trial,
        ]);

      // Then
      expect(serviceInstances).toHaveLength(3);
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
    afterAll(async () => {
      await TestServiceHelper.serviceInstance.delete({
        slug: 'test-seo-slug-with-docs',
      });
      await TestServiceHelper.serviceInstance.delete({
        slug: 'test-seo-slug-no-docs',
      });
    });
    it('should return the service instance with global document IDs', async () => {
      // Given
      const slug = 'test-seo-slug-with-docs';
      const logoId = uuidv4() as DocumentId;
      const illustrationId = uuidv4();

      // logo_document_id has a FK to Document, so insert the document first
      await TestDocumentHelper.document.create({ id: logoId, type: 'logo' });

      await TestServiceHelper.serviceInstance.create({
        name: 'Test SEO Service',
        slug,
        logo_document_id: logoId,
        tags: [ServiceInstanceTag.OpenCti],
        illustration_document_id: illustrationId,
      });

      // When
      const result = await ServiceInstanceApp.loadSeoServiceInstance(slug);

      // Then
      expect(result).toMatchObject({
        name: 'Test SEO Service',
        logo_document_id: toGlobalId('Document', logoId),
        illustration_document_id: toGlobalId('Document', illustrationId),
        tags: [ServiceInstanceTag.OpenCti],
      });
    });

    it('should throw NotFoundError when the slug does not match any service', async () => {
      // When / Then
      await expect(
        ServiceInstanceApp.loadSeoServiceInstance('non-existent-slug')
      ).rejects.toThrow(ErrorCode.ServiceNotFound);
    });

    it('should handle null document IDs without converting them', async () => {
      // Given
      const slug = 'test-seo-slug-no-docs';
      await TestServiceHelper.serviceInstance.create({
        name: 'Test SEO Service No Docs',
        slug,
      });
      // When
      const result = await ServiceInstanceApp.loadSeoServiceInstance(slug);

      // Then
      expect(result.logo_document_id).toBeNull();
      expect(result.illustration_document_id).toBeNull();
    });
  });

  describe('loadSeoServiceInstances', () => {
    const logoId = uuidv4() as DocumentId;
    const illustrationId = uuidv4();
    const firstServiceInstancePublicId = uuidv4() as ServiceInstanceId;
    const secondServiceInstancePublicId = uuidv4() as ServiceInstanceId;
    const privateServiceInstanceId = uuidv4() as ServiceInstanceId;
    afterAll(async () => {
      await TestServiceHelper.serviceInstance.delete({
        id: firstServiceInstancePublicId,
      });
      await TestServiceHelper.serviceInstance.delete({
        id: secondServiceInstancePublicId,
      });
      await TestServiceHelper.serviceInstance.delete({
        id: privateServiceInstanceId,
      });
      await TestDocumentHelper.document.delete({ id: logoId });
    });
    it('should return public service instances with document IDs converted to global IDs', async () => {
      // Given
      await TestDocumentHelper.document.create({ id: logoId, type: 'logo' });
      await TestServiceHelper.serviceInstance.create({
        id: firstServiceInstancePublicId,
        name: 'Test Public SEO Service',
        public: true,
        ordering: 100,
        logo_document_id: logoId,
        illustration_document_id: illustrationId,
      });

      // When
      const results = await ServiceInstanceApp.loadSeoServiceInstances();
      const result = results.find(
        ({ id }) => id === firstServiceInstancePublicId
      );

      // Then
      expect(result).toMatchObject({
        logo_document_id: toGlobalId('Document', logoId),
        illustration_document_id: toGlobalId('Document', illustrationId),
      });
    });

    it('should not include non-public service instances', async () => {
      // Given
      await TestServiceHelper.serviceInstance.create({
        id: privateServiceInstanceId,
        name: 'Non-public service',
        public: false,
      });

      // When
      const results = await ServiceInstanceApp.loadSeoServiceInstances();

      // Then
      expect(
        results.find(({ id }) => id === privateServiceInstanceId)
      ).toBeUndefined();
    });

    it('should return instances ordered by ordering field ascending', async () => {
      // Given
      await TestServiceHelper.serviceInstance.create({
        id: secondServiceInstancePublicId,
        name: 'Test Public SEO Service',
        public: true,
        ordering: 200,
        logo_document_id: logoId,
        illustration_document_id: illustrationId,
      });

      // When
      const results = await ServiceInstanceApp.loadSeoServiceInstances();
      const firstIndex = results.findIndex(
        ({ id }) => id === firstServiceInstancePublicId
      );
      const secondIndex = results.findIndex(
        ({ id }) => id === secondServiceInstancePublicId
      );

      // Then
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
      updateServiceInstanceSpy.mockResolvedValue(mockUpdatedServiceInstance);
      dispatchSpy.mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should upload a logo, update the service instance, and dispatch an edit event', async () => {
      // Given
      uploadNewFileSpy.mockResolvedValue(mockUploadedDocument);

      // When
      await ServiceInstanceApp.addServicePicture(
        mockServiceInstanceId,
        mockUpload,
        true
      );

      // Then
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
    });

    it('should update illustration_document_id when isLogo is false', async () => {
      // Given
      uploadNewFileSpy.mockResolvedValue(mockUploadedDocument);

      // When
      await ServiceInstanceApp.addServicePicture(
        mockServiceInstanceId,
        mockUpload,
        false
      );

      // Then
      expect(updateServiceInstanceSpy).toHaveBeenCalledWith(
        mockServiceInstanceId,
        { illustration_document_id: mockDocumentId }
      );
      expect(uploadNewFileSpy).toHaveBeenCalledWith(
        mockUpload,
        mockServiceInstanceId
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        'ServiceInstance',
        'edit',
        mockUpdatedServiceInstance
      );
    });

    it('should throw a mapped GraphQL error when upload fails', async () => {
      // Given
      uploadNewFileSpy.mockRejectedValue(new Error('Upload failed'));

      // When
      await expect(
        ServiceInstanceApp.addServicePicture(
          mockServiceInstanceId,
          mockUpload,
          true
        )
      ).rejects.toThrow();

      // Then
      expect(updateServiceInstanceSpy).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('withServiceInstanceGlobalIDs', () => {
    it.each`
      logoId      | illustrationId
      ${uuidv4()} | ${uuidv4()}
      ${uuidv4()} | ${null}
      ${null}     | ${uuidv4()}
      ${null}     | ${null}
    `(
      'should return convert logoId if $logoId and illustrationId if $illustrationId',
      ({ logoId, illustrationId }) => {
        const service = {
          logo_document_id: logoId,
          illustration_document_id: illustrationId,
          name: 'Test Service',
          slug: 'test-service',
        };

        // When
        const result = withServiceInstanceGlobalIDs(service);

        // Then
        expect(result).toMatchObject({
          logo_document_id: logoId ? toGlobalId('Document', logoId) : null,
          illustration_document_id: illustrationId
            ? toGlobalId('Document', illustrationId)
            : null,
          // And preserve original fields
          name: service.name,
          slug: service.slug,
        });
      }
    );
  });
});
