import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/PlatformIdentifierMapping';
import { daysUntil } from '@/utils/date';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  DocumentImageType,
  HomepageDocumentFragment,
  PlatformContract,
  PlatformIdentifier,
  RegisteredPlatformsQuery,
} from '@graphql/generated';

type RegisteredPlatformForHomepage =
  RegisteredPlatformsQuery['registeredPlatforms'][number];

export type HomepageRoadmapTitleProduct = 'opencti' | 'openaev' | 'default';

export interface HomepageRegisteredPlatformCardViewModel {
  id: string;
  platformIdentifier: PlatformIdentifier;
  title: string;
  registrationDate: string | null | undefined;
  contract: PlatformContract;
  remainingTrialDays: number | undefined;
}

export const buildDistinctPlatformIdentifiersFromServiceDefinition = (
  registeredPlatforms: RegisteredPlatformsQuery['registeredPlatforms']
): PlatformIdentifier[] => {
  const platformSet = new Set<PlatformIdentifier>();
  for (const registeredPlatform of registeredPlatforms) {
    const platform =
      ServiceDefinitionIdentifierToPlatformIdentifier[
        registeredPlatform.identifier
      ];
    if (platform) {
      platformSet.add(platform);
    }
  }

  return Array.from(platformSet) ?? [];
};

export const resolveRemainingTrialDays = (
  endDate: string | null | undefined
): number | undefined => {
  if (!endDate) {
    return undefined;
  }

  const remainingDays = daysUntil(new Date(endDate));

  return remainingDays < 0 ? 0 : remainingDays;
};

export const mapRegisteredPlatformsToHomepageCards = (
  registeredPlatforms: RegisteredPlatformForHomepage[]
): HomepageRegisteredPlatformCardViewModel[] => {
  return registeredPlatforms.flatMap((platform) => {
    const platformIdentifier: PlatformIdentifier | undefined =
      ServiceDefinitionIdentifierToPlatformIdentifier[platform.identifier];
    if (!platformIdentifier) {
      return [];
    }

    return [
      {
        id: platform.id,
        platformIdentifier,
        title: platform.title,
        registrationDate: platform.subscription?.start_date,
        contract: platform.contract,
        remainingTrialDays:
          platform.contract === PlatformContract.Trial
            ? resolveRemainingTrialDays(platform.subscription?.end_date)
            : undefined,
      },
    ];
  });
};

export const resolveHomepageCrossSellProduct = (
  cards: HomepageRegisteredPlatformCardViewModel[]
): PlatformIdentifierEnum | undefined => {
  const registeredProducts = new Set<PlatformIdentifierEnum>();

  for (const card of cards) {
    registeredProducts.add(
      card.platformIdentifier === 'opencti'
        ? PlatformIdentifierEnum.OPENCTI
        : PlatformIdentifierEnum.OPENAEV
    );
  }

  if (registeredProducts.size !== 1) {
    return undefined;
  }

  return registeredProducts.has(PlatformIdentifierEnum.OPENCTI)
    ? PlatformIdentifierEnum.OPENAEV
    : PlatformIdentifierEnum.OPENCTI;
};

export const findLogoUrl = (
  resource: HomepageDocumentFragment
): string | undefined => {
  const logo = resource.children_documents?.find(
    (doc) => doc.image_type === DocumentImageType.Logo
  );
  return logo && resource.service_instance_id
    ? `/document/images/${String(resource.service_instance_id)}/${logo.id}`
    : undefined;
};
