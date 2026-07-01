import { APP_PATH } from '@/utils/path/constant';
import {
  PlatformIdentifier,
  RegisteredPlatformsListQuery,
  ServiceDefinitionIdentifier,
  ServiceInstancesListQuery,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import {
  getPrivateNavigationRegisteredPlatformsByIdentifier,
  getPrivateNavigationServiceHrefs,
} from './private-navigation.utils';

type ServiceInstanceEdge =
  ServiceInstancesListQuery['serviceInstances']['edges'][number];
type ServiceInstanceLinks = NonNullable<ServiceInstanceEdge['node']>['links'];
type RegisteredPlatform =
  RegisteredPlatformsListQuery['registeredPlatforms'][number];

const buildServiceInstancesQuery = ({
  serviceInstancesEdges,
}: {
  serviceInstancesEdges: ServiceInstancesListQuery['serviceInstances']['edges'];
}): ServiceInstancesListQuery => ({
  __typename: 'Query',
  serviceInstances: {
    __typename: 'ServiceConnection',
    edges: serviceInstancesEdges,
  },
});

const buildRegisteredPlatformsQuery = ({
  registeredPlatforms = [],
}: {
  registeredPlatforms?: RegisteredPlatformsListQuery['registeredPlatforms'];
}): RegisteredPlatformsListQuery => ({
  __typename: 'Query',
  registeredPlatforms,
});

const createEdge = ({
  id,
  identifier,
  name = 'Service name',
  links = [],
}: {
  id: string;
  identifier: ServiceDefinitionIdentifier;
  name?: string;
  links?: ServiceInstanceLinks;
}): ServiceInstanceEdge => ({
  __typename: 'ServiceInstanceEdge',
  node: {
    __typename: 'ServiceInstance',
    id,
    name,
    service_definition: {
      __typename: 'ServiceDefinition',
      identifier,
    },
    links,
  },
});

const createRegisteredPlatform = ({
  title,
  identifier,
  url = null,
  serviceInstanceId,
}: {
  title: string;
  identifier: ServiceDefinitionIdentifier;
  url?: string | null;
  serviceInstanceId?: string;
}): RegisteredPlatform => ({
  __typename: 'RegisteredPlatform',
  title,
  identifier,
  url,
  subscription: serviceInstanceId
    ? {
        __typename: 'SubscriptionModel',
        service_instance: {
          __typename: 'ServiceInstance',
          id: serviceInstanceId,
        },
      }
    : null,
});

describe('getPrivateNavigationServiceHrefs', () => {
  it.each`
    description                  | queryData
    ${'query data is undefined'} | ${undefined}
    ${'query data has no edges'} | ${buildServiceInstancesQuery({ serviceInstancesEdges: [] })}
  `('returns an empty map when $description', ({ queryData }) => {
    expect(getPrivateNavigationServiceHrefs(queryData)).toEqual(new Map());
  });

  it('skips null nodes', () => {
    const queryData = buildServiceInstancesQuery({
      serviceInstancesEdges: [
        {
          __typename: 'ServiceInstanceEdge',
          node: null,
        },
        createEdge({
          id: 'opencti-integrations-id',
          identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
        }),
      ],
    });

    const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

    expect(serviceHrefs.size).toBe(1);
    expect(
      serviceHrefs.get(ServiceDefinitionIdentifier.OpenctiIntegrations)
    ).toBe(
      `/${APP_PATH}/service/${ServiceDefinitionIdentifier.OpenctiIntegrations}/opencti-integrations-id`
    );
  });

  it('deduplicates by service definition identifier and keeps the first instance', () => {
    const queryData = buildServiceInstancesQuery({
      serviceInstancesEdges: [
        createEdge({
          id: 'first-id',
          identifier: ServiceDefinitionIdentifier.OpenaevScenarios,
        }),
        createEdge({
          id: 'second-id',
          identifier: ServiceDefinitionIdentifier.OpenaevScenarios,
        }),
      ],
    });

    const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

    expect(serviceHrefs.size).toBe(1);
    expect(serviceHrefs.get(ServiceDefinitionIdentifier.OpenaevScenarios)).toBe(
      `/${APP_PATH}/service/${ServiceDefinitionIdentifier.OpenaevScenarios}/first-id`
    );
  });

  it.each`
    identifier                                         | id
    ${ServiceDefinitionIdentifier.OpenctiIntegrations} | ${'opencti-integrations-id'}
    ${ServiceDefinitionIdentifier.XtmPlatformRoadmap}  | ${'xtm-platform-roadmap-id'}
  `(
    'for non-Link service ($identifier), builds internal path',
    ({ identifier, id }) => {
      const queryData = buildServiceInstancesQuery({
        serviceInstancesEdges: [
          createEdge({
            id,
            identifier,
          }),
        ],
      });

      const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

      expect(serviceHrefs.get(identifier)).toBe(
        `/${APP_PATH}/service/${identifier}/${id}`
      );
    }
  );

  it('for Link identifier, uses first non-empty external URL when present', () => {
    const queryData = buildServiceInstancesQuery({
      serviceInstancesEdges: [
        createEdge({
          id: 'link-service-id',
          identifier: ServiceDefinitionIdentifier.Link,
          links: [
            {
              __typename: 'ServiceLink',
              url: '',
            },
            {
              __typename: 'ServiceLink',
              url: null,
            },
            {
              __typename: 'ServiceLink',
              url: 'https://first.example.com',
            },
            {
              __typename: 'ServiceLink',
              url: 'https://second.example.com',
            },
          ],
        }),
      ],
    });

    const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

    expect(serviceHrefs.get(ServiceDefinitionIdentifier.Link)).toBe(
      'https://first.example.com'
    );
  });

  it.each`
    description                         | links
    ${'links are null'}                 | ${null}
    ${'links contain no non-empty URL'} | ${[null, { __typename: 'ServiceLink', url: null }, { __typename: 'ServiceLink', url: '' }]}
  `(
    'for Link identifier, falls back to internal path when $description',
    ({ links }) => {
      const id = 'link-service-id';
      const queryData = buildServiceInstancesQuery({
        serviceInstancesEdges: [
          createEdge({
            id,
            identifier: ServiceDefinitionIdentifier.Link,
            links,
          }),
        ],
      });

      const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

      expect(serviceHrefs.get(ServiceDefinitionIdentifier.Link)).toBe(
        `/${APP_PATH}/service/${ServiceDefinitionIdentifier.Link}/${id}`
      );
    }
  );
});

describe('getPrivateNavigationRegisteredPlatformsByIdentifier', () => {
  it('returns only platforms for the requested identifier with title, url, and service instance id', () => {
    const queryData = buildRegisteredPlatformsQuery({
      registeredPlatforms: [
        createRegisteredPlatform({
          title: 'OpenCTI Prod',
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          url: 'https://opencti.example.com',
          serviceInstanceId: 'service-instance-opencti-prod',
        }),
        createRegisteredPlatform({
          title: 'OpenCTI Empty URL',
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          serviceInstanceId: 'service-instance-opencti-empty-url',
        }),
        createRegisteredPlatform({
          title: 'OpenCTI Missing Service Instance',
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        }),
        createRegisteredPlatform({
          title: 'OpenAEV Prod',
          identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
          serviceInstanceId: 'service-instance-openaev-prod',
        }),
      ],
    });

    expect(
      getPrivateNavigationRegisteredPlatformsByIdentifier(
        queryData,
        PlatformIdentifier.Opencti
      )
    ).toEqual([
      {
        serviceInstanceId: 'service-instance-opencti-prod',
        title: 'OpenCTI Prod',
        url: 'https://opencti.example.com',
      },
      {
        serviceInstanceId: 'service-instance-opencti-empty-url',
        title: 'OpenCTI Empty URL',
        url: undefined,
      },
    ]);
  });

  it('returns an empty array when query data is undefined', () => {
    expect(
      getPrivateNavigationRegisteredPlatformsByIdentifier(
        undefined,
        PlatformIdentifier.Openaev
      )
    ).toEqual([]);
  });
});
