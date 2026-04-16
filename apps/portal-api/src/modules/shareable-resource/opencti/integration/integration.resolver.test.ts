import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
  SERVICES,
} from '../../../../../tests/tests.const';
import {
  Connector,
  IntegrationType,
  SubscriptionModel,
} from '../../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../../utils/app-logger.util';
import { DocumentChildrenDomain } from '../../../document/domain/document.children.domain';
import { DocumentDomain } from '../../../document/domain/document.domain';
import * as serviceInstanceDomain from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      // Given
      const feed = {
        integration_type: integrationType,
        id: uuidv4(),
      } as unknown as Integration;

      // When
      const result = getResolveType()(feed);

      // Then
      expect(result).toBe(expectedTypeName);
    }
  );

  it('should call logApp.error and return undefined for unknown integration type', () => {
    // Given
    const unknownType = 'unknown_type' as IntegrationType;
    const integrationId = uuidv4();
    const feed = {
      integration_type: unknownType,
      id: integrationId,
    } as unknown as Integration;
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    // When
    const result = getResolveType()(feed);

    // Then
    expect(logApp.error).toHaveBeenCalledWith(
      `Unknown resolve type for integration ${integrationId} and integration type ${unknownType}`
    );
    expect(result).toBeUndefined();
  });
});

describe('integration field resolvers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('integration.use_cases', () => {
    it('should load use cases by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = [{ id: uuidv4(), name: 'Use Case A' }];
      vi.spyOn(useCaseDomain, 'loadUseCasesByDocumentId').mockResolvedValue(
        expected as never
      );

      // When
      const result = await integrationResolver.Integration!.use_cases!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(useCaseDomain.loadUseCasesByDocumentId).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('integration.children_documents', () => {
    it('should load children images by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = [{ id: uuidv4() }];
      vi.spyOn(
        DocumentChildrenDomain,
        'loadImagesByDocumentId'
      ).mockResolvedValue(expected as never);

      // When
      const result = await integrationResolver.Integration!.children_documents!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(
        DocumentChildrenDomain.loadImagesByDocumentId
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.uploader', () => {
    it('should load uploader by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = { id: uuidv4(), email: 'user@test.com' };
      vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(
        expected as never
      );

      // When
      const result = await integrationResolver.Integration!.uploader!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('integration.uploader_organization', () => {
    it('should load uploader organization by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = { id: uuidv4(), name: 'Org A' };
      vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
        expected as never
      );

      // When
      const result = await integrationResolver.Integration!
        .uploader_organization!(
        { id: documentId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(DocumentDomain.loadUploaderOrganization).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('integration.service_instance', () => {
    it('should load service instance by service_instance_id', async () => {
      // Given
      const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS.ID;
      const expected = { id: serviceInstanceId, name: 'integrations' };
      vi.spyOn(serviceInstanceDomain, 'getServiceInstance').mockResolvedValue(
        expected as never
      );

      // When
      const result = await integrationResolver.Integration!.service_instance!(
        { service_instance_id: serviceInstanceId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(serviceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('integration.subscription', () => {
    it('should load subscription model using context user and service_instance_id', async () => {
      // Given
      const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS
        .ID as ServiceInstanceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(subscriptionApp, 'loadSubscriptionModel').mockResolvedValue(
        expected
      );

      // When
      const result = await integrationResolver.Integration!.subscription!(
        { service_instance_id: serviceInstanceId } as unknown as Connector,
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      // Then
      expect(subscriptionApp.loadSubscriptionModel).toHaveBeenCalledWith(
        contextSimpleUserFiligran2.user,
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });
});
