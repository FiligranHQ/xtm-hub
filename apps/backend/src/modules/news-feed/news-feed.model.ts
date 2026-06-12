import {
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';

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
  [ServiceDefinitionIdentifier.OpenctiPlaybooks]: {
    newsFeedType: NewsFeedItemType.ResourcePlaybook,
    platformIdentifier: PlatformIdentifier.Opencti,
  },
};
