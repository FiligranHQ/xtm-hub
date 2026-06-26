import { APP_PATH } from '@/utils/path/constant';
import {
  PrivateNavigationServiceInstancesQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';

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
        ? serviceInstance.links?.find((link) => !!link?.url)?.url
        : undefined;

    const href =
      externalServiceLink ??
      `/${APP_PATH}/service/${serviceIdentifier}/${serviceInstance.id}`;

    serviceHrefs.set(serviceIdentifier, href);
  }

  return serviceHrefs;
};
