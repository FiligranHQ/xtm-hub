import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../../tests/tests.const';
import {
  Connector,
  IntegrationType,
  Organization,
  SubscriptionModel,
} from '../../../../__generated__/resolvers-types';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../../model/kanel/public/ServiceInstance';
import UseCase from '../../../../model/kanel/public/UseCase';
import User from '../../../../model/kanel/public/User';
import { logApp } from '../../../../utils/app-logger.util';
import { ServiceInstanceDomain } from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { Integration } from './integration.model';
import integrationResolver from './integration.resolver';

type IntegrationResolveTypeFn = (feed: Integration) => string | undefined;

const getResolveType = (): IntegrationResolveTypeFn =>
  (
    integrationResolver.Integration as unknown as {
      __resolveType: IntegrationResolveTypeFn;
    }
  ).__resolveType;

describe('integration.__resolveType', () => {
  it.each`
    integrationType                          | expectedTypeName
    ${IntegrationType.Connector}             | ${'Connector'}
    ${IntegrationType.CsvFeed}               | ${'CsvFeed'}
    ${IntegrationType.TaxiiFeed}             | ${'TaxiiFeed'}
    ${IntegrationType.RssFeed}               | ${'RssFeed'}
    ${IntegrationType.Stream}                | ${'Stream'}
    ${IntegrationType.ThirdPartyIntegration} | ${'ThirdPartyIntegration'}
  `(
    'should resolve $integrationType to $expectedTypeName',
    ({ integrationType, expectedTypeName }) => {
      const feed = {
        integration_type: integrationType,
        id: uuidv4(),
      } as unknown as Integration;

      const result = getResolveType()(feed);

      expect(result).toBe(expectedTypeName);
    }
  );

  it('should call logApp.error and return undefined for unknown integration type', () => {
    const unknownType = 'unknown_type' as IntegrationType;
    const integrationId = uuidv4();
    const feed = {
      integration_type: unknownType,
      id: integrationId,
    } as unknown as Integration;
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    const result = getResolveType()(feed);

    expect(logApp.error).toHaveBeenCalledWith(
      `Unknown resolve type for integration ${integrationId} and integration type ${unknownType}`
    );
    expect(result).toBeUndefined();
  });
});

describe('integration field resolvers', () => {
  describe('integration.use_cases', () => {
    it('should load use cases by document id', async () => {
      const documentId = uuidv4();
      const expected = [{ id: uuidv4(), name: 'Use Case A' }];
      vi.spyOn(
        contextSimpleUserFiligran2.dataLoaders.useCasesByDocumentIdLoader,
        'load'
      ).mockResolvedValue(expected as unknown as UseCase[]);

      const result = await integrationResolver.Integration!.use_cases!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        contextSimpleUserFiligran2.dataLoaders.useCasesByDocumentIdLoader.load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.children_documents', () => {
    it('should load children images by document id', async () => {
      const documentId = uuidv4();
      const expected = [{ id: uuidv4() }];
      vi.spyOn(
        contextSimpleUserFiligran2.dataLoaders.imagesByDocumentIdLoader,
        'load'
      ).mockResolvedValue(
        expected as unknown as Awaited<
          ReturnType<
            typeof contextSimpleUserFiligran2.dataLoaders.imagesByDocumentIdLoader.load
          >
        >
      );

      const result = await integrationResolver.Integration!.children_documents!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        contextSimpleUserFiligran2.dataLoaders.imagesByDocumentIdLoader.load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.uploader', () => {
    it('should load uploader by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), email: 'user@test.com' };
      vi.spyOn(
        contextSimpleUserFiligran2.dataLoaders.uploaderLoader,
        'load'
      ).mockResolvedValue(expected as unknown as User | null);

      const result = await integrationResolver.Integration!.uploader!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        contextSimpleUserFiligran2.dataLoaders.uploaderLoader.load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.uploader_organization', () => {
    it('should load uploader organization by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), name: 'Org A' };
      vi.spyOn(
        contextSimpleUserFiligran2.dataLoaders.uploaderOrganizationLoader,
        'load'
      ).mockResolvedValue(expected as unknown as Organization | null);

      const result = await integrationResolver.Integration!
        .uploader_organization!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        contextSimpleUserFiligran2.dataLoaders.uploaderOrganizationLoader.load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.service_instance', () => {
    it('should load service instance by service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS.ID;
      const expected = { id: serviceInstanceId, name: 'integrations' };
      vi.spyOn(ServiceInstanceDomain, 'getServiceInstance').mockResolvedValue(
        expected as unknown as ServiceInstance | undefined
      );

      const result = await integrationResolver.Integration!.service_instance!(
        { service_instance_id: serviceInstanceId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(ServiceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('integration.subscription', () => {
    it('should load subscription model using context user and service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS
        .ID as ServiceInstanceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(subscriptionApp, 'loadSubscriptionModel').mockResolvedValue(
        expected
      );

      const result = await integrationResolver.Integration!.subscription!(
        { service_instance_id: serviceInstanceId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(subscriptionApp.loadSubscriptionModel).toHaveBeenCalledWith(
        contextSimpleUserFiligran2.user,
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });
});
