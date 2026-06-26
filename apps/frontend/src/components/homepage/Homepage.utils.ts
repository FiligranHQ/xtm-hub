import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import {
  DocumentImageType,
  HomepageDocumentFragment,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';

export const resolveHomepagePlatformIdentifiers = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): PlatformIdentifierEnum[] | undefined => {
  const platformSet = new Set<PlatformIdentifierEnum>();
  for (const identifier of registeredIdentifiers) {
    // Both enums are generated from the same GraphQL schema and share identical string values
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

