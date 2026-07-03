import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import { daysUntil } from '@/utils/date';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import {
  DeployableResourceType,
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

export const HomepageDeployServiceIdentifierByRegisteredPlatform: Partial<
  Record<ServiceDefinitionIdentifier, ServiceDefinitionIdentifierEnum>
> = {
  [ServiceDefinitionIdentifier.OpenctiRegistration]:
    ServiceDefinitionIdentifierEnum.OPENCTI_INTEGRATIONS,
  [ServiceDefinitionIdentifier.OpenaevRegistration]:
    ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS,
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
    const product = resolveHomepageRegisteredProduct(platform.identifier);
    if (!product) {
      return [];
    }

    const contract = resolvePlatformContract(platform.contract);

    return {
      id: platform.id,
      product,
      title: platform.title,
      registrationDate: platform.subscription?.start_date,
      contract,
      remainingTrialDays:
        contract === PlatformContractEnum.TRIAL
          ? resolveRemainingTrialDays(platform.subscription?.end_date)
          : undefined,
    };
  });
};

export const resolveHomepageCrossSellProduct = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): PlatformIdentifierEnum | undefined => {
  const registeredProducts = new Set<PlatformIdentifierEnum>();

  for (const identifier of registeredIdentifiers) {
    const product =
      ServiceDefinitionIdentifierToPlatformIdentifier[
        identifier as unknown as ServiceDefinitionIdentifierEnum
      ];

    if (product) {
      registeredProducts.add(product);
    }
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
