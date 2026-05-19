import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../../tests/tests.const';
import {
  OpenCtiPlaybook,
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
import playbookResolver from './playbook.resolver';

describe('openCTIPlaybook field resolvers', () => {
  describe('openCTIPlaybook.use_cases', () => {
    it('should load use cases by document id', async () => {
      const documentId = uuidv4();
      const expected = [{ id: uuidv4(), name: 'Use Case A' }];
      vi.spyOn(useCaseDomain, 'loadUseCasesByDocumentId').mockResolvedValue(
        expected as unknown as UseCase[]
      );

      const result = await playbookResolver.OpenCTIPlaybook!.use_cases!(
        { id: documentId } as unknown as OpenCtiPlaybook,
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

  describe('openCTIPlaybook.children_documents', () => {
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

      const result = await playbookResolver.OpenCTIPlaybook!
        .children_documents!(
        { id: documentId } as unknown as OpenCtiPlaybook,
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

  describe('openCTIPlaybook.uploader', () => {
    it('should load uploader by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), email: 'user@test.com' };
      vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(
        expected as unknown as User | undefined
      );

      const result = await playbookResolver.OpenCTIPlaybook!.uploader!(
        { id: documentId } as unknown as OpenCtiPlaybook,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });

  describe('openCTIPlaybook.uploader_organization', () => {
    it('should load uploader organization by document id', async () => {
      const documentId = uuidv4();
      const expected = { id: uuidv4(), name: 'Org A' };
      vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
        expected as unknown as Organization | undefined
      );

      const result = await playbookResolver.OpenCTIPlaybook!
        .uploader_organization!(
        { id: documentId } as unknown as OpenCtiPlaybook,
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

  describe('openCTIPlaybook.service_instance', () => {
    it('should load service instance by service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.OPENCTI_PLAYBOOKS.ID;
      const expected = { id: serviceInstanceId, name: 'opencti playbooks' };
      vi.spyOn(serviceInstanceDomain, 'getServiceInstance').mockResolvedValue(
        expected as unknown as ServiceInstance | undefined
      );

      const result = await playbookResolver.OpenCTIPlaybook!.service_instance!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as OpenCtiPlaybook,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(serviceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });
  });

  describe('openCTIPlaybook.subscription', () => {
    it('should load subscription model using context user and service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.OPENCTI_PLAYBOOKS
        .ID as ServiceInstanceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(subscriptionApp, 'loadSubscriptionModel').mockResolvedValue(
        expected
      );

      const result = await playbookResolver.OpenCTIPlaybook!.subscription!(
        {
          service_instance_id: serviceInstanceId,
        } as unknown as OpenCtiPlaybook,
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
