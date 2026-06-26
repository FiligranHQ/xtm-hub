import { APP_PATH } from '@/utils/path/constant';
import {
  PrivateNavigationServiceInstancesQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import { getPrivateNavigationServiceHrefs } from './private-navigation.utils';

type ServiceInstanceEdge =
  PrivateNavigationServiceInstancesQuery['serviceInstances']['edges'][number];
type ServiceInstanceLinks = NonNullable<ServiceInstanceEdge['node']>['links'];

const buildQuery = (
  edges: PrivateNavigationServiceInstancesQuery['serviceInstances']['edges']
): PrivateNavigationServiceInstancesQuery => ({
  __typename: 'Query',
  serviceInstances: {
    __typename: 'ServiceConnection',
    edges,
  },
});

const createEdge = ({
  id,
  identifier,
  links = [],
}: {
  id: string;
  identifier: ServiceDefinitionIdentifier;
  links?: ServiceInstanceLinks;
}): ServiceInstanceEdge => ({
  __typename: 'ServiceInstanceEdge',
  node: {
    __typename: 'ServiceInstance',
    id,
    service_definition: {
      __typename: 'ServiceDefinition',
      identifier,
    },
    links,
  },
});

describe('getPrivateNavigationServiceHrefs', () => {
  it.each`
    description                  | queryData
    ${'query data is undefined'} | ${undefined}
    ${'query data has no edges'} | ${buildQuery([])}
  `('returns an empty map when $description', ({ queryData }) => {
    expect(getPrivateNavigationServiceHrefs(queryData)).toEqual(new Map());
  });

  it('skips null nodes', () => {
    const queryData = buildQuery([
      {
        __typename: 'ServiceInstanceEdge',
        node: null,
      },
      createEdge({
        id: 'opencti-integrations-id',
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
      }),
    ]);

    const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

    expect(serviceHrefs.size).toBe(1);
    expect(
      serviceHrefs.get(ServiceDefinitionIdentifier.OpenctiIntegrations)
    ).toBe(
      `/${APP_PATH}/service/${ServiceDefinitionIdentifier.OpenctiIntegrations}/opencti-integrations-id`
    );
  });

  it('deduplicates by service definition identifier and keeps the first instance', () => {
    const queryData = buildQuery([
      createEdge({
        id: 'first-id',
        identifier: ServiceDefinitionIdentifier.OpenaevScenarios,
      }),
      createEdge({
        id: 'second-id',
        identifier: ServiceDefinitionIdentifier.OpenaevScenarios,
      }),
    ]);

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
      const queryData = buildQuery([
        createEdge({
          id,
          identifier,
        }),
      ]);

      const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

      expect(serviceHrefs.get(identifier)).toBe(
        `/${APP_PATH}/service/${identifier}/${id}`
      );
    }
  );

  it('for Link identifier, uses first non-empty external URL when present', () => {
    const queryData = buildQuery([
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
    ]);

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
      const queryData = buildQuery([
        createEdge({
          id,
          identifier: ServiceDefinitionIdentifier.Link,
          links,
        }),
      ]);

      const serviceHrefs = getPrivateNavigationServiceHrefs(queryData);

      expect(serviceHrefs.get(ServiceDefinitionIdentifier.Link)).toBe(
        `/${APP_PATH}/service/${ServiceDefinitionIdentifier.Link}/${id}`
      );
    }
  );
});
