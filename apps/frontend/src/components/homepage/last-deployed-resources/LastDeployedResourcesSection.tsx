import LastDeployedResourcesClient from '@/components/homepage/last-deployed-resources/LastDeployedResourcesClient';
import {
  PlatformMetadataMapping,
  ServiceDefinitionIdentifierToPlatformIdentifier,
} from '@/components/registration/PlatformIdentifierMapping';
import {
  LastDeployedOverviewQueryQuery,
  RegisteredPlatformsQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
  const t = await getTranslations();

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
      <div className="flex-1 min-w-0 flex justify-center">
        <Image
          src="/xtm_platform.png"
          alt={t('PublicHomePage.XtmPlatform.ImageAlt')}
          width={1370}
          height={680}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-auto max-h-70"
        />
      </div>
    );
  }

  return <LastDeployedResourcesClient platforms={platforms} />;
};

export default LastDeployedResourcesSection;
