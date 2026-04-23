import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  mockPlatformConfig,
  TestHelper,
} from '../../../tests/helper/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import {
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { ObjectUseCaseObjectId } from '../../model/kanel/public/ObjectUseCase';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { objectUseCaseDomain } from '../use-case/object-use-case/object-use-case.domain';
import { useCaseDomain } from '../use-case/use-case.domain';
import { NewsFeedApp } from './news-feed.app';

describe('newsFeedApp', () => {
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

  describe('createResourceNewsFeedItem', () => {
    let document: Document;
    const createdServiceInstanceIds: ServiceInstanceId[] = [];

    const subscribeToCustomDashboards = async () => {
      await TestHelper.subscription.create({
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
    };

    const createOpenCTIPlatform = async (platformId: string) => {
      const serviceInstance = await TestHelper.serviceInstance.create({
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      createdServiceInstanceIds.push(serviceInstance.id);
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstance.id,
        config: JSON.stringify({
          ...mockPlatformConfig,
          platform_id: platformId,
        }),
      });
      await TestHelper.subscription.create({
        service_instance_id: serviceInstance.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      return serviceInstance;
    };

    const createCustomDashboardNewsFeedItem = async () => {
      await NewsFeedApp.createResourceNewsFeedItem({
        document,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiCustomDashboards,
      });
    };

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
      for (const id of createdServiceInstanceIds) {
        await TestHelper.serviceConfiguration.delete({
          service_instance_id: id,
        });
        await TestHelper.serviceInstance.delete({ id });
      }
      await TestHelper.document.delete({});

      createdServiceInstanceIds.length = 0;
    });

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
      await createOpenCTIPlatform('platform-001');

      await createCustomDashboardNewsFeedItem();

      const items = await TestHelper.newsFeed.loadItems();
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        title: document.name,
      });
    });

    it('should provision the news feed item to all platforms with a platform_id', async () => {
      await subscribeToCustomDashboards();
      await createOpenCTIPlatform('platform-001');
      await createOpenCTIPlatform('platform-002');

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
      await createOpenCTIPlatform('valid-platform');

      const platformWithoutId = await TestHelper.serviceInstance.create({
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      createdServiceInstanceIds.push(platformWithoutId.id);
      await TestHelper.serviceConfiguration.create({
        service_instance_id: platformWithoutId.id,
        config: JSON.stringify({ token: 'some-token' }),
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
      await createOpenCTIPlatform('platform-001');

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
});
