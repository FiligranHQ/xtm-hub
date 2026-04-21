import { ServiceDefinitionIdentifier } from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { organizationDomain } from '../organization-management/organizations/organizations.domain';
import { registrationDomain } from '../registration/registration.domain';
import { NewsFeedDomain } from './news-feed.domain';
import { newsFeedConfigurationMapping } from './news-feed.model';

export const NewsFeedApp = {
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
    const newsFeedItem = await NewsFeedDomain.createResourceNewsFeedItem({
      document,
      serviceInstanceId,
      type: newsFeedType,
      platformIdentifier,
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
