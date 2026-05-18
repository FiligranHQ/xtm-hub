import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  NewsFeedItemMetadataKey,
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import { NewsFeedItemId } from '../../model/kanel/public/NewsFeedItem';
import { ProvisionedNewsFeedItemPlatformId } from '../../model/kanel/public/ProvisionedNewsFeedItem';
import { BadRequestErrorCode } from '../../utils/error/error.code';
import { NewsFeedDomain } from './news-feed.domain';

describe('newsFeedDomain', () => {
  const tags = ['threat-intel', 'malware'];

  beforeEach(async () => {
    await TestHelper.newsFeed.deleteItem();
  });

  describe('loadAvailableNewsFeedTypes', () => {
    it('should return news feed types for OpenCTI platform', () => {
      const result = NewsFeedDomain.loadAvailableNewsFeedTypes(
        PlatformIdentifier.Opencti
      );

      expect(result).toContain(NewsFeedItemType.ResourceCustomDashboard);
    });

    it('should return empty array for a platform with no configured news feed types', () => {
      const result = NewsFeedDomain.loadAvailableNewsFeedTypes(
        'UnknownIdentifier' as PlatformIdentifier
      );

      expect(result).toEqual([]);
    });
  });

  describe('loadAndConsumeProvisionedNewsFeedItems', () => {
    it('should return provisioned items with their metadata and remove them from the provisioned table', async () => {
      // Given
      const platformId = uuidv4();
      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Test dashboard',
        creation_date: new Date(),
        tags: [],
      });

      await NewsFeedDomain.provisionNewsFeedItem(item.id, [platformId]);

      // When
      const result =
        await NewsFeedDomain.loadAndConsumeProvisionedNewsFeedItems(platformId);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: item.id,
        type: NewsFeedItemType.ResourceCustomDashboard,
        title: 'Test dashboard',
      });
      expect(result[0]?.metadata).toBeDefined();

      const remainingProvisioned = await TestHelper.newsFeed.loadProvisioned({
        platform_id: platformId as ProvisionedNewsFeedItemPlatformId,
      });
      expect(remainingProvisioned).toHaveLength(0);
    });

    it('should return empty array when no items are provisioned for the platform', async () => {
      const result =
        await NewsFeedDomain.loadAndConsumeProvisionedNewsFeedItems(uuidv4());

      expect(result).toEqual([]);
    });

    it('should not consume items provisioned for a different platform', async () => {
      // Given
      const platformId = uuidv4();
      const otherPlatformId = uuidv4();

      const item = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Test dashboard',
        creation_date: new Date(),
        tags: [],
      });

      await NewsFeedDomain.provisionNewsFeedItem(item.id, [otherPlatformId]);

      // When
      const result =
        await NewsFeedDomain.loadAndConsumeProvisionedNewsFeedItems(platformId);

      // Then
      expect(result).toEqual([]);

      const remainingProvisioned = await TestHelper.newsFeed.loadProvisioned({
        platform_id: otherPlatformId as ProvisionedNewsFeedItemPlatformId,
      });
      expect(remainingProvisioned).toHaveLength(1);
    });

    it('should return multiple items with their respective metadata', async () => {
      // Given
      const platformId = uuidv4();

      const item1 = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard 1',
        creation_date: new Date(),
        tags: [],
      });

      const item2 = await TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Dashboard 2',
        creation_date: new Date(),
        tags: [],
      });

      await NewsFeedDomain.provisionNewsFeedItem(item1.id, [platformId]);
      await NewsFeedDomain.provisionNewsFeedItem(item2.id, [platformId]);

      // When
      const result =
        await NewsFeedDomain.loadAndConsumeProvisionedNewsFeedItems(platformId);

      // Then
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(
        expect.arrayContaining([item1.id, item2.id])
      );

      const remainingProvisioned = await TestHelper.newsFeed.loadProvisioned({
        platform_id: platformId as ProvisionedNewsFeedItemPlatformId,
      });
      expect(remainingProvisioned).toHaveLength(0);
    });
  });

  describe('createResourceNewsFeedItem', () => {
    it('should throw an error when document name is missing', async () => {
      const document = await TestHelper.document.create();
      document.name = '' as typeof document.name;

      await expect(
        NewsFeedDomain.createResourceNewsFeedItem({
          document,
          serviceDefinitionIdentifier:
            ServiceDefinitionIdentifier.OpenctiCustomDashboards,
          type: NewsFeedItemType.ResourceCustomDashboard,
          platformIdentifier: PlatformIdentifier.Opencti,
          tags: [],
        })
      ).rejects.toThrow(BadRequestErrorCode.NewsFeedItemMissingTitle);
    });

    it('should create a news feed item with the document name as title', async () => {
      const document = await TestHelper.document.create({
        name: 'custom dashboard',
      });

      const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
        document,
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Opencti,
        tags,
      });

      expect(newsFeedItem).toMatchObject({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: document.name,
        tags,
      });
      expect(newsFeedItem.id).toBeDefined();
      expect(newsFeedItem.creation_date).toEqual(expect.any(Date));
    });

    it('should persist the news feed item in the database', async () => {
      const document = await TestHelper.document.create({
        name: 'custom dashboard',
      });

      const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
        document,
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Opencti,
        tags,
      });

      const dbItem = await TestHelper.newsFeed.loadFirstItem({
        id: newsFeedItem.id,
      });

      expect(dbItem).toBeDefined();
      expect(dbItem).toMatchObject({
        id: newsFeedItem.id,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        tags,
      });
    });

    it('should insert metadata with the url_path', async () => {
      const document = await TestHelper.document.create({
        name: 'custom dashboard',
      });

      const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
        document,
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Opencti,
        tags: [],
      });

      const metadata = await TestHelper.newsFeed.loadFirstMetadata({
        news_feed_item_id: newsFeedItem.id,
      });

      const expectedGlobalDocumentId = toGlobalId('Document', document.id);

      expect(metadata).toBeDefined();
      expect(metadata).toMatchObject({
        news_feed_item_id: newsFeedItem.id,
        key: NewsFeedItemMetadataKey.UrlPath,
        value: `redirect/${ServiceDefinitionIdentifier.OpenctiCustomDashboards}?document_id=${expectedGlobalDocumentId}`,
      });
    });
  });

  describe('provisionNewsFeedItem', () => {
    let newsFeedItemId: NewsFeedItemId;

    beforeEach(async () => {
      const item = await TestHelper.newsFeed.createItem({
        id: uuidv4() as NewsFeedItemId,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: 'Test Feed Item',
        creation_date: new Date(),
        tags: [],
      });
      expect(item).toBeDefined();
      newsFeedItemId = item.id;
    });

    it('should do nothing when platformIds is empty', async () => {
      await NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, []);

      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: newsFeedItemId,
      });

      expect(provisioned).toHaveLength(0);
    });

    it('should insert a provisioned record for a single platform id', async () => {
      const platformId = 'platform-test-001';

      await NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, [platformId]);

      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: newsFeedItemId,
      });

      expect(provisioned).toHaveLength(1);
      expect(provisioned[0]).toMatchObject({
        news_feed_item_id: newsFeedItemId,
        platform_id: platformId,
      });
    });

    it('should insert provisioned records for multiple platform ids', async () => {
      const platformIds = [
        'platform-test-001',
        'platform-test-002',
        'platform-test-003',
      ];

      await NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, platformIds);

      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: newsFeedItemId,
      });

      expect(provisioned).toHaveLength(3);
      expect(provisioned.map((p) => p.platform_id)).toEqual(
        expect.arrayContaining(platformIds)
      );
    });

    it('should be idempotent when called twice with the same platform ids', async () => {
      const platformIds = ['platform-test-001', 'platform-test-002'];

      await NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, platformIds);
      await expect(
        NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, platformIds)
      ).resolves.not.toThrow();

      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: newsFeedItemId,
      });

      expect(provisioned).toHaveLength(2);
      expect(provisioned.map((p) => p.platform_id)).toEqual(
        expect.arrayContaining(platformIds)
      );
    });

    it('should deduplicate platform ids and insert only unique records', async () => {
      const platformIds = [
        'platform-test-001',
        'platform-test-002',
        'platform-test-001',
        'platform-test-002',
        'platform-test-003',
      ];

      await NewsFeedDomain.provisionNewsFeedItem(newsFeedItemId, platformIds);

      const provisioned = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: newsFeedItemId,
      });

      expect(provisioned).toHaveLength(3);
      expect(provisioned.map((p) => p.platform_id)).toEqual(
        expect.arrayContaining([
          'platform-test-001',
          'platform-test-002',
          'platform-test-003',
        ])
      );
    });
  });

  describe('deleteNewsFeedItemsOlderThan', () => {
    const REFERENCE_NOW = new Date();

    const monthsAgo = (months: number): Date => {
      const date = new Date(REFERENCE_NOW);
      date.setMonth(date.getMonth() - months);
      return date;
    };

    const createItemWithAge = (ageInMonths: number) =>
      TestHelper.newsFeed.createItem({
        type: NewsFeedItemType.ResourceCustomDashboard,
        platform_identifier: PlatformIdentifier.Opencti,
        title: `item-${ageInMonths}-months-old`,
        creation_date: monthsAgo(ageInMonths),
        tags: [],
      });

    it.each`
      ageInMonths | cutoffMonths | shouldBeDeleted | description
      ${7}        | ${6}         | ${true}         | ${'older than cutoff is deleted'}
      ${6}        | ${6}         | ${false}        | ${'exactly at cutoff boundary is kept'}
      ${5}        | ${6}         | ${false}        | ${'within cutoff is kept'}
      ${1}        | ${6}         | ${false}        | ${'recent is kept'}
      ${24}       | ${6}         | ${true}         | ${'much older is deleted'}
      ${3}        | ${1}         | ${true}         | ${'older than custom 1-month cutoff is deleted'}
    `(
      'should handle item aged $ageInMonths months with $cutoffMonths-month cutoff ($description)',
      async ({ ageInMonths, cutoffMonths, shouldBeDeleted }) => {
        // Given
        const item = await createItemWithAge(ageInMonths);

        // When
        await NewsFeedDomain.deleteNewsFeedItemsOlderThan(
          monthsAgo(cutoffMonths)
        );

        // Then
        const remaining = await TestHelper.newsFeed.loadFirstItem({
          id: item.id,
        });
        expect(remaining === undefined).toBe(shouldBeDeleted);
      }
    );

    it('should return the count of deleted items', async () => {
      // Given
      await createItemWithAge(12);
      await createItemWithAge(9);
      await createItemWithAge(7);
      await createItemWithAge(1);
      await createItemWithAge(2);

      // When
      const deletedCount = await NewsFeedDomain.deleteNewsFeedItemsOlderThan(
        monthsAgo(6)
      );

      // Then
      expect(deletedCount).toBe(3);
    });

    it('should return 0 when no items are older than cutoff', async () => {
      // Given
      await createItemWithAge(1);

      // When
      const deletedCount = await NewsFeedDomain.deleteNewsFeedItemsOlderThan(
        monthsAgo(6)
      );

      // Then
      expect(deletedCount).toBe(0);
    });

    it('should cascade-delete provisioned items linked to deleted news feed items', async () => {
      // Given
      const oldItem = await createItemWithAge(12);
      const platformId = uuidv4();
      await NewsFeedDomain.provisionNewsFeedItem(oldItem.id, [platformId]);

      const remainingBefore = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: oldItem.id,
      });
      expect(remainingBefore).toHaveLength(1);

      // When
      await NewsFeedDomain.deleteNewsFeedItemsOlderThan(monthsAgo(6));

      // Then
      const remainingAfter = await TestHelper.newsFeed.loadProvisioned({
        news_feed_item_id: oldItem.id,
      });
      expect(remainingAfter).toHaveLength(0);
    });
  });
});
