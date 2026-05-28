import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockPlatformConfig,
  TestHelper,
} from '../../../tests/helper/test.helper';
import {
  requestContextSimpleUserSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  NewsFeedItemMetadataKey,
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import Document from '../../model/kanel/public/Document';
import { ObjectUseCaseObjectId } from '../../model/kanel/public/ObjectUseCase';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ProvisionedNewsFeedItemPlatformId } from '../../model/kanel/public/ProvisionedNewsFeedItem';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { objectUseCaseDomain } from '../use-case/object-use-case/object-use-case.domain';
import { useCaseDomain } from '../use-case/use-case.domain';
import { NewsFeedApp } from './news-feed.app';
import { NewsFeedDomain } from './news-feed.domain';

vi.mock('config', async (importOriginal) => {
  const mod = await importOriginal<{ default: typeof config }>();
  return {
    default: {
      get: vi.fn(mod.default.get.bind(mod.default)),
      has: mod.default.has.bind(mod.default),
    },
  };
});

const mockConfigGet = vi.mocked(config.get);

describe('newsFeedApp', () => {
  const createdServiceInstanceIds: ServiceInstanceId[] = [];

  const subscribeToCustomDashboards = async () => {
    await TestHelper.subscription.create({
      service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
    });
  };

  const createOpenCTIPlatformForOrganization = async (
    platformId: string,
    organizationId: OrganizationId
  ) => {
    const serviceInstance = await TestHelper.serviceInstance.create({
      service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
    });
    createdServiceInstanceIds.push(serviceInstance.id);
    await TestHelper.serviceConfiguration.create({
      service_instance_id: serviceInstance.id,
      config: {
        ...mockPlatformConfig,
        platform_id: platformId,
      },
    });
    await TestHelper.subscription.create({
      service_instance_id: serviceInstance.id,
      organization_id: organizationId,
    });
    return serviceInstance;
  };

  const cleanupCreatedServiceInstances = async () => {
    for (const id of createdServiceInstanceIds) {
      await TestHelper.subscription.delete({ service_instance_id: id });
      await TestHelper.serviceConfiguration.delete({ service_instance_id: id });
      await TestHelper.serviceInstance.delete({ id });
    }
    createdServiceInstanceIds.length = 0;
  };

  describe('consumeProvisionedNewsFeedItems', () => {
    const platformId = 'consume-test-platform-id';
    const token = 'consume-test-token';
    let registrationServiceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      const serviceInstance = await TestHelper.serviceInstance.create({
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      registrationServiceInstanceId = serviceInstance.id;
      await TestHelper.serviceConfiguration.create({
        service_instance_id: registrationServiceInstanceId,
        config: {
          ...mockPlatformConfig,
          platform_id: platformId,
          token,
        },
      });
    });

    afterEach(async () => {
      await TestHelper.newsFeed.deleteItem();
      await TestHelper.serviceConfiguration.delete({
        service_instance_id: registrationServiceInstanceId,
      });
      await TestHelper.serviceInstance.delete({
        id: registrationServiceInstanceId,
      });
    });

    it('should throw when platformId is null', async () => {
      await expect(
        NewsFeedApp.consumeProvisionedNewsFeedItems({
          platformId: null,
          token,
        })
      ).rejects.toThrow(ErrorCode.InvalidPlatformId);
    });

    it('should throw when token is null', async () => {
      await expect(
        NewsFeedApp.consumeProvisionedNewsFeedItems({
          platformId,
          token: null,
        })
      ).rejects.toThrow(ErrorCode.InvalidPlatformId);
    });

    it('should throw when no service configuration matches platformId and token', async () => {
      await expect(
        NewsFeedApp.consumeProvisionedNewsFeedItems({
          platformId: 'unknown-platform',
          token: 'unknown-token',
        })
      ).rejects.toThrow(ErrorCode.PlatformNotRegistered);
    });

    it('should return empty news feed items and available types when nothing is provisioned', async () => {
      const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
        platformId,
        token,
      });

      expect(result.news_feed_items).toHaveLength(0);
      expect(result.available_news_feed_types).toContain(
        NewsFeedItemType.ResourceCustomDashboard
      );
    });

    it('should return provisioned items and consume them (remove from provisioned table)', async () => {
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard A',
        creation_date: new Date(),
        tags: ['tag1'],
      });
      const item2 = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard B',
        creation_date: new Date(),
        tags: [],
      });

      await NewsFeedDomain.provisionNewsFeedItem(item.id, [platformId]);
      await NewsFeedDomain.provisionNewsFeedItem(item2.id, [platformId]);

      const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
        platformId,
        token,
      });

      expect(result.news_feed_items).toHaveLength(2);
      expect(result.news_feed_items.map((i) => i.title)).toEqual(
        expect.arrayContaining(['Dashboard A', 'Dashboard B'])
      );

      const remaining = await TestHelper.newsFeed.loadProvisioned({});
      expect(remaining).toHaveLength(0);
    });

    it('should return correct tags and metadata for provisioned items', async () => {
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Tagged Dashboard',
        creation_date: new Date(),
        tags: ['threat-intel', 'malware'],
      });
      await NewsFeedDomain.provisionNewsFeedItem(item.id, [platformId]);

      const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
        platformId,
        token,
      });

      expect(result.news_feed_items).toHaveLength(1);
      expect(result.news_feed_items[0]).toMatchObject({
        title: 'Tagged Dashboard',
        type: NewsFeedItemType.ResourceCustomDashboard,
        tags: expect.arrayContaining(['threat-intel', 'malware']),
        metadata: [],
      });
    });

    it('should only return items provisioned for the requesting platform', async () => {
      const otherPlatformId = 'other-platform-id';
      const itemForOther = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Other Platform Dashboard',
        creation_date: new Date(),
        tags: [],
      });
      const itemForCurrent = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Current Platform Dashboard',
        creation_date: new Date(),
        tags: [],
      });
      await NewsFeedDomain.provisionNewsFeedItem(itemForOther.id, [
        otherPlatformId,
      ]);
      await NewsFeedDomain.provisionNewsFeedItem(itemForCurrent.id, [
        platformId,
      ]);

      const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
        platformId,
        token,
      });

      expect(result.news_feed_items).toHaveLength(1);
      expect(result.news_feed_items[0]?.title).toBe(
        'Current Platform Dashboard'
      );

      const remainingOther = await TestHelper.newsFeed.loadProvisioned({
        platform_id: otherPlatformId as ProvisionedNewsFeedItemPlatformId,
      });
      expect(remainingOther).toHaveLength(1);
    });

    it('should return available_news_feed_types for the OpenCTI platform', async () => {
      const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
        platformId,
        token,
      });

      expect(result.available_news_feed_types).toEqual(
        expect.arrayContaining([NewsFeedItemType.ResourceCustomDashboard])
      );
    });

    it('should not return document_id metadata key in consumed response', async () => {
      const document = await TestHelper.document.create({
        name: 'Metadata Filter Dashboard',
      });

      try {
        const item = await NewsFeedDomain.createResourceNewsFeedItem({
          document,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
          type: NewsFeedItemType.ResourceCustomDashboard,
          platformIdentifier: PlatformIdentifier.Opencti,
          tags: [],
        });
        await NewsFeedDomain.provisionNewsFeedItem(item.id, [platformId]);

        const result = await NewsFeedApp.consumeProvisionedNewsFeedItems({
          platformId,
          token,
        });

        expect(result.news_feed_items).toHaveLength(1);
        expect(result.news_feed_items[0]?.metadata).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ key: NewsFeedItemMetadataKey.UrlPath }),
          ])
        );
        expect(result.news_feed_items[0]?.metadata).toEqual(
          expect.not.arrayContaining([
            expect.objectContaining({
              key: NewsFeedItemMetadataKey.DocumentId,
            }),
          ])
        );
      } finally {
        await TestHelper.document.delete({ id: document.id });
      }
    });
  });

  describe('isNewsFeedConfigured', () => {
    it.each`
      identifier                                             | expected | description
      ${ServiceDefinitionIdentifier.OpenctiCustomDashboards} | ${true}  | ${'configured service definition'}
      ${ServiceDefinitionIdentifier.OpenctiIntegrations}     | ${false} | ${'non-configured service definition'}
      ${ServiceDefinitionIdentifier.OpenctiRegistration}     | ${false} | ${'registration identifier'}
      ${ServiceDefinitionIdentifier.Vault}                   | ${false} | ${'vault identifier'}
      ${ServiceDefinitionIdentifier.OpenaevScenarios}        | ${false} | ${'openaev scenarios identifier'}
    `(
      'should return $expected for $description ($identifier)',
      ({
        identifier,
        expected,
      }: {
        identifier: ServiceDefinitionIdentifier;
        expected: boolean;
      }) => {
        expect(NewsFeedApp.isNewsFeedConfigured(identifier)).toBe(expected);
      }
    );
  });

  describe('resource news feed item', () => {
    let document: Document;

    beforeEach(async () => {
      document = await TestHelper.document.create({
        name: 'My Custom Dashboard',
      });
    });

    afterEach(async () => {
      await objectUseCaseDomain.deleteObjectUseCaseBy({});
      await TestHelper.useCase.delete({});
      await TestHelper.newsFeed.deleteItem();
      await TestHelper.subscription.delete({
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      });
      await cleanupCreatedServiceInstances();
      await TestHelper.document.delete({});
    });

    describe('createResourceNewsFeedItem', () => {
      const createCustomDashboardNewsFeedItem = async () => {
        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });
      };

      it('should do nothing when the service definition is not configured', async () => {
        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiIntegrations,
        });

        const items = await TestHelper.newsFeed.loadItems();
        expect(items).toHaveLength(0);
      });

      it('should create a news feed item with the correct type and platform identifier', async () => {
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'platform-001',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        await createCustomDashboardNewsFeedItem();

        const items = await TestHelper.newsFeed.loadItems();
        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
          type: NewsFeedItemType.ResourceCustomDashboard,
          platform_identifier: PlatformIdentifier.Opencti,
          title: document.name,
        });
      });

      it('should provision the news feed item to all platforms with a platform_id', async () => {
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'platform-001',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );
        await createOpenCTIPlatformForOrganization(
          'platform-002',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        await createCustomDashboardNewsFeedItem();

        const newsFeedItem = await TestHelper.newsFeed.loadFirstItem();
        const provisioned = await TestHelper.newsFeed.loadProvisioned({
          news_feed_item_id: newsFeedItem!.id,
        });

        expect(provisioned).toHaveLength(2);
        expect(provisioned.map((p) => p.platform_id)).toEqual(
          expect.arrayContaining(['platform-001', 'platform-002'])
        );
      });

      it('should create the news feed item but no provisioned records when no organizations are subscribed', async () => {
        await createCustomDashboardNewsFeedItem();

        const newsFeedItem = await TestHelper.newsFeed.loadFirstItem();
        expect(newsFeedItem).toBeDefined();

        const provisioned = await TestHelper.newsFeed.loadProvisioned({});
        expect(provisioned).toHaveLength(0);
      });

      it('should filter out platforms that have no platform_id in their config', async () => {
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'valid-platform',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        const platformWithoutId = await TestHelper.serviceInstance.create({
          service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
        });
        createdServiceInstanceIds.push(platformWithoutId.id);
        await TestHelper.serviceConfiguration.create({
          service_instance_id: platformWithoutId.id,
          config: { token: 'some-token' },
        });
        await TestHelper.subscription.create({
          service_instance_id: platformWithoutId.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });

        await createCustomDashboardNewsFeedItem();

        const newsFeedItem = await TestHelper.newsFeed.loadFirstItem();
        const provisioned = await TestHelper.newsFeed.loadProvisioned({
          news_feed_item_id: newsFeedItem!.id,
        });

        expect(provisioned).toHaveLength(1);
        expect(provisioned[0]?.platform_id).toBe('valid-platform');
      });

      it('should populate tags from use cases linked to the document', async () => {
        // Given
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'platform-001',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        const useCaseA = await useCaseDomain.insertUseCase({
          name: 'Use Case Alpha',
          color: '#FF0000',
        });
        const useCaseB = await useCaseDomain.insertUseCase({
          name: 'Use Case Beta',
          color: '#00FF00',
        });

        await objectUseCaseDomain.insertObjectUseCase({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
          use_case_id: useCaseA.id,
        });
        await objectUseCaseDomain.insertObjectUseCase({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
          use_case_id: useCaseB.id,
        });

        // When
        await createCustomDashboardNewsFeedItem();

        // Then
        const newsFeedItem = await TestHelper.newsFeed.loadFirstItem();
        expect(newsFeedItem).toMatchObject({
          tags: expect.arrayContaining(['Use Case Alpha', 'Use Case Beta']),
        });
      });
    });

    describe('updateResourceNewsFeedItem', () => {
      const updateCustomDashboardNewsFeedItem = async () => {
        await NewsFeedApp.updateResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });
      };

      it('should do nothing when the service definition is not configured', async () => {
        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        await NewsFeedApp.updateResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiIntegrations,
        });

        const items = await TestHelper.newsFeed.loadItems();
        expect(items).toHaveLength(1);
        expect(items[0]?.title).toBe('My Custom Dashboard');
      });

      it('should do nothing when no existing news feed item is found for the document', async () => {
        await updateCustomDashboardNewsFeedItem();

        const items = await TestHelper.newsFeed.loadItems();
        expect(items).toHaveLength(0);
      });

      it.each`
        updatedName                 | expectedTitle               | description
        ${'Updated Dashboard Name'} | ${'Updated Dashboard Name'} | ${'uses the new document name when provided'}
        ${null}                     | ${'My Custom Dashboard'}    | ${'falls back to the existing title when document name is null'}
      `(
        'should update title: $description',
        async ({
          updatedName,
          expectedTitle,
        }: {
          updatedName: string | null;
          expectedTitle: string;
        }) => {
          // Given
          await NewsFeedApp.createResourceNewsFeedItem({
            document,
            serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
            serviceDefinitionIdentifier:
              ServiceDefinitionIdentifier.OpenctiCustomDashboards,
          });
          document = { ...document, name: updatedName };

          // When
          await updateCustomDashboardNewsFeedItem();

          // Then
          const updatedItem = await TestHelper.newsFeed.loadFirstItem();
          expect(updatedItem?.title).toBe(expectedTitle);
        }
      );

      it('should provision the updated news feed item to all platforms subscribed to the service instance', async () => {
        // Given
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'update-platform-001',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );
        await createOpenCTIPlatformForOrganization(
          'update-platform-002',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Consume provisioned items so the table is empty before update
        const existingItem = await TestHelper.newsFeed.loadFirstItem();
        await TestHelper.newsFeed.loadProvisioned({
          news_feed_item_id: existingItem!.id,
        });

        // When
        await updateCustomDashboardNewsFeedItem();

        // Then
        const provisioned = await TestHelper.newsFeed.loadProvisioned({
          news_feed_item_id: existingItem!.id,
        });
        expect(provisioned).toHaveLength(2);
        expect(provisioned.map((p) => p.platform_id)).toEqual(
          expect.arrayContaining(['update-platform-001', 'update-platform-002'])
        );
      });

      it('should update tags from use cases linked to the document', async () => {
        // Given
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'update-platform-tags',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        const useCaseA = await useCaseDomain.insertUseCase({
          name: 'Use Case Gamma',
          color: '#FF0000',
        });
        const useCaseB = await useCaseDomain.insertUseCase({
          name: 'Use Case Delta',
          color: '#00FF00',
        });

        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        await objectUseCaseDomain.insertObjectUseCase({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
          use_case_id: useCaseA.id,
        });
        await objectUseCaseDomain.insertObjectUseCase({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
          use_case_id: useCaseB.id,
        });

        // When
        await updateCustomDashboardNewsFeedItem();

        // Then
        const updatedItem = await TestHelper.newsFeed.loadFirstItem();
        expect(updatedItem).toMatchObject({
          tags: expect.arrayContaining(['Use Case Gamma', 'Use Case Delta']),
        });
      });

      it('should not provision when no organizations are subscribed to the service instance', async () => {
        // Given
        await NewsFeedApp.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // When
        await updateCustomDashboardNewsFeedItem();

        // Then
        const provisioned = await TestHelper.newsFeed.loadProvisioned({});
        expect(provisioned).toHaveLength(0);
      });

      it('should not reprovision or update a soft-deleted item linked to the document', async () => {
        // Given
        await subscribeToCustomDashboards();
        await createOpenCTIPlatformForOrganization(
          'update-platform-deleted',
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

        const softDeletedItem = await NewsFeedDomain.createResourceNewsFeedItem(
          {
            document,
            serviceDefinitionIdentifier:
              ServiceDefinitionIdentifier.OpenctiCustomDashboards,
            type: NewsFeedItemType.ResourceCustomDashboard,
            platformIdentifier: PlatformIdentifier.Opencti,
            tags: ['before-delete'],
          }
        );
        await NewsFeedDomain.markNewsFeedItemAsDeleted(softDeletedItem.id);
        document = { ...document, name: 'Name after delete' };

        // When
        await updateCustomDashboardNewsFeedItem();

        // Then
        const itemAfterUpdate = await TestHelper.newsFeed.loadFirstItem({
          id: softDeletedItem.id,
        });
        expect(itemAfterUpdate).toMatchObject({
          id: softDeletedItem.id,
          is_deleted: true,
          title: softDeletedItem.title,
          tags: ['before-delete'],
        });

        const provisioned = await TestHelper.newsFeed.loadProvisioned({
          news_feed_item_id: softDeletedItem.id,
        });
        expect(provisioned).toHaveLength(0);
      });
    });

    describe('upsertResourceNewsFeed', () => {
      const serviceInstanceId = SERVICES.INSTANCES.CUSTOM_DASHBOARDS
        .ID as ServiceInstanceId;

      it('should do nothing when the service definition is not configured', async () => {
        // Given
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(false);
        const createResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'createResourceNewsFeedItem')
          .mockResolvedValue();
        const updateResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'updateResourceNewsFeedItem')
          .mockResolvedValue();

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: undefined,
          updatedDocument: { ...document, active: true },
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiIntegrations,
        });

        // Then
        expect(createResourceNewsFeedItemSpy).not.toHaveBeenCalled();
        expect(updateResourceNewsFeedItemSpy).not.toHaveBeenCalled();
      });

      it('should create a news feed item when document is created as active', async () => {
        // Given
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(true);
        const createResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'createResourceNewsFeedItem')
          .mockResolvedValue();
        const updateResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'updateResourceNewsFeedItem')
          .mockResolvedValue();

        const updatedDocument = { ...document, active: true };

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: undefined,
          updatedDocument,
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Then
        expect(createResourceNewsFeedItemSpy).toHaveBeenCalledOnce();
        expect(createResourceNewsFeedItemSpy).toHaveBeenCalledWith({
          document: updatedDocument,
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });
        expect(updateResourceNewsFeedItemSpy).not.toHaveBeenCalled();
      });

      it('should update the existing news feed item when document stays active', async () => {
        // Given
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(true);
        const createResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'createResourceNewsFeedItem')
          .mockResolvedValue();
        const updateResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'updateResourceNewsFeedItem')
          .mockResolvedValue();

        const updatedDocument = { ...document, active: true };

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: { ...document, active: true },
          updatedDocument,
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Then
        expect(updateResourceNewsFeedItemSpy).toHaveBeenCalledOnce();
        expect(updateResourceNewsFeedItemSpy).toHaveBeenCalledWith({
          document: updatedDocument,
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });
        expect(createResourceNewsFeedItemSpy).not.toHaveBeenCalled();
      });

      it('should do nothing when updated document is inactive', async () => {
        // Given
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(true);
        const createResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'createResourceNewsFeedItem')
          .mockResolvedValue();
        const updateResourceNewsFeedItemSpy = vi
          .spyOn(NewsFeedApp, 'updateResourceNewsFeedItem')
          .mockResolvedValue();

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: { ...document, active: true },
          updatedDocument: { ...document, active: false },
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Then
        expect(createResourceNewsFeedItemSpy).not.toHaveBeenCalled();
        expect(updateResourceNewsFeedItemSpy).not.toHaveBeenCalled();
      });

      it('should log creation failure message when create branch fails during creation flow', async () => {
        // Given
        const error = new Error('create-failed');
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(true);
        vi.spyOn(NewsFeedApp, 'createResourceNewsFeedItem').mockRejectedValue(
          error
        );
        const logErrorSpy = vi.spyOn(logApp, 'error').mockImplementation(() => {
          return;
        });

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: undefined,
          updatedDocument: { ...document, active: true },
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Then
        expect(logErrorSpy).toHaveBeenCalledWith(
          'Unable to create news feed item',
          {
            error,
            documentId: document.id,
            source: 'creation',
          }
        );
      });

      it('should log update-branch failure message when update fails during update flow', async () => {
        // Given
        const error = new Error('update-failed');
        vi.spyOn(NewsFeedApp, 'isNewsFeedConfigured').mockReturnValue(true);
        vi.spyOn(NewsFeedApp, 'updateResourceNewsFeedItem').mockRejectedValue(
          error
        );
        const logErrorSpy = vi.spyOn(logApp, 'error').mockImplementation(() => {
          return;
        });

        // When
        await NewsFeedApp.upsertResourceNewsFeed({
          documentBeforeUpdate: { ...document, active: true },
          updatedDocument: { ...document, active: true },
          serviceInstanceId,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        });

        // Then
        expect(logErrorSpy).toHaveBeenCalledWith(
          'Unable to update news feed item',
          {
            error,
            documentId: document.id,
            source: 'update',
          }
        );
      });
    });
  });

  describe('cleanExpiredNewsFeedItems', () => {
    const monthsAgo = (months: number): Date => {
      const date = new Date();
      date.setMonth(date.getMonth() - months);
      return date;
    };

    afterEach(async () => {
      await TestHelper.newsFeed.deleteItem();
      mockConfigGet.mockReset();
    });

    it('should delete items older than configured interval and keep recent ones', async () => {
      // Given
      const oldItem = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'old item',
        creation_date: monthsAgo(7),
        tags: [],
      });
      const recentItem = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'recent item',
        creation_date: monthsAgo(1),
        tags: [],
      });

      // When
      await NewsFeedApp.cleanExpiredNewsFeedItems();

      // Then
      const remaining = await TestHelper.newsFeed.loadItems();
      const remainingIds = remaining.map((i) => i.id);
      expect(remainingIds).not.toContain(oldItem.id);
      expect(remainingIds).toContain(recentItem.id);
    });

    it('should not throw when no items exist', async () => {
      await expect(
        NewsFeedApp.cleanExpiredNewsFeedItems()
      ).resolves.not.toThrow();
    });

    it('should throw when cleanup_interval_value is not a positive number', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'news_feed.cleanup_interval_value') return 'not-a-number';
        if (key === 'news_feed.cleanup_interval_unit') return 'days';
        return undefined;
      });

      await expect(NewsFeedApp.cleanExpiredNewsFeedItems()).rejects.toThrow(
        /Invalid config "news_feed.cleanup_interval_value"/
      );
    });

    it('should throw when cleanup_interval_unit is not a supported unit', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'news_feed.cleanup_interval_value') return 30;
        if (key === 'news_feed.cleanup_interval_unit') return 'weeks';
        return undefined;
      });

      await expect(NewsFeedApp.cleanExpiredNewsFeedItems()).rejects.toThrow(
        /Invalid config "news_feed.cleanup_interval_unit"/
      );
    });
  });

  describe('deleteNewsFeedItem', () => {
    beforeEach(() => {
      requestContext.set(requestContextSimpleUserSecondOrga);
    });

    afterEach(async () => {
      await TestHelper.newsFeed.deleteItem();
      await cleanupCreatedServiceInstances();
    });

    it('should throw when the news feed item does not exist', async () => {
      await expect(
        NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: uuidv4() })
      ).rejects.toThrow(ErrorCode.NewsFeedItemNotFound);
    });

    it('should mark the news feed item as deleted', async () => {
      // Given
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard to delete',
        creation_date: new Date(),
        tags: [],
      });

      // When
      await NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: item.id });

      // Then
      const updated = await TestHelper.newsFeed.loadFirstItem({ id: item.id });
      expect(updated?.is_deleted).toBe(true);
    });

    it('should provision the deleted item to all registered OpenCTI platforms', async () => {
      // Given
      await createOpenCTIPlatformForOrganization(
        'delete-platform-001',
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
      await createOpenCTIPlatformForOrganization(
        'delete-platform-002',
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard to delete',
        creation_date: new Date(),
        tags: [],
      });

      // When
      await NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: item.id });

      // Then
      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: item.id,
      });
      expect(provisioned).toHaveLength(2);
      expect(provisioned.map((p) => p.platform_id)).toEqual(
        expect.arrayContaining(['delete-platform-001', 'delete-platform-002'])
      );
    });

    it('should not provision when no registered platforms exist', async () => {
      // Given
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard with no platforms',
        creation_date: new Date(),
        tags: [],
      });

      // When
      await NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: item.id });

      // Then
      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: item.id,
      });
      expect(provisioned).toHaveLength(0);
    });

    it('should provision the deleted item to a platform belonging to a different organization than the context one', async () => {
      // Given — context is SECOND_ORGANIZATION, but the platform is registered under FILIGRAN
      await createOpenCTIPlatformForOrganization(
        'delete-other-org-platform',
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard for other org',
        creation_date: new Date(),
        tags: [],
      });

      // When
      await NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: item.id });

      // Then — the item is provisioned cross-org because deleteNewsFeedItem targets all registered platforms
      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: item.id,
      });
      expect(provisioned).toHaveLength(1);
      expect(provisioned[0]?.platform_id).toBe('delete-other-org-platform');
    });

    it('should filter out registered platforms that have no platform_id in their config', async () => {
      // Given
      await createOpenCTIPlatformForOrganization(
        'delete-valid-platform',
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      const platformWithoutId = await TestHelper.serviceInstance.create({
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      createdServiceInstanceIds.push(platformWithoutId.id);
      await TestHelper.serviceConfiguration.create({
        service_instance_id: platformWithoutId.id,
        config: { token: 'some-token' },
      });

      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard filter test',
        creation_date: new Date(),
        tags: [],
      });

      // When
      await NewsFeedApp.deleteNewsFeedItem({ newsFeedItemId: item.id });

      // Then
      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: item.id,
      });
      expect(provisioned).toHaveLength(1);
      expect(provisioned[0]?.platform_id).toBe('delete-valid-platform');
    });
  });
});
