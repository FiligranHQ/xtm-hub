import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import {
  NewsFeedItemType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import NewsFeedItem, {
  NewsFeedItemId,
} from '../../model/kanel/public/NewsFeedItem';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../utils/error/error.code';
import { NEWS_FEED_ITEM_METADATA_KEY_DOCUMENT_ID } from './news-feed.model';

export const NewsFeedDomain = {
  createResourceNewsFeedItem: async ({
    document,
    serviceInstanceId,
    type,
    platformIdentifier,
    tags,
  }: {
    document: Document;
    serviceInstanceId: ServiceInstanceId;
    type: NewsFeedItemType;
    platformIdentifier: PlatformIdentifier;
    tags: string[];
  }): Promise<NewsFeedItem> => {
    if (!document.name) {
      throw new Error(ErrorCode.NewsFeedItemMissingTitle);
    }
    const [newsFeedItem] = await db<NewsFeedItem>('NewsFeedItem')
      .insert({
        id: uuidv4() as NewsFeedItemId,
        type,
        service_instance_id: serviceInstanceId,
        platform_identifier: platformIdentifier,
        title: document.name,
        creation_date: new Date(),
        tags,
      })
      .returning('*');

    await db('NewsFeedItemMetadata').insert({
      news_feed_item_id: newsFeedItem.id,
      key: NEWS_FEED_ITEM_METADATA_KEY_DOCUMENT_ID,
      value: document.id,
    });

    return newsFeedItem;
  },

  provisionNewsFeedItem: async (
    newsFeedItemId: NewsFeedItemId,
    platformIds: string[]
  ): Promise<void> => {
    const uniquePlatformIds = [...new Set(platformIds)];
    if (uniquePlatformIds.length === 0) {
      return;
    }

    await db('ProvisionedNewsFeedItem')
      .insert(
        uniquePlatformIds.map((platformId) => ({
          news_feed_item_id: newsFeedItemId,
          platform_id: platformId,
        }))
      )
      .onConflict(['news_feed_item_id', 'platform_id'])
      .ignore();
  },
};
