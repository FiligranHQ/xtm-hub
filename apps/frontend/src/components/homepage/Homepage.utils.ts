import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import { daysUntil } from '@/utils/date';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import {
  DeployableResourceType,
  DeploymentRequestHubStatus,
  DocumentImageType,
  HomepageDocumentFragment,
  PlatformIdentifier,
  RegisteredPlatformsQuery,
  ServiceDefinitionIdentifier,
  UndeployedResourceTypesByProductQuery,
} from '@graphql/generated';

type RegisteredPlatformForHomepage =
  RegisteredPlatformsQuery['registeredPlatforms'][number];

export type HomepageRoadmapTitleProduct = 'opencti' | 'openaev' | 'default';

export type HomepageRoadmapResolution = {
  productFilter: FiligranProductEnum | undefined;
  titleProduct: HomepageRoadmapTitleProduct;
};

export type HomepageRegisteredProduct = 'opencti' | 'openaev';

export type HomepageRegisteredPlatformCardViewModel = {
  id: string;
  product: HomepageRegisteredProduct;
  title: string;
  registrationDate: string | null | undefined;
  contract: PlatformContractEnum;
  remainingTrialDays: number | undefined;
};

export const resolveHomepagePlatformIdentifiers = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): PlatformIdentifierEnum[] | undefined => {
  const platformSet = new Set<PlatformIdentifierEnum>();
  for (const identifier of registeredIdentifiers) {
    const platform =
      ServiceDefinitionIdentifierToPlatformIdentifier[
        identifier as unknown as ServiceDefinitionIdentifierEnum
      ];
    if (platform) {
      platformSet.add(platform);
    }
  }
  return platformSet.size === 1 ? [...platformSet] : undefined;
};

const resolveHomepageRegisteredProduct = (
  identifier: ServiceDefinitionIdentifier
): HomepageRegisteredProduct | undefined => {
  const platformIdentifier =
    ServiceDefinitionIdentifierToPlatformIdentifier[
      identifier as unknown as ServiceDefinitionIdentifierEnum
    ];

  if (platformIdentifier === PlatformIdentifierEnum.OPENCTI) {
    return 'opencti';
  }

  if (platformIdentifier === PlatformIdentifierEnum.OPENAEV) {
    return 'openaev';
  }

  return undefined;
};

const resolvePlatformContract = (
  contract: RegisteredPlatformForHomepage['contract']
): PlatformContractEnum => {
  if (contract === 'CE') {
    return PlatformContractEnum.CE;
  }

  if (contract === 'EE') {
    return PlatformContractEnum.EE;
  }

  return PlatformContractEnum.TRIAL;
};

