import LastDeployedResourcesClient from '@/components/homepage/last-deployed-resources/LastDeployedResourcesClient';
import XtmPlatformImage from '@/components/homepage/xtm-platform/XtmPlatformImage';
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
  serviceInstanceId: string;
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

export const LastDeployedResourcesSection = async ({
  registeredPlatformsData,
}: LastDeployedResourcesSectionProps) => {
  const platforms: LastDeployedPlatform[] =
    registeredPlatformsData.registeredPlatforms.flatMap((platform) => {
      const serviceInstanceId = platform.subscription?.service_instance_id;
      if (!serviceInstanceId) {
        return [];
      }
      return [
        {
          serviceInstanceId,
          title: platform.title,
          productName: resolveProductName(platform.identifier),
        },
      ];
    });

  if (platforms.length === 0) {
    return (
      <div className="w-full flex-1 min-w-0 flex justify-center">
        <XtmPlatformImage />
      </div>
    );
  }

  return <LastDeployedResourcesClient platforms={platforms} />;
};

export default LastDeployedResourcesSection;
