import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
  SERVICES,
} from '../../../tests/tests.const';
import {
  IntegrationType,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
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

describe('mutation.createDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to DocumentApp.createDocument and return result', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
    const expected = { id: uuidv4() as DocumentId } as never;
    vi.spyOn(DocumentApp, 'createDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.createDocument!(
      {},
      { serviceInstanceId, input: {} } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    expect(result).toEqual(expected);
  });

  it('should throw AlreadyExists when slug constraint is violated', async () => {
    vi.spyOn(DocumentApp, 'createDocument').mockRejectedValue(
      new Error('document_type_slug_unique constraint violated')
    );

    const call = documentResolver.Mutation!.createDocument!(
      {},
      { serviceInstanceId: SERVICES.INSTANCES.VAULT.ID, input: {} } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.AlreadyExists });
  });

  it('should map to BadRequest for DocumentFileMissing error', async () => {
    vi.spyOn(DocumentApp, 'createDocument').mockRejectedValue(
      new Error(BadRequestErrorCode.DocumentFileMissing)
    );

    const call = documentResolver.Mutation!.createDocument!(
      {},
      { serviceInstanceId: SERVICES.INSTANCES.VAULT.ID, input: {} } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('mutation.updateDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode documentId and delegate to DocumentApp.updateDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as never;
    vi.spyOn(DocumentApp, 'updateDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.updateDocument!(
      {},
      {
        documentId: globalDocId,
        serviceInstanceId: SERVICES.INSTANCES.VAULT.ID,
        existingImageIds: [],
        input: {},
      } as never,
      contextSimpleUserFiligran2,
      INFO
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
        serviceInstanceId: SERVICES.INSTANCES.VAULT.ID,
        existingImageIds: [],
        input: {},
      } as never,
      contextSimpleUserFiligran2,
      INFO
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
        serviceInstanceId: SERVICES.INSTANCES.VAULT.ID,
        existingImageIds: [],
        input: {},
      } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('mutation.deleteDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode documentId and delegate to DocumentApp.deleteDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as never;
    vi.spyOn(DocumentApp, 'deleteDocument').mockResolvedValue(expected);

    const result = await documentResolver.Mutation!.deleteDocument!(
      {},
      {
        documentId: globalDocId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        forceDelete: false,
      },
      contextSimpleUserFiligran2,
      INFO
    );

    expect(DocumentApp.deleteDocument).toHaveBeenCalledWith(
      rawDocId,
      SERVICES.INSTANCES.VAULT.ID,
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
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        forceDelete: false,
      },
      contextSimpleUserFiligran2,
      INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});

describe('mutation.incrementShareNumberDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load document, update counters, and return result', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const doc = {
      id: rawDocId,
      service_instance_id: SERVICES.INSTANCES.VAULT.ID,
      name: 'doc',
    } as never;
    const updated = { ...doc, share_number: 1 } as never;
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
      INFO
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
      INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});

describe('document.__resolveType', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each`
    type                                      | expected
    ${OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE} | ${'CustomDashboard'}
    ${OPENAEV_SCENARIO_DOCUMENT_TYPE}         | ${'OpenAEVScenario'}
  `(
    'should resolve $type to $expected without querying metadata',
    async ({ type, expected }) => {
      const doc = { id: uuidv4(), type } as never;
      const result = await (documentResolver.Document as never).__resolveType(
        doc
      );
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
      } as never;
      vi.spyOn(DocumentMetadataDomain, 'loadIntegrationType').mockResolvedValue(
        integrationType
      );

      const result = await (documentResolver.Document as never).__resolveType(
        doc
      );

      expect(result).toBe(expected);
    }
  );

  it('should return DefaultDocument for unrecognised type', async () => {
    const doc = { id: uuidv4(), type: 'unknown_type' } as never;
    const result = await (documentResolver.Document as never).__resolveType(
      doc
    );
    expect(result).toBe('DefaultDocument');
  });
});

