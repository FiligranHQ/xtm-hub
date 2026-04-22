import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { SERVICES } from '../../../tests/tests.const';
import {
  NewsFeedItemType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { NewsFeedItemId } from '../../model/kanel/public/NewsFeedItem';
import { BadRequestErrorCode } from '../../utils/error/error.code';
import { NewsFeedDomain } from './news-feed.domain';
import { NEWS_FEED_ITEM_METADATA_KEY_DOCUMENT_ID } from './news-feed.model';

describe('newsFeedDomain', () => {
  const tags = ['threat-intel', 'malware'];

  beforeEach(async () => {
    await TestHelper.newsFeed.deleteItem();
  });

  describe('createResourceNewsFeedItem', () => {
    it('should throw an error when document name is missing', async () => {
      const document = await TestHelper.document.create();
      document.name = '' as typeof document.name;

      await expect(
        NewsFeedDomain.createResourceNewsFeedItem({
          document,
          serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
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
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Opencti,
        tags,
      });

      expect(newsFeedItem).toMatchObject({
        type: NewsFeedItemType.ResourceCustomDashboard,
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
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
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
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

    it('should insert metadata with the document id', async () => {
      const document = await TestHelper.document.create({
        name: 'custom dashboard',
      });

      const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
        document,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Opencti,
        tags: [],
      });

      const metadata = await TestHelper.newsFeed.loadFirstMetadata({
        news_feed_item_id: newsFeedItem.id,
      });

      expect(metadata).toBeDefined();
      expect(metadata).toMatchObject({
        news_feed_item_id: newsFeedItem.id,
        key: NEWS_FEED_ITEM_METADATA_KEY_DOCUMENT_ID,
        value: document.id,
      });
    });
  });

  describe('provisionNewsFeedItem', () => {
    let newsFeedItemId: NewsFeedItemId;

    beforeEach(async () => {
      const item = await TestHelper.newsFeed.createItem({
        id: uuidv4() as NewsFeedItemId,
        type: NewsFeedItemType.ResourceCustomDashboard,
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
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
});
