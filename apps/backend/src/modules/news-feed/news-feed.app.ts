import config from 'config';
import {
  ConsumeProvisionedNewsFeedItemsResponse,
  NewsFeedItemMetadataKey,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import {
  INTERVAL_UNITS,
  IntervalUnit,
  subtractInterval,
} from '../common/interval.helper';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { registrationDomain } from '../registration/registration.domain';
import { platformIdentifierMappedByServiceDefinitionIdentifier } from '../registration/registration.mapping';
import { ServiceConfigurationDomain } from '../registration/service-configuration/service-configuration.domain';
import { loadServiceDefinitionByServiceInstance } from '../service/instance/service-instance.domain';
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

    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
        platform_id: platformId,
        token,
      });
    if (!serviceConfiguration) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      serviceConfiguration.service_instance_id
    );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const platformIdentifier = serviceDefinition.identifier
      ? platformIdentifierMappedByServiceDefinitionIdentifier[
          serviceDefinition.identifier as ServiceDefinitionIdentifier
        ]
      : undefined;
    if (!platformIdentifier) {
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
      available_news_feed_types:
        NewsFeedDomain.loadAvailableNewsFeedTypes(platformIdentifier),
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
      await OrganizationDomain.loadOrganizationsSubscribedToServiceInstance(
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

  cleanExpiredNewsFeedItems: async (): Promise<void> => {
    const rawValue = config.get('news_feed.cleanup_interval_value');
    const rawUnit = config.get('news_feed.cleanup_interval_unit');

    if (
      typeof rawValue !== 'number' ||
      !Number.isFinite(rawValue) ||
      rawValue <= 0
    ) {
      throw new Error(
        `Invalid config "news_feed.cleanup_interval_value": expected positive number, got ${typeof rawValue} (${rawValue})`
      );
    }
    if (
      typeof rawUnit !== 'string' ||
      !INTERVAL_UNITS.includes(rawUnit as IntervalUnit)
    ) {
      throw new Error(
        `Invalid config "news_feed.cleanup_interval_unit": expected one of ${INTERVAL_UNITS.join(', ')}, got ${rawUnit}`
      );
    }

    const cutoffDate = subtractInterval(
      new Date(),
      rawValue,
      rawUnit as IntervalUnit
    );

    const deletedCount =
      await NewsFeedDomain.deleteNewsFeedItemsOlderThan(cutoffDate);

    logApp.info('Cleaned expired news feed items', {
      deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      intervalValue: rawValue,
      intervalUnit: rawUnit,
    });
  },
};
