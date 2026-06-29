import { APP_PATH } from '@/utils/path/constant';
import {
  PrivateNavigationServiceInstancesQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';

export interface PrivateNavigationRegistrationLink {
  id: string;
  name: string;
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

export const getPrivateNavigationRegistrationsByServiceIdentifier = (
  queryData: PrivateNavigationServiceInstancesQuery | undefined,
  serviceIdentifier: ServiceDefinitionIdentifier
): PrivateNavigationRegistrationLink[] =>
  (queryData?.serviceInstances.edges ?? []).flatMap((edge) => {
    const serviceInstance = edge.node;

    if (
      !serviceInstance ||
      serviceInstance.service_definition?.identifier !== serviceIdentifier
    ) {
      return [];
    }

    return [
      {
        id: serviceInstance.id,
        name: serviceInstance.name,
        url: getFirstNonEmptyServiceUrl(serviceInstance.links),
      },
    ];
  });
