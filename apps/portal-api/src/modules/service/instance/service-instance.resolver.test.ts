import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../tests/tests.const';
import {
  IntegrationType,
  MutationAddServicePictureArgs,
  MutationUpdatePlatformServiceMetadataArgs,
  ServiceDefinitionIdentifier,
  ServiceInstanceResolvers,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../../utils/error/error.code';
import { ErrorType } from '../../../utils/error/error.type';
import * as userServiceCapabilityHelper from '../../security-management/user-service-capability/user-service-capability.helper';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../../shareable-resource/opencti/integration/integration.model';
import { ServiceInstanceApp } from './service-instance.app';
import * as serviceInstanceDomain from './service-instance.domain';
import serviceInstanceResolver from './service-instance.resolver';

describe('serviceInstance.__resolveType', () => {
  it.each`
    type                                      | integration_type             | expected
    ${OPENAEV_SCENARIO_DOCUMENT_TYPE}         | ${undefined}                 | ${'OpenAEVScenario'}
    ${OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE} | ${undefined}                 | ${'OpenCTICustomDashboard'}
    ${OPENCTI_INTEGRATION_DOCUMENT_TYPE}      | ${IntegrationType.Connector} | ${'Connector'}
    ${OPENCTI_INTEGRATION_DOCUMENT_TYPE}      | ${IntegrationType.CsvFeed}   | ${'CsvFeed'}
    ${OPENCTI_INTEGRATION_DOCUMENT_TYPE}      | ${undefined}                 | ${'OpenCTIIntegration'}
    ${'unknown_type'}                         | ${undefined}                 | ${'SeoServiceInstance'}
  `(
    'should resolve type=$type integration_type=$integration_type to $expected',
    ({ type, integration_type, expected }) => {
      const result = (
        serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
      ).__resolveType({ type, integration_type });
      expect(result).toBe(expected);
    }
  );
});

describe('serviceInstance field resolvers', () => {
  it('logo_document_id should return global ID when set', () => {
    const rawId = uuidv4();
    const result = (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).logo_document_id({ logo_document_id: rawId });
    expect(result).toBe(toGlobalId('Document', rawId));
  });

  it('logo_document_id should return undefined when not set', () => {
    const result = (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).logo_document_id({ logo_document_id: null });
    expect(result).toBeUndefined();
  });

  it('illustration_document_id should return global ID when set', () => {
    const rawId = uuidv4();
    const result = (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).illustration_document_id({ illustration_document_id: rawId });
    expect(result).toBe(toGlobalId('Document', rawId));
  });

  it('illustration_document_id should return undefined when not set', () => {
    const result = (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).illustration_document_id({ illustration_document_id: null });
    expect(result).toBeUndefined();
  });

  it('links should load links by service instance id', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID;
    const expected = [] as unknown as Awaited<
      ReturnType<typeof serviceInstanceDomain.loadLinks>
    >;
    vi.spyOn(serviceInstanceDomain, 'loadLinks').mockResolvedValue(expected);

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).links({ id }, {}, contextSimpleUserFiligran2, GRAPHQL_RESOLVE_INFO);

    expect(serviceInstanceDomain.loadLinks).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('service_definition should load service definition by service instance id', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id: uuidv4() } as unknown as Awaited<
      ReturnType<
        typeof serviceInstanceDomain.loadServiceDefinitionByServiceInstance
      >
    >;
    vi.spyOn(
      serviceInstanceDomain,
      'loadServiceDefinitionByServiceInstance'
    ).mockResolvedValue(expected);

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).service_definition(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });

  it('organization_subscribed should call loadIsSubscribed with org id and instance id', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID as ServiceInstanceId;
    vi.spyOn(serviceInstanceDomain, 'loadIsSubscribed').mockResolvedValue(true);

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).organization_subscribed(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(serviceInstanceDomain.loadIsSubscribed).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user.selected_organization_id,
      id
    );
    expect(result).toBe(true);
  });

  it('capabilities should load capabilities for user and instance', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID;
    const expected = [] as unknown as Awaited<
      ReturnType<typeof userServiceCapabilityHelper.loadCapabilities>
    >;
    vi.spyOn(userServiceCapabilityHelper, 'loadCapabilities').mockResolvedValue(
      expected
    );

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).capabilities(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(userServiceCapabilityHelper.loadCapabilities).toHaveBeenCalledWith(
      id,
      contextSimpleUserFiligran2.user.id,
      contextSimpleUserFiligran2.user.selected_organization_id
    );
    expect(result).toEqual(expected);
  });

  it('user_joined should call getUserJoined with user, org, and instance id', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID as ServiceInstanceId;
    vi.spyOn(serviceInstanceDomain, 'getUserJoined').mockResolvedValue(false);

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).user_joined({ id }, {}, contextSimpleUserFiligran2, GRAPHQL_RESOLVE_INFO);

    expect(serviceInstanceDomain.getUserJoined).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user.id,
      contextSimpleUserFiligran2.user.selected_organization_id,
      id
    );
    expect(result).toBe(false);
  });

  it('subscriptions should load subscriptions by service instance id', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID as ServiceInstanceId;
    const expected = [] as unknown as Awaited<
      ReturnType<typeof serviceInstanceDomain.loadServiceInstanceSubscriptions>
    >;
    vi.spyOn(
      serviceInstanceDomain,
      'loadServiceInstanceSubscriptions'
    ).mockResolvedValue(expected);

    const result = await (
      serviceInstanceResolver.ServiceInstance as unknown as ServiceInstanceResolvers
    ).subscriptions(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      serviceInstanceDomain.loadServiceInstanceSubscriptions
    ).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });
});

