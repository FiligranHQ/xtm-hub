import { APP_PATH } from '@/utils/path/constant';
import {
  PlatformIdentifier,
  PrivateNavigationServiceInstancesQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';

export interface PrivateNavigationRegisteredPlatformLink {
  serviceInstanceId: string;
  title: string;
  url?: string;
}

const getFirstNonEmptyServiceUrl = (
  links: { url: string | null }[] | null | undefined
): string | undefined => links?.find((link) => !!link?.url)?.url ?? undefined;

export const getPrivateNavigationServiceHrefs = (
  queryData: PrivateNavigationServiceInstancesQuery | undefined
) => {
  const serviceHrefs = new Map<ServiceDefinitionIdentifier, string>();

  for (const edge of queryData?.serviceInstances.edges ?? []) {
    const serviceInstance = edge.node;

    if (!serviceInstance) {
      continue;
    }

    const serviceIdentifier = serviceInstance.service_definition?.identifier;

    if (!serviceIdentifier || serviceHrefs.has(serviceIdentifier)) {
      continue;
    }

    const externalServiceLink =
      serviceIdentifier === ServiceDefinitionIdentifier.Link
        ? getFirstNonEmptyServiceUrl(serviceInstance.links)
        : undefined;

    const href =
      externalServiceLink ??
      `/${APP_PATH}/service/${serviceIdentifier}/${serviceInstance.id}`;

    serviceHrefs.set(serviceIdentifier, href);
  }

  return serviceHrefs;
};

const getRegisteredPlatformServiceIdentifier = (
  platformIdentifier: PlatformIdentifier
): ServiceDefinitionIdentifier | undefined => {
  switch (platformIdentifier) {
    case PlatformIdentifier.Opencti:
      return ServiceDefinitionIdentifier.OpenctiRegistration;
    case PlatformIdentifier.Openaev:
      return ServiceDefinitionIdentifier.OpenaevRegistration;
    default:
      return undefined;
  }
};

export const getPrivateNavigationRegisteredPlatformsByIdentifier = (
  queryData: PrivateNavigationServiceInstancesQuery | undefined,
  platformIdentifier: PlatformIdentifier
): PrivateNavigationRegisteredPlatformLink[] => {
  const registeredPlatformIdentifier =
    getRegisteredPlatformServiceIdentifier(platformIdentifier);

  if (!registeredPlatformIdentifier) {
    return [];
  }

  return (queryData?.registeredPlatforms ?? []).flatMap((platform) => {
    if (!platform || platform.identifier !== registeredPlatformIdentifier) {
      return [];
    }

    const serviceInstanceId = platform.subscription?.service_instance?.id;

    if (!serviceInstanceId) {
      return [];
    }

    return [
      {
        serviceInstanceId,
        title: platform.title,
        url: platform.url ?? undefined,
      },
    ];
  });
};
