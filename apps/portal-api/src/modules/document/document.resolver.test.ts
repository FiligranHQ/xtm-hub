import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../tests/tests.const';
import {
  DocumentResolvers,
  IntegrationType,
  MutationCreateDocumentArgs,
  MutationUpdateDocumentArgs,
  Organization,
  QueryDocumentsArgs,
  QueryPublicDocumentsArgs,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import DocumentModel, { DocumentId } from '../../model/kanel/public/Document';
import ServiceInstance from '../../model/kanel/public/ServiceInstance';
import User from '../../model/kanel/public/User';
import {
  BadRequestErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import * as serviceInstanceDomain from '../service/instance/service-instance.domain';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../shareable-resource/opencti/integration/integration.model';
import * as subscriptionDomain from '../subscription/subscription.domain';
import { DocumentApp } from './document.app';
import * as documentHelper from './document.helper';
import documentResolver from './document.resolver';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

describe('create document GraphQL mutation', () => {
  it('should delegate to DocumentApp.createDocument and return result', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id: uuidv4() as DocumentId } as unknown as Awaited<
      ReturnType<typeof DocumentApp.createDocument>
    >;
    vi.spyOn(DocumentApp, 'createDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.createDocument!(
      {},
      { serviceInstanceId, input: {} } as unknown as MutationCreateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });

  it('should throw AlreadyExists when slug constraint is violated', async () => {
    vi.spyOn(DocumentApp, 'createDocument').mockRejectedValue(
      new Error('document_type_slug_unique constraint violated')
    );

    const call = documentResolver.Mutation!.createDocument!(
      {},
      {
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        input: {},
      } as unknown as MutationCreateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.AlreadyExists });
  });

  it('should map to BadRequest for DocumentFileMissing error', async () => {
    vi.spyOn(DocumentApp, 'createDocument').mockRejectedValue(
      new Error(BadRequestErrorCode.DocumentFileMissing)
    );

    const call = documentResolver.Mutation!.createDocument!(
      {},
      {
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        input: {},
      } as unknown as MutationCreateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('update document GraphQL mutation', () => {
  it('should decode documentId and delegate to DocumentApp.updateDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as unknown as Awaited<
      ReturnType<typeof DocumentApp.updateDocument>
    >;
    vi.spyOn(DocumentApp, 'updateDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.updateDocument!(
      {},
      {
        documentId: globalDocId,
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        existingImageIds: [],
        input: {},
      } as unknown as MutationUpdateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentApp.updateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ parentDocumentId: rawDocId })
    );
    expect(result).toEqual(expected);
  });

  it('should throw AlreadyExists on slug unique violation', async () => {
    vi.spyOn(DocumentApp, 'updateDocument').mockRejectedValue(
      new Error('document_type_slug_unique')
    );

    const call = documentResolver.Mutation!.updateDocument!(
      {},
      {
        documentId: toGlobalId('Document', uuidv4()),
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        existingImageIds: [],
        input: {},
      } as unknown as MutationUpdateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.AlreadyExists });
  });

  it('should map to BadRequest for DocumentMissingMetadata error', async () => {
    vi.spyOn(DocumentApp, 'updateDocument').mockRejectedValue(
      new Error(BadRequestErrorCode.DocumentMissingMetadata)
    );

    const call = documentResolver.Mutation!.updateDocument!(
      {},
      {
        documentId: toGlobalId('Document', uuidv4()),
        serviceInstanceId: SERVICES.INSTANCES.EPIC.ID,
        existingImageIds: [],
        input: {},
      } as unknown as MutationUpdateDocumentArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('delete document GraphQL mutation', () => {
  it('should decode documentId and delegate to DocumentApp.deleteDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as unknown as Awaited<
      ReturnType<typeof DocumentApp.deleteDocument>
    >;
    vi.spyOn(DocumentApp, 'deleteDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.deleteDocument!(
      {},
      {
        documentId: globalDocId,
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
        forceDelete: false,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentApp.deleteDocument).toHaveBeenCalledWith(
      rawDocId,
      SERVICES.INSTANCES.EPIC.ID,
      false
    );
    expect(result).toEqual(expected);
  });

  it('should map to NotFound for DocumentNotFound error', async () => {
    vi.spyOn(DocumentApp, 'deleteDocument').mockRejectedValue(
      new Error(NotFoundErrorCode.DocumentNotFound)
    );

    const call = documentResolver.Mutation!.deleteDocument!(
      {},
      {
        documentId: toGlobalId('Document', uuidv4()),
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
        forceDelete: false,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});

describe('increment share number document GraphQL mutation', () => {
  it('should load document, update counters, and return result', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const doc = {
      id: rawDocId,
      service_instance_id: SERVICES.INSTANCES.EPIC.ID,
      name: 'doc',
    } as unknown as Awaited<
      ReturnType<typeof DocumentDomain.loadDocumentWithMetadataById>
    >;
    const updated = { ...doc, share_number: 1 } as unknown as Awaited<
      ReturnType<typeof documentHelper.updateDocumentWithCounters>
    >;
    vi.spyOn(DocumentDomain, 'loadDocumentWithMetadataById').mockResolvedValue(
      doc
    );
    vi.spyOn(documentHelper, 'updateDocumentWithCounters').mockResolvedValue(
      updated
    );
    vi.spyOn(
      serviceInstanceDomain,
      'loadServiceDefinitionByServiceInstance'
    ).mockRejectedValue(new Error('skip telemetry'));

    const result = await documentResolver.Mutation!
      .incrementShareNumberDocument!(
      {},
      { documentId: toGlobalId('Document', rawDocId) },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(updated);
  });

  it('should map to ForbiddenAccess for ServiceNotManageable error', async () => {
    vi.spyOn(DocumentDomain, 'loadDocumentWithMetadataById').mockRejectedValue(
      new Error(ForbiddenErrorCode.ServiceNotManageable)
    );

    const call = documentResolver.Mutation!.incrementShareNumberDocument!(
      {},
      { documentId: toGlobalId('Document', uuidv4()) },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});

describe('document.__resolveType', () => {
  it.each`
    type                                      | expected
    ${OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE} | ${'CustomDashboard'}
    ${OPENAEV_SCENARIO_DOCUMENT_TYPE}         | ${'OpenAEVScenario'}
  `(
    'should resolve $type to $expected without querying metadata',
    async ({ type, expected }) => {
      const doc = { id: uuidv4(), type } as unknown as DocumentModel;
      const result = await (
        documentResolver.Document as unknown as DocumentResolvers
      ).__resolveType(doc);
      expect(result).toBe(expected);
    }
  );

  it.each`
    integrationType                          | expected
    ${IntegrationType.Connector}             | ${'Connector'}
    ${IntegrationType.CsvFeed}               | ${'CsvFeed'}
    ${IntegrationType.TaxiiFeed}             | ${'TaxiiFeed'}
    ${IntegrationType.RssFeed}               | ${'RssFeed'}
    ${IntegrationType.Stream}                | ${'Stream'}
    ${IntegrationType.ThirdPartyIntegration} | ${'ThirdPartyIntegration'}
  `(
    'should resolve integration document with type $integrationType to $expected',
    async ({ integrationType, expected }) => {
      const doc = {
        id: uuidv4(),
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      } as unknown as DocumentModel;
      vi.spyOn(DocumentMetadataDomain, 'loadIntegrationType').mockResolvedValue(
        integrationType
      );

      const result = await (
        documentResolver.Document as unknown as DocumentResolvers
      ).__resolveType(doc);

      expect(result).toBe(expected);
    }
  );

  it('should return DefaultDocument for unrecognised type', async () => {
    const doc = {
      id: uuidv4(),
      type: 'unknown_type',
    } as unknown as DocumentModel;
    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).__resolveType(doc);
    expect(result).toBe('DefaultDocument');
  });
});

describe('document field resolvers', () => {
  it('children_documents should load children by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = [{ id: uuidv4() }] as unknown as Awaited<
      ReturnType<typeof DocumentChildrenDomain.loadChildrenDocuments>
    >;
    vi.spyOn(DocumentChildrenDomain, 'loadChildrenDocuments').mockResolvedValue(
      expected
    );

    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).children_documents!(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentChildrenDomain.loadChildrenDocuments).toHaveBeenCalledWith(
      id,
      expect.any(Array)
    );
    expect(result).toEqual(expected);
  });

  it('uploader should load uploader by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = { id: uuidv4() } as unknown as User | undefined;
    vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(expected);

    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).uploader!({ id }, {}, contextSimpleUserFiligran2, GRAPHQL_RESOLVE_INFO);

    expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('uploader_organization should load uploader organization by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = { id: uuidv4() } as unknown as Organization | undefined;
    vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
      expected
    );

    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).uploader_organization!(
      { id },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentDomain.loadUploaderOrganization).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('service_instance should load service instance by service_instance_id', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id: serviceInstanceId } as unknown as
      | ServiceInstance
      | undefined;
    vi.spyOn(serviceInstanceDomain, 'getServiceInstance').mockResolvedValue(
      expected
    );

    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).service_instance!(
      { service_instance_id: serviceInstanceId },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(serviceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
      serviceInstanceId
    );
    expect(result).toEqual(expected);
  });

  it('subscription should load subscription by service_instance_id and organization_id', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
    const expected = { id: uuidv4() } as unknown as SubscriptionModel;
    vi.spyOn(subscriptionDomain, 'loadSubscriptionBy').mockResolvedValue(
      expected as unknown as Awaited<
        ReturnType<typeof subscriptionDomain.loadSubscriptionBy>
      >
    );

    const result = await (
      documentResolver.Document as unknown as DocumentResolvers
    ).subscription!(
      { service_instance_id: serviceInstanceId },
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(subscriptionDomain.loadSubscriptionBy).toHaveBeenCalledWith({
      service_instance_id: serviceInstanceId,
      organization_id: contextSimpleUserFiligran2.user.selected_organization_id,
    });
    expect(result).toEqual(expected);
  });
});

describe('document exists GraphQL query', () => {
  it('should delegate to checkDocumentExists and return result', async () => {
    vi.spyOn(documentHelper, 'checkDocumentExists').mockResolvedValue(false);

    const result = await documentResolver.Query!.documentExists!(
      {},
      {
        documentName: 'test.md',
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(documentHelper.checkDocumentExists).toHaveBeenCalledWith(
      'test.md',
      SERVICES.INSTANCES.EPIC.ID
    );
    expect(result).toBe(false);
  });
});

describe('public documents GraphQL query', () => {
  it('should delegate to DocumentApp.loadPublicDocuments and return result', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<typeof DocumentApp.loadPublicDocuments>
    >;
    vi.spyOn(DocumentApp, 'loadPublicDocuments').mockResolvedValue(expected);

    const result = await documentResolver.Query!.publicDocuments!(
      {},
      {
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
      } as unknown as QueryPublicDocumentsArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('public documents by service slug GraphQL query', () => {
  it('should delegate to DocumentApp.loadPublicDocumentsByServiceSlug and return result', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<typeof DocumentApp.loadPublicDocumentsByServiceSlug>
    >;
    vi.spyOn(DocumentApp, 'loadPublicDocumentsByServiceSlug').mockResolvedValue(
      expected
    );

    const result = await documentResolver.Query!.publicDocumentsByServiceSlug!(
      {},
      { serviceInstanceSlug: 'my-service' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentApp.loadPublicDocumentsByServiceSlug).toHaveBeenCalledWith(
      'my-service'
    );
    expect(result).toEqual(expected);
  });
});

describe('public document by slug GraphQL query', () => {
  it('should delegate to DocumentApp.loadPublicDocumentBySlug and return result', async () => {
    const expected = { id: uuidv4() } as unknown as Awaited<
      ReturnType<typeof DocumentApp.loadPublicDocumentBySlug>
    >;
    vi.spyOn(DocumentApp, 'loadPublicDocumentBySlug').mockResolvedValue(
      expected
    );

    const result = await documentResolver.Query!.publicDocumentBySlug!(
      {},
      { serviceInstanceId: SERVICES.INSTANCES.EPIC.ID, slug: 'my-slug' },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentApp.loadPublicDocumentBySlug).toHaveBeenCalledWith(
      SERVICES.INSTANCES.EPIC.ID,
      'my-slug'
    );
    expect(result).toEqual(expected);
  });
});

describe('documents GraphQL query', () => {
  it('should delegate to DocumentApp.loadDocuments and return result', async () => {
    const expected = [] as unknown as Awaited<
      ReturnType<typeof DocumentApp.loadDocuments>
    >;
    vi.spyOn(DocumentApp, 'loadDocuments').mockResolvedValue(expected);

    const result = await documentResolver.Query!.documents!(
      {},
      {
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
      } as unknown as QueryDocumentsArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('document GraphQL query', () => {
  it('should decode documentId and delegate to DocumentApp.loadDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as unknown as Awaited<
      ReturnType<typeof DocumentApp.loadDocument>
    >;
    vi.spyOn(DocumentApp, 'loadDocument').mockResolvedValue(expected);

    const result = await documentResolver.Query!.document!(
      {},
      { documentId: globalDocId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(DocumentApp.loadDocument).toHaveBeenCalledWith(rawDocId);
    expect(result).toEqual(expected);
  });
});
