import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import {
  DocumentImageType,
  FiligranProduct,
  HomepageDocumentFragment,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';

export const resolveHomepagePlatformIdentifiers = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): PlatformIdentifier[] | undefined => {
  const platformSet = new Set<PlatformIdentifier>();
  for (const identifier of registeredIdentifiers) {
    const platform =
      ServiceDefinitionIdentifierToPlatformIdentifier[identifier];
    if (platform) {
      platformSet.add(platform);
    }
  }
  return platformSet.size === 1 ? [...platformSet] : undefined;
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

export type HomepageRoadmapTitleProduct = 'opencti' | 'openaev' | 'default';

export type HomepageRoadmapResolution = {
  productFilter: FiligranProduct | undefined;
  titleProduct: HomepageRoadmapTitleProduct;
};

export const resolveHomepageRoadmapResolution = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): HomepageRoadmapResolution => {
  const [platformIdentifier] =
    resolveHomepagePlatformIdentifiers(registeredIdentifiers) ?? [];

  if (platformIdentifier === PlatformIdentifier.Openaev) {
    return {
      productFilter: FiligranProduct.Openaev,
      titleProduct: 'openaev',
    };
  }

  if (platformIdentifier === PlatformIdentifier.Opencti) {
    return {
      productFilter: FiligranProduct.Opencti,
      titleProduct: 'opencti',
    };
  }

  return {
    productFilter: undefined,
    titleProduct: 'default',
  };
};
