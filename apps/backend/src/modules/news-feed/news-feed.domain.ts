import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import {
  NewsFeedItemMetadataKey,
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import Document from '../../model/kanel/public/Document';
import NewsFeedItem, {
  NewsFeedItemId,
} from '../../model/kanel/public/NewsFeedItem';
import NewsFeedItemMetadata from '../../model/kanel/public/NewsFeedItemMetadata';
import { ErrorCode } from '../../utils/error/error.code';
import { newsFeedConfigurationMapping } from './news-feed.model';

export interface NewsFeedItemWithMetadata extends NewsFeedItem {
  metadata: NewsFeedItemMetadata[];
}

export const NewsFeedDomain = {
  loadAvailableNewsFeedTypes: (
    platformIdentifier: PlatformIdentifier
  ): NewsFeedItemType[] => {
    return Object.values(newsFeedConfigurationMapping)
      .filter((config) => config.platformIdentifier === platformIdentifier)
      .map((config) => config.newsFeedType);
  },

  loadAndConsumeProvisionedNewsFeedItems: async (
    platformId: string
  ): Promise<NewsFeedItemWithMetadata[]> => {
    return withTransaction(async () => {
      const deletedRows: { news_feed_item_id: NewsFeedItemId }[] = await db(
        'ProvisionedNewsFeedItem'
      )
        .where('platform_id', platformId)
        .delete()
        .returning('news_feed_item_id');
      if (deletedRows.length === 0) {
        return [];
      }

      const newsFeedItemIds = deletedRows.map(
        ({ news_feed_item_id }) => news_feed_item_id
      );

      const newsFeedItems: NewsFeedItem[] = await db('NewsFeedItem')
        .whereIn('id', newsFeedItemIds)
        .select('*');

      const allMetadata: NewsFeedItemMetadata[] = await db(
        'NewsFeedItemMetadata'
      )
        .whereIn('news_feed_item_id', newsFeedItemIds)
        .select('*');

      const metadataByItemId = allMetadata.reduce((acc, current) => {
        const existingMetadata = acc.get(current.news_feed_item_id);
        acc.set(current.news_feed_item_id, [
          ...(existingMetadata ?? []),
          current,
        ]);
        return acc;
      }, new Map<NewsFeedItemId, NewsFeedItemMetadata[]>());

      return newsFeedItems.map((item) => ({
        ...item,
        metadata: metadataByItemId.get(item.id) ?? [],
      }));
    });
  },

  createResourceNewsFeedItem: async ({
    document,
    serviceDefinitionIdentifier,
    type,
    platformIdentifier,
    tags,
  }: {
    document: Document;
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
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
        platform_identifier: platformIdentifier,
        title: document.name,
        creation_date: new Date(),
        tags,
      })
      .returning('*');

    const globalDocumentId = toGlobalId('Document', document.id);

    await db('NewsFeedItemMetadata').insert({
      news_feed_item_id: newsFeedItem.id,
      key: NewsFeedItemMetadataKey.UrlPath,
      value: `redirect/${serviceDefinitionIdentifier}?document_id=${globalDocumentId}`,
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

  deleteNewsFeedItemsOlderThan: async (cutoffDate: Date): Promise<number> => {
    const deletedRows: { id: NewsFeedItemId }[] = await db('NewsFeedItem')
      .where('creation_date', '<', cutoffDate)
      .delete()
      .returning('id');
    return deletedRows.length;
  },
};