describe('service instances GraphQL query', () => {
  it('should delegate to loadServiceInstances and return result', async () => {
    const expected = { edges: [] } as unknown as Awaited<
      ReturnType<typeof serviceInstanceDomain.loadServiceInstances>
    >;
    vi.spyOn(serviceInstanceDomain, 'loadServiceInstances').mockResolvedValue(
      expected
    );

    const result = await serviceInstanceResolver.Query!.serviceInstances!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('service instance links by tags GraphQL query', () => {
  it('should delegate to ServiceInstanceApp.loadLinkServiceInstancesByTags', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.loadLinkServiceInstancesByTags>
    >;
    vi.spyOn(
      ServiceInstanceApp,
      'loadLinkServiceInstancesByTags'
    ).mockResolvedValue(expected);

    const result = await serviceInstanceResolver.Query!
      .serviceInstanceLinksByTags!(
      {},
      { tags: ['tag1'] },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      ServiceInstanceApp.loadLinkServiceInstancesByTags
    ).toHaveBeenCalledWith(['tag1']);
    expect(result).toEqual(expected);
  });
});

describe('service instance by id GraphQL query', () => {
  it('should pass user and service_instance_id to ServiceInstanceApp.loadServiceInstanceAndGrantAccess', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id } as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.loadServiceInstanceAndGrantAccess>
    >;
    vi.spyOn(
      ServiceInstanceApp,
      'loadServiceInstanceAndGrantAccess'
    ).mockResolvedValue(expected);

    const result = await serviceInstanceResolver.Query!.serviceInstanceById!(
      {},
      { service_instance_id: id },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      ServiceInstanceApp.loadServiceInstanceAndGrantAccess
    ).toHaveBeenCalledWith(contextSimpleUserFiligran2.user, id);
    expect(result).toEqual(expected);
  });
});

describe('service instance by id with subscriptions GraphQL query', () => {
  it('should delegate to loadServiceWithSubscriptions', async () => {
    const id = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id } as unknown as Awaited<
      ReturnType<typeof serviceInstanceDomain.loadServiceWithSubscriptions>
    >;
    vi.spyOn(
      serviceInstanceDomain,
      'loadServiceWithSubscriptions'
    ).mockResolvedValue(expected);

    const result = await serviceInstanceResolver.Query!
      .serviceInstanceByIdWithSubscriptions!(
      {},
      { service_instance_id: id, searchTerm: 'test' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      serviceInstanceDomain.loadServiceWithSubscriptions
    ).toHaveBeenCalledWith(id, 'test');
    expect(result).toEqual(expected);
  });
});

describe('subscribed service instances by identifier GraphQL query', () => {
  it('should delegate to ServiceInstanceApp.loadSubscribedServiceInstancesByIdentifier', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<
        typeof ServiceInstanceApp.loadSubscribedServiceInstancesByIdentifier
      >
    >;
    vi.spyOn(
      ServiceInstanceApp,
      'loadSubscribedServiceInstancesByIdentifier'
    ).mockResolvedValue(expected);

    const result = await serviceInstanceResolver.Query!
      .subscribedServiceInstancesByIdentifier!(
      {},
      { identifier: 'opencti' as unknown as ServiceDefinitionIdentifier },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      ServiceInstanceApp.loadSubscribedServiceInstancesByIdentifier
    ).toHaveBeenCalledWith(contextSimpleUserFiligran2.user.id, 'opencti');
    expect(result).toEqual(expected);
  });
});

