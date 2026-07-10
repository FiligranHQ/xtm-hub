import LastDeployedResourcesClient from '@/components/homepage/LastDeployedResourcesClient';
import {
  PlatformMetadataMapping,
  ServiceDefinitionIdentifierToPlatformIdentifier,
} from '@/components/registration/PlatformIdentifierMapping';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import {
  LastDeployedOverviewQueryQuery,
  RegisteredPlatformsQuery,
  useLastDeployedOverviewQueryQuery,
} from '@graphql/generated';

const LAST_DEPLOYED_LIMIT = 4;

export type LastDeployedOverview =
  LastDeployedOverviewQueryQuery['lastDeployedOverview'];

export type LastDeployedPlatform = {
  id: string;
  title: string;
  productName: string;
  overview: LastDeployedOverview;
};

const resolveProductName = (
  identifier: RegisteredPlatformsQuery['registeredPlatforms'][number]['identifier']
): string => {
  const platformIdentifier =
    ServiceDefinitionIdentifierToPlatformIdentifier[identifier];
  return platformIdentifier
    ? PlatformMetadataMapping[platformIdentifier].name
    : '';
};

type LastDeployedResourcesSectionProps = {
  registeredPlatformsData: RegisteredPlatformsQuery;
};

export const LastDeployedResourcesSection = async ({
  registeredPlatformsData,
}: LastDeployedResourcesSectionProps) => {
  const platforms = registeredPlatformsData.registeredPlatforms.filter(
    (platform): platform is typeof platform & { platform_id: string } =>
      Boolean(platform.platform_id)
  );

  if (platforms.length === 0) {
    return null;
  }

  const client = await getAuthenticatedGraphqlClient();

  const platformsWithOverview = await Promise.all(
    platforms.map(async (platform) => {
      const data = await useLastDeployedOverviewQueryQuery.fetcher(client, {
        limit: LAST_DEPLOYED_LIMIT,
        platformId: platform.platform_id,
      })();
      return {
        id: platform.id,
        title: platform.title,
        productName: resolveProductName(platform.identifier),
        overview: data.lastDeployedOverview,
      };
    })
  );

  return <LastDeployedResourcesClient platforms={platformsWithOverview} />;
};

export default LastDeployedResourcesSection;
