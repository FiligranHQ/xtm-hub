import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import {
  CustomView,
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
import { ServiceInstanceDomain } from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';
import customViewResolver from './custom-view.resolver';

describe('customView field resolvers', () => {
  describe('customView.use_cases', () => {
    it('should load use cases by document id', async () => {
      const documentId = uuidv4();
      const expected = [{ id: uuidv4(), name: 'Use Case A' }];
      vi.spyOn(useCaseDomain, 'loadUseCasesByDocumentId').mockResolvedValue(
        expected as unknown as UseCase[]
      );

      const result = await customViewResolver.CustomView!.use_cases!(
        { id: documentId } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(useCaseDomain.loadUseCasesByDocumentId).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('customView.entity_types', () => {
    it('should return entity types from the document column', async () => {
      const expected = ['Attack-Pattern', 'Campaign'];

      const result = await customViewResolver.CustomView!.entity_types!(
        { entity_types: expected } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(result).toEqual(expected);
    });

    it('should default to an empty array when the column is null', async () => {
      const result = await customViewResolver.CustomView!.entity_types!(
        { entity_types: null } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(result).toEqual([]);
    });
  });

  describe('customView.children_documents', () => {
    it('should load children images by document id', async () => {
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

      const result = await customViewResolver.CustomView!.children_documents!(
        { id: documentId } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        DocumentChildrenDomain.loadImagesByDocumentId
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('customView.uploader', () => {
    it('should load uploader by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), email: 'user@test.com' };
      vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(
        expected as unknown as User | undefined
      );

      const result = await customViewResolver.CustomView!.uploader!(
        { id: documentId } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('customView.uploader_organization', () => {
    it('should load uploader organization by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), name: 'Org A' };
      vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
        expected as unknown as Organization | undefined
      );

      const result = await customViewResolver.CustomView!
        .uploader_organization!(
        { id: documentId } as unknown as CustomView,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(DocumentDomain.loadUploaderOrganization).toHaveBeenCalledWith(
        documentId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('customView.service_instance', () => {
    it('should load service instance by service_instance_id', async () => {
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expected = { id: serviceInstanceId, name: 'opencti custom views' };
      vi.spyOn(ServiceInstanceDomain, 'getServiceInstance').mockResolvedValue(
        expected as unknown as ServiceInstance | undefined
      );

      const result = await customViewResolver.CustomView!.service_instance!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as CustomView,
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

  describe('customView.subscription', () => {
    it('should load subscription model using context user and service_instance_id', async () => {
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(subscriptionApp, 'loadSubscriptionModel').mockResolvedValue(
        expected
      );

      const result = await customViewResolver.CustomView!.subscription!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as CustomView,
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