describe('document field resolvers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('children_documents should load children by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = [{ id: uuidv4() }] as never;
    vi.spyOn(DocumentChildrenDomain, 'loadChildrenDocuments').mockResolvedValue(
      expected
    );

    const result = await (
      documentResolver.Document as never
    ).children_documents({ id }, {}, contextSimpleUserFiligran2, INFO);

    expect(DocumentChildrenDomain.loadChildrenDocuments).toHaveBeenCalledWith(
      id,
      expect.any(Array)
    );
    expect(result).toEqual(expected);
  });

  it('uploader should load uploader by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = { id: uuidv4() } as never;
    vi.spyOn(DocumentDomain, 'loadUploader').mockResolvedValue(expected);

    const result = await (documentResolver.Document as never).uploader(
      { id },
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    expect(DocumentDomain.loadUploader).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('uploader_organization should load uploader organization by document id', async () => {
    const id = uuidv4() as DocumentId;
    const expected = { id: uuidv4() } as never;
    vi.spyOn(DocumentDomain, 'loadUploaderOrganization').mockResolvedValue(
      expected
    );

    const result = await (
      documentResolver.Document as never
    ).uploader_organization({ id }, {}, contextSimpleUserFiligran2, INFO);

    expect(DocumentDomain.loadUploaderOrganization).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('service_instance should load service instance by service_instance_id', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
    const expected = { id: serviceInstanceId } as never;
    vi.spyOn(serviceInstanceDomain, 'getServiceInstance').mockResolvedValue(
      expected
    );

    const result = await (documentResolver.Document as never).service_instance(
      { service_instance_id: serviceInstanceId },
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    expect(serviceInstanceDomain.getServiceInstance).toHaveBeenCalledWith(
      serviceInstanceId
    );
    expect(result).toEqual(expected);
  });

  it('subscription should load subscription by service_instance_id and organization_id', async () => {
    const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
    const expected = { id: uuidv4() } as unknown as SubscriptionModel;
    vi.spyOn(subscriptionDomain, 'loadSubscriptionBy').mockResolvedValue(
      expected as never
    );

    const result = await (documentResolver.Document as never).subscription(
      { service_instance_id: serviceInstanceId },
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    expect(subscriptionDomain.loadSubscriptionBy).toHaveBeenCalledWith({
      service_instance_id: serviceInstanceId,
      organization_id: contextSimpleUserFiligran2.user.selected_organization_id,
    });
    expect(result).toEqual(expected);
  });
});

describe('query.documentExists', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to checkDocumentExists and return result', async () => {
    vi.spyOn(documentHelper, 'checkDocumentExists').mockResolvedValue(false);

    const result = await documentResolver.Query!.documentExists!(
      {},
      {
        documentName: 'test.md',
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
      },
      contextSimpleUserFiligran2,
      INFO
    );

    expect(documentHelper.checkDocumentExists).toHaveBeenCalledWith(
      'test.md',
      SERVICES.INSTANCES.VAULT.ID
    );
    expect(result).toBe(false);
  });
});

describe('query.publicDocuments', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to DocumentApp.loadPublicDocuments and return result', async () => {
    const expected = [] as never;
    vi.spyOn(DocumentApp, 'loadPublicDocuments').mockResolvedValue(expected);

    const result = await documentResolver.Query!.publicDocuments!(
      {},
      { service_instance_id: SERVICES.INSTANCES.VAULT.ID } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('query.publicDocumentsByServiceSlug', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to DocumentApp.loadPublicDocumentsByServiceSlug and return result', async () => {
    const expected = [] as never;
    vi.spyOn(DocumentApp, 'loadPublicDocumentsByServiceSlug').mockResolvedValue(
      expected
    );

    const result = await documentResolver.Query!.publicDocumentsByServiceSlug!(
      {},
      { serviceInstanceSlug: 'my-service' },
      contextSimpleUserFiligran2,
      INFO
    );

    expect(DocumentApp.loadPublicDocumentsByServiceSlug).toHaveBeenCalledWith(
      'my-service'
    );
    expect(result).toEqual(expected);
  });
});

describe('query.publicDocumentBySlug', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to DocumentApp.loadPublicDocumentBySlug and return result', async () => {
    const expected = { id: uuidv4() } as never;
    vi.spyOn(DocumentApp, 'loadPublicDocumentBySlug').mockResolvedValue(
      expected
    );

    const result = await documentResolver.Query!.publicDocumentBySlug!(
      {},
      { serviceInstanceId: SERVICES.INSTANCES.VAULT.ID, slug: 'my-slug' },
      contextSimpleUserFiligran2,
      INFO
    );

    expect(DocumentApp.loadPublicDocumentBySlug).toHaveBeenCalledWith(
      SERVICES.INSTANCES.VAULT.ID,
      'my-slug'
    );
    expect(result).toEqual(expected);
  });
});

describe('query.documents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to DocumentApp.loadDocuments and return result', async () => {
    const expected = [] as never;
    vi.spyOn(DocumentApp, 'loadDocuments').mockResolvedValue(expected);

    const result = await documentResolver.Query!.documents!(
      {},
      { service_instance_id: SERVICES.INSTANCES.VAULT.ID } as never,
      contextSimpleUserFiligran2,
      INFO
    );

    expect(result).toEqual(expected);
  });
});

describe('query.document', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode documentId and delegate to DocumentApp.loadDocument', async () => {
    const rawDocId = uuidv4() as DocumentId;
    const globalDocId = toGlobalId('Document', rawDocId);
    const expected = { id: rawDocId } as never;
    vi.spyOn(DocumentApp, 'loadDocument').mockResolvedValue(expected);

    const result = await documentResolver.Query!.document!(
      {},
      { documentId: globalDocId },
      contextSimpleUserFiligran2,
      INFO
    );

    expect(DocumentApp.loadDocument).toHaveBeenCalledWith(rawDocId);
    expect(result).toEqual(expected);
  });
});
