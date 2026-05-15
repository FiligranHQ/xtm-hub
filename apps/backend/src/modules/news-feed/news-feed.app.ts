import {
  ConsumeProvisionedNewsFeedItemsResponse,
  NewsFeedItemMetadataKey,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../utils/error/error.code';
import { organizationDomain } from '../organization-management/organization/organization.domain';
import { registrationDomain } from '../registration/registration.domain';
import { ServiceConfigurationDomain } from '../registration/service-configuration/service-configuration.domain';
import { useCaseDomain } from '../use-case/use-case.domain';
import { NewsFeedDomain } from './news-feed.domain';
import { newsFeedConfigurationMapping } from './news-feed.model';

export const NewsFeedApp = {
  consumeProvisionedNewsFeedItems: async ({
    platformId,
    token,
  }: {
    platformId: string | null;
    token: string | null;
  }): Promise<ConsumeProvisionedNewsFeedItemsResponse> => {
    if (!platformId || !token) {
      throw new Error(ErrorCode.InvalidPlatformId);
    }

    const resolvedConfiguration =
      await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
        {
          platform_id: platformId,
          token,
        }
      );
    if (!resolvedConfiguration) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }
    if (!resolvedConfiguration.serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }
    if (!resolvedConfiguration.platformIdentifier) {
      throw new Error(ErrorCode.InvalidPlatformIdentifier);
    }

    const rawItems =
      await NewsFeedDomain.loadAndConsumeProvisionedNewsFeedItems(platformId);

    const newsFeedItems = rawItems.map((item) => ({
      ...item,
      metadata: item.metadata.map((m) => ({
        key: m.key as NewsFeedItemMetadataKey,
        value: m.value,
      })),
    }));

    return {
      news_feed_items: newsFeedItems,
      available_news_feed_types: NewsFeedDomain.loadAvailableNewsFeedTypes(
        resolvedConfiguration.platformIdentifier
      ),
    };
  },

  isNewsFeedConfigured: (
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier
  ): boolean => {
    return (
      newsFeedConfigurationMapping[serviceDefinitionIdentifier] !== undefined
    );
  },

  createResourceNewsFeedItem: async ({
    document,
    serviceInstanceId,
    serviceDefinitionIdentifier,
  }: {
    document: Document;
    serviceInstanceId: ServiceInstanceId;
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  }): Promise<void> => {
    const newsFeedConfiguration =
      newsFeedConfigurationMapping[serviceDefinitionIdentifier];
    if (!newsFeedConfiguration) {
      return;
    }

    const { newsFeedType, platformIdentifier } = newsFeedConfiguration;

    const useCases = await useCaseDomain.loadUseCasesByDocumentId(document.id);
    const tags = useCases.map((useCase) => useCase.name);
    const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
      document,
      serviceDefinitionIdentifier,
      type: newsFeedType,
      platformIdentifier,
      tags,
    });

    const organizations =
      await organizationDomain.loadOrganizationsSubscribedToServiceInstance(
        serviceInstanceId
      );

    const organizationIds = organizations.map((org) => org.id);

    const registeredPlatforms =
      await registrationDomain.loadRegisteredPlatformsByOrganizationIds(
        organizationIds,
        newsFeedConfiguration.platformIdentifier
      );

    const platformIds = registeredPlatforms
      .filter((platform) => platform.config?.platform_id)
      .map((platform) => platform.config.platform_id);

    await NewsFeedDomain.provisionNewsFeedItem(newsFeedItem.id, platformIds);
  },
};
