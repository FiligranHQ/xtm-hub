import {
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';

export const NEWS_FEED_ITEM_METADATA_KEY_DOCUMENT_ID = 'document_id' as const;

export const newsFeedConfigurationMapping: Partial<
  Record<
    ServiceDefinitionIdentifier,
    { newsFeedType: NewsFeedItemType; platformIdentifier: PlatformIdentifier }
  >
> = {
  [ServiceDefinitionIdentifier.OpenctiCustomDashboards]: {
    newsFeedType: NewsFeedItemType.ResourceCustomDashboard,
    platformIdentifier: PlatformIdentifier.Opencti,
  },
};