export const hasPlatformConfiguration = (
  platform: RegisteredPlatformForHomepage
): boolean => {
  return Boolean(
    platform.subscription?.service_instance?.id ??
    platform.subscription?.start_date
  );
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

const mapRegisteredPlatformToHomepageCard = (
  platform: RegisteredPlatformForHomepage,
  registrationDate: string | null | undefined
): HomepageRegisteredPlatformCardViewModel | undefined => {
  const product = resolveHomepageRegisteredProduct(platform.identifier);
  if (!product) {
    return undefined;
  }

  const contract = resolvePlatformContract(platform.contract);

  return {
    id: platform.id,
    product,
    title: platform.title,
    registrationDate,
    contract,
    remainingTrialDays:
      contract === PlatformContractEnum.TRIAL
        ? resolveRemainingTrialDays(
            platform.subscription?.end_date ??
              platform.deployment_request?.end_date
          )
        : undefined,
  };
};

const resolveRequestOnlySortTimestamp = (
  platform: RegisteredPlatformForHomepage
): number => {
  const dateCandidate =
    platform.deployment_request?.request_date ??
    platform.deployment_request?.start_date ??
    null;

  if (!dateCandidate) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(dateCandidate).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const isEligibleRequestOnlyPlatform = (
  platform: RegisteredPlatformForHomepage,
  configuredIdentifiers: Set<ServiceDefinitionIdentifier>
): boolean => {
  if (hasPlatformConfiguration(platform)) {
    return false;
  }
  if (configuredIdentifiers.has(platform.identifier)) {
    return false;
  }
  return (
    platform.deployment_request?.hub_status !== undefined &&
    platform.deployment_request.hub_status !==
      DeploymentRequestHubStatus.Cancelled
  );
};

export const mapRegisteredPlatformsToHomepageCards = (
  registeredPlatforms: RegisteredPlatformForHomepage[]
): HomepageRegisteredPlatformCardViewModel[] => {
  const configuredPlatforms = registeredPlatforms.filter(
    hasPlatformConfiguration
  );
  const configuredIdentifiers = new Set(
    configuredPlatforms.map((platform) => platform.identifier)
  );

  const seenConfiguredKeys = new Set<string>();
  const configuredCards = configuredPlatforms.flatMap((platform) => {
    const key = platform.subscription?.service_instance?.id ?? platform.id;
    if (seenConfiguredKeys.has(key)) {
      return [];
    }
    seenConfiguredKeys.add(key);

    const card = mapRegisteredPlatformToHomepageCard(
      platform,
      platform.subscription?.start_date
    );
    return card ? [card] : [];
  });

  const requestOnlyPlatformsByIdentifier = new Map<
    ServiceDefinitionIdentifier,
    RegisteredPlatformForHomepage
  >();

  for (const platform of registeredPlatforms) {
    if (!isEligibleRequestOnlyPlatform(platform, configuredIdentifiers)) {
      continue;
    }

    const current = requestOnlyPlatformsByIdentifier.get(platform.identifier);
    if (
      !current ||
      resolveRequestOnlySortTimestamp(platform) >
        resolveRequestOnlySortTimestamp(current)
    ) {
      requestOnlyPlatformsByIdentifier.set(platform.identifier, platform);
    }
  }

  const requestOnlyCards = [
    ...requestOnlyPlatformsByIdentifier.values(),
  ].flatMap((platform) => {
    const card = mapRegisteredPlatformToHomepageCard(
      platform,
      platform.deployment_request?.request_date ??
        platform.deployment_request?.start_date
    );
    return card ? [card] : [];
  });

  return [...configuredCards, ...requestOnlyCards];
};

export const resolveHomepageCrossSellProduct = (
  cards: HomepageRegisteredPlatformCardViewModel[]
): PlatformIdentifierEnum | undefined => {
  const registeredProducts = new Set<PlatformIdentifierEnum>();

  for (const card of cards) {
    registeredProducts.add(
      card.product === 'opencti'
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

export const resolveHomepageRoadmapResolution = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): HomepageRoadmapResolution => {
  const [platformIdentifier] =
    resolveHomepagePlatformIdentifiers(registeredIdentifiers) ?? [];

  if (platformIdentifier === PlatformIdentifierEnum.OPENAEV) {
    return {
      productFilter: FiligranProductEnum.OPENAEV,
      titleProduct: 'openaev',
    };
  }

  if (platformIdentifier === PlatformIdentifierEnum.OPENCTI) {
    return {
      productFilter: FiligranProductEnum.OPENCTI,
      titleProduct: 'opencti',
    };
  }

  return {
    productFilter: undefined,
    titleProduct: 'default',
  };
};

export type HomepageDeployFirstResourceCtaTarget = {
  href: string;
  resourceType: DeployableResourceType;
};

type UndeployedResourceTypesByProductItem =
  UndeployedResourceTypesByProductQuery['undeployedResourceTypesByProduct'][number];

const HOMEPAGE_RESOURCE_PRIORITY_BY_PRODUCT: Record<
  PlatformIdentifier,
  DeployableResourceType[]
> = {
  [PlatformIdentifier.Opencti]: [
    DeployableResourceType.Integrations,
    DeployableResourceType.CustomDashboards,
    DeployableResourceType.Playbooks,
    DeployableResourceType.CustomViews,
  ],
  [PlatformIdentifier.Openaev]: [DeployableResourceType.Scenarios],
};

const HOMEPAGE_RESOURCE_CTA_MAPPING: Record<
  DeployableResourceType,
  {
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  }
> = {
  [DeployableResourceType.Integrations]: {
    serviceDefinitionIdentifier:
      ServiceDefinitionIdentifier.OpenctiIntegrations,
  },
  [DeployableResourceType.CustomDashboards]: {
    serviceDefinitionIdentifier:
      ServiceDefinitionIdentifier.OpenctiCustomDashboards,
  },
  [DeployableResourceType.Playbooks]: {
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier.OpenctiPlaybooks,
  },
  [DeployableResourceType.CustomViews]: {
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier.OpenctiCustomViews,
  },
  [DeployableResourceType.Scenarios]: {
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier.OpenaevScenarios,
  },
};

const resolveDeployFirstResourceTypeByProduct = (
  undeployedResourceTypesByProduct: UndeployedResourceTypesByProductItem[],
  product: PlatformIdentifier
): DeployableResourceType | undefined => {
  const undeployedByProduct = undeployedResourceTypesByProduct.find(
    (item) => item.product === product
  );

  if (!undeployedByProduct) {
    return undefined;
  }

  const productPriority = HOMEPAGE_RESOURCE_PRIORITY_BY_PRODUCT[product];

  return productPriority.find((resourceType) =>
    undeployedByProduct.resourceTypes.includes(resourceType)
  );
};

export const resolveDeployFirstResourceCtaTarget = (
  undeployedResourceTypesByProduct: UndeployedResourceTypesByProductQuery['undeployedResourceTypesByProduct'],
  serviceInstanceIdByDefinition: Partial<
    Record<ServiceDefinitionIdentifier, string>
  >
): HomepageDeployFirstResourceCtaTarget | undefined => {
  const firstOpenctiType = resolveDeployFirstResourceTypeByProduct(
    undeployedResourceTypesByProduct,
    PlatformIdentifier.Opencti
  );
  const selectedResourceType =
    firstOpenctiType ??
    resolveDeployFirstResourceTypeByProduct(
      undeployedResourceTypesByProduct,
      PlatformIdentifier.Openaev
    );

  if (!selectedResourceType) {
    return undefined;
  }

  const { serviceDefinitionIdentifier } =
    HOMEPAGE_RESOURCE_CTA_MAPPING[selectedResourceType];

  const serviceInstanceId =
    serviceInstanceIdByDefinition[serviceDefinitionIdentifier];

  if (!serviceInstanceId) {
    return undefined;
  }

  return {
    href: `/app/service/${serviceDefinitionIdentifier}/${serviceInstanceId}`,
    resourceType: selectedResourceType,
  };
};