describe('seo service instances GraphQL query', () => {
  it('should delegate to ServiceInstanceApp.loadSeoServiceInstances', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.loadSeoServiceInstances>
    >;
    vi.spyOn(ServiceInstanceApp, 'loadSeoServiceInstances').mockResolvedValue(
      expected
    );

    const result = await serviceInstanceResolver.Query!.seoServiceInstances!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('seo service instance GraphQL query', () => {
  it('should return the service when found', async () => {
    const expected = { id: uuidv4() } as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.loadSeoServiceInstance>
    >;
    vi.spyOn(ServiceInstanceApp, 'loadSeoServiceInstance').mockResolvedValue(
      expected
    );

    const result = await serviceInstanceResolver.Query!.seoServiceInstance!(
      {},
      { slug: 'my-service' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });

  it('should throw NotFound when app throws ServiceNotFound', async () => {
    vi.spyOn(ServiceInstanceApp, 'loadSeoServiceInstance').mockRejectedValue(
      new Error(ErrorCode.ServiceNotFound)
    );

    const call = serviceInstanceResolver.Query!.seoServiceInstance!(
      {},
      { slug: 'unknown' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });

  it('should map to ForbiddenAccess for ServiceNotManageable error', async () => {
    vi.spyOn(ServiceInstanceApp, 'loadSeoServiceInstance').mockRejectedValue(
      new Error(ErrorCode.ServiceNotManageable)
    );

    const call = serviceInstanceResolver.Query!.seoServiceInstance!(
      {},
      { slug: 'my-service' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});

describe('mutation.addServicePicture', () => {
  it('should delegate to ServiceInstanceApp.addServicePicture and return result', async () => {
    const expected = { id: SERVICES.INSTANCES.EPIC.ID } as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.addServicePicture>
    >;
    vi.spyOn(ServiceInstanceApp, 'addServicePicture').mockResolvedValue(
      expected
    );

    const result = await serviceInstanceResolver.Mutation!.addServicePicture!(
      {},
      {
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        document: {} as unknown as MutationAddServicePictureArgs['document'],
        isLogo: true,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(ServiceInstanceApp.addServicePicture).toHaveBeenCalledWith(
      SERVICES.INSTANCES.EPIC.ID,
      {},
      true
    );
    expect(result).toEqual(expected);
  });
});

describe('mutation.updatePlatformServiceMetadata', () => {
  it('should delegate to ServiceInstanceApp.updatePlatformServiceMetadata with user context', async () => {
    const expected = { id: SERVICES.INSTANCES.EPIC.ID } as unknown as Awaited<
      ReturnType<typeof ServiceInstanceApp.updatePlatformServiceMetadata>
    >;
    vi.spyOn(
      ServiceInstanceApp,
      'updatePlatformServiceMetadata'
    ).mockResolvedValue(expected);
    const input = {
      serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
    } as unknown as MutationUpdatePlatformServiceMetadataArgs['input'];

    const result = await serviceInstanceResolver.Mutation!
      .updatePlatformServiceMetadata!(
      {},
      { input, document: null },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(
      ServiceInstanceApp.updatePlatformServiceMetadata
    ).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user,
      SERVICES.INSTANCES.EPIC.ID,
      input,
      null
    );
    expect(result).toEqual(expected);
  });

  it('should map to ForbiddenAccess for ServiceNotManageable error', async () => {
    vi.spyOn(
      ServiceInstanceApp,
      'updatePlatformServiceMetadata'
    ).mockRejectedValue(new Error(ErrorCode.ServiceNotManageable));

    const call = serviceInstanceResolver.Mutation!
      .updatePlatformServiceMetadata!(
      {},
      {
        input: {
          serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        } as unknown as MutationUpdatePlatformServiceMetadataArgs['input'],
        document: null,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});
