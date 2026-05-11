import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../../tests/tests.const';
import {
  OpenAevScenario,
  Organization,
  SubscriptionModel,
} from '../../../../__generated__/resolvers-types';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../../model/kanel/public/ServiceInstance';
import UseCase from '../../../../model/kanel/public/UseCase';
import User from '../../../../model/kanel/public/User';
import { DocumentChildrenDomain } from '../../../document/domain/document.children.domain';
import { DocumentDomain } from '../../../document/domain/document.domain';
import * as serviceInstanceDomain from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';
import scenarioResolver from './scenario.resolver';

describe('openAEVScenario field resolvers', () => {
  describe('openAEVScenario.use_cases', () => {
    it('should load use cases by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = [{ id: uuidv4(), name: 'Use Case A' }];
      vi.spyOn(useCaseDomain, 'loadUseCasesByDocumentId').mockResolvedValue(
        expected as unknown as UseCase[]
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!.use_cases!(
        { id: documentId } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(useCaseDomain.loadUseCasesByDocumentId).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('openAEVScenario.children_documents', () => {
    it('should load children images by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = [{ id: uuidv4() }];
      vi.spyOn(
        DocumentChildrenDomain,
        'loadImagesByDocumentId'
      ).mockResolvedValue(
        expected as unknown as Awaited<
          ReturnType<typeof DocumentChildrenDomain.loadImagesByDocumentId>
        >
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!
        .children_documents!(
        { id: documentId } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        DocumentChildrenDomain.loadImagesByDocumentId
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('openAEVScenario.uploader', () => {
    it('should load uploader by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = { id: uuidv4(), email: 'user@test.com' };
      vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(
        expected as unknown as User | undefined
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!.uploader!(
        { id: documentId } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('openAEVScenario.uploader_organization', () => {
    it('should load uploader organization by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = { id: uuidv4(), name: 'Org A' };
      vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
        expected as unknown as Organization | undefined
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!
        .uploader_organization!(
        { id: documentId } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(DocumentDomain.loadUploaderOrganization).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('openAEVScenario.service_instance', () => {
    it('should load service instance by service_instance_id', async () => {
      // Given
      const serviceInstanceId = SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID;
      const expected = { id: serviceInstanceId, name: 'open aev scenarios' };
      vi.spyOn(serviceInstanceDomain, 'getServiceInstance').mockResolvedValue(
        expected as unknown as ServiceInstance | undefined
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!.service_instance!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(serviceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('openAEVScenario.subscription', () => {
    it('should load subscription model using context user and service_instance_id', async () => {
      // Given
      const serviceInstanceId = SERVICES.INSTANCES.OPENAEV_SCENARIOS
        .ID as ServiceInstanceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(subscriptionApp, 'loadSubscriptionModel').mockResolvedValue(
        expected
      );

      // When
      const result = await scenarioResolver.OpenAEVScenario!.subscription!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as OpenAevScenario,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
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
