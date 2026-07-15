import LastDeployedResourcesClient from '@/components/homepage/LastDeployedResourcesClient';
import {
  PlatformMetadataMapping,
  ServiceDefinitionIdentifierToPlatformIdentifier,
} from '@/components/registration/PlatformIdentifierMapping';
import {
  LastDeployedOverviewQueryQuery,
  RegisteredPlatformsQuery,
} from '@graphql/generated';

export type LastDeployedOverview =
  LastDeployedOverviewQueryQuery['lastDeployedOverview'];

export type LastDeployedPlatform = {
  platformId: string;
  title: string;
  productName: string;
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

export const LastDeployedResourcesSection = ({
  registeredPlatformsData,
}: LastDeployedResourcesSectionProps) => {
  const platforms: LastDeployedPlatform[] =
    registeredPlatformsData.registeredPlatforms.flatMap((platform) =>
      platform.platform_id
        ? [
            {
              platformId: platform.platform_id,
              title: platform.title,
              productName: resolveProductName(platform.identifier),
            },
          ]
        : []
    );

  if (platforms.length === 0) {
    return null;
  }

  return <LastDeployedResourcesClient platforms={platforms} />;
};

export default LastDeployedResourcesSection;
