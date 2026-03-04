import {
  CreateDocumentInput,
  DocumentMetadata as DocumentMetadataResolverType,
  IntegrationType,
  MutationUpdateDocumentArgs as MutationUpdateDocumentArgsResolverType,
  QueryDocumentsArgs,
  QueryPublicDocumentsArgs,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import Document, {
  DocumentId,
  default as DocumentModel,
} from '../../../model/kanel/public/Document';
import { ObjectUseCaseObjectId } from '../../../model/kanel/public/ObjectUseCase';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UseCaseId } from '../../../model/kanel/public/UseCase';
import { UserId } from '../../../model/kanel/public/User';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { extractId } from '../../../utils/utils';
import { objectUseCaseDomain } from '../../settings/objectUseCase/object-useCase.domain';
import { useCaseApp } from '../../settings/useCase/use-case.app';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import { ServiceDefinitionDomain } from '../definition/service-definition.domain';
import {
  ALL_METADATA_KEYS,
  BOOLEAN_METADATA,
  DOCUMENT_TYPE,
  DocumentHelper,
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
  ManageableServiceDefinitionIdentifier,
} from './document.helper';
import {
  processDocumentUpdateUploads,
  processUploads,
  Upload,
} from './document.uploads.helper';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentData, DocumentDomain } from './domain/document.domain';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './domain/document.metadata.domain';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from './opencti/integrations/integrations.model';

export const DocumentApp = {
  createDocument: async (
    input: CreateDocumentInput,
    metadata: DocumentMetadataResolverType[],
    serviceInstanceId: ServiceInstanceId,
    uploads: Upload[]
  ) => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        serviceInstanceId
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const files = await processUploads(uploads, serviceInstanceId);
    const completeMetadata =
      DocumentHelper.buildCompleteMetadataFromDocumentFile({
        files,
        metadata,
      });

    DocumentHelper.assertMetadataIsNotMissing(
      serviceDefinition.identifier as ManageableServiceDefinitionIdentifier,
      completeMetadata
    );

    const documentType =
      DocumentHelper.retrieveDocumentTypeFromServiceDefinition(
        serviceDefinition.identifier as ManageableServiceDefinitionIdentifier
      );
    const shouldHandleFirstFile = shouldHandleFirstFileAsDocument(
      documentType,
      metadata
    );
    let documentData: DocumentData<Document> = {
      ...input,
      service_instance_id: serviceInstanceId,
      type: documentType,
    };

    if (shouldHandleFirstFile) {
      const docFile = files.shift();
      documentData = {
        ...documentData,
        file_name: docFile.fileName,
        minio_name: docFile.minioName,
        mime_type: docFile.mimeType,
      };
    }

    const createdDocument = await withTransaction(async () => {
      const metadataKeys = completeMetadata.map(
        ({ key }) => key
      ) as DocumentMetadataKeys<Document>;
      const document = await DocumentDomain.createDocument(
        documentData,
        metadataKeys
      );

      if (completeMetadata.length) {
        await DocumentMetadataDomain.insertMetadataFromKeyValue(
          document.id,
          completeMetadata
        );

        for (const meta of completeMetadata) {
          document[meta.key] = meta.value;
        }
      }

      await DocumentChildrenDomain.createImageDocuments(
        document.id,
        document.service_instance_id,
        files
      );

      if (documentData.use_cases?.length) {
        await objectUseCaseDomain.insertObjectUseCase(
          documentData.use_cases.map((id) => ({
            object_id: document.id as unknown as ObjectUseCaseObjectId,
            use_case_id: extractId(id) as UseCaseId,
          }))
        );
      }

      return document;
    });

    try {
      const createEvent = await buildCreateEvent(createdDocument);
      await telemetryApp.sendTelemetryEvent(createEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for document creation', {
        error,
        documentId: createdDocument.id,
      });
    }

    return createdDocument;
  },

  updateDocument: async (
    parentDocumentId: DocumentId,
    serviceInstanceId: ServiceInstanceId,
    metadata: DocumentMetadataResolverType[],
    mutationArgs: Pick<
      MutationUpdateDocumentArgsResolverType,
      'document' | 'updateDocument' | 'images' | 'input'
    >
  ) => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        serviceInstanceId
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const {
      document,
      updateDocument: isUpdateDoc,
      images = [],
      input,
    } = mutationArgs;

    const documentType =
      DocumentHelper.retrieveDocumentTypeFromServiceDefinition(
        serviceDefinition.identifier as ManageableServiceDefinitionIdentifier
      );
    const shouldHandleFirstFile = shouldHandleFirstFileAsDocument(
      documentType,
      metadata
    );
    const { documentFile, newImages, existingImageIds } =
      await processDocumentUpdateUploads(
        document,
        isUpdateDoc && shouldHandleFirstFile,
        images,
        serviceInstanceId
      );

    let completeMetadata = DocumentHelper.buildCompleteMetadataFromDocumentFile(
      {
        files: [documentFile],
        metadata,
      }
    );

    if (!completeMetadata.some(({ key }) => key === 'feed_url')) {
      const existingFeedUrl =
        await DocumentMetadataDomain.loadMetadataValueByKey(
          parentDocumentId,
          'feed_url'
        );
      if (existingFeedUrl) {
        completeMetadata = [
          ...completeMetadata,
          { key: 'feed_url', value: existingFeedUrl },
        ];
      }
    }

    DocumentHelper.assertMetadataIsNotMissing(
      serviceDefinition.identifier as ManageableServiceDefinitionIdentifier,
      completeMetadata
    );

    return withTransaction(async () => {
      const { user } = requestContext.require();
      const uploader_organization_id = input.uploader_organization_id
        ? extractId<OrganizationId>(input.uploader_organization_id)
        : null;

      const extractedUploaderId = extractId<UserId>(input.uploader_id ?? '');
      const uploader_id =
        input.uploader_id && extractedUploaderId
          ? extractedUploaderId
          : user.id;

      const updatedDocument = await DocumentDomain.updateDocument({
        parentDocumentId,
        document: {
          data: input,
          file: documentFile,
          type: documentType,
        },
        uploader_organization_id,
        uploader_id,
      });

      // If use_cases is null => that mean we want to update the field to empty
      if (input.use_cases !== undefined) {
        await objectUseCaseDomain.deleteObjectUseCaseBy({
          object_id: parentDocumentId as unknown as ObjectUseCaseObjectId,
        });

        if (input.use_cases?.length > 0) {
          await objectUseCaseDomain.insertObjectUseCase(
            input.use_cases.map((id) => ({
              object_id: parentDocumentId as unknown as ObjectUseCaseObjectId,
              use_case_id: extractId(id) as UseCaseId,
            }))
          );
        }
      }

      if (completeMetadata.length) {
        await DocumentMetadataDomain.deleteMetadata({ id: parentDocumentId });
        await DocumentMetadataDomain.insertMetadataFromKeyValue(
          updatedDocument.id,
          completeMetadata
        );

        for (const meta of completeMetadata) {
          updatedDocument[meta.key] = BOOLEAN_METADATA.includes(meta.key)
            ? meta.value === 'true'
            : meta.value;
        }
      }

      // Delete the images that are not in the existingImages array
      const childIds = await DocumentChildrenDomain.loadChildrenIds(
        parentDocumentId,
        existingImageIds
      );
      if (childIds.length > 0) {
        await DocumentDomain.deleteDocuments(childIds);
      }

      await DocumentChildrenDomain.createImageDocuments(
        parentDocumentId,
        serviceInstanceId,
        newImages
      );

      return updatedDocument;
    });
  },

  createDocumentWithChildrenAndMetadata: async <T extends DocumentModel>(
    documentData: DocumentData<T>,
    metadataKeys: DocumentMetadataKeys<T> = []
  ): Promise<T> => {
    return await withTransaction(async () => {
      const document = await DocumentDomain.createDocument(
        documentData,
        metadataKeys
      );

      if (documentData.parent_document_id) {
        await DocumentChildrenDomain.insertChildRelationship({
          parentDocumentId: documentData.parent_document_id,
          childDocumentId: document.id,
        });
      }

      if (metadataKeys.length) {
        const metadatas = await DocumentMetadataDomain.insertMetadata(
          document.id,
          documentData,
          metadataKeys
        );

        for (const metadata of metadatas) {
          document[metadata.key] = metadata.value;
        }
      }

      return document as T;
    });
  },

  upsertDocumentWithExternalImage: async <T extends DocumentModel>(
    type: string,
    input: Partial<T>,
    externalImageUpload: Upload,
    metadataKeys: DocumentMetadataKeys<T>
  ) => {
    return withTransaction(async () => {
      const doc = await upsertDocument<T>(
        {
          ...input,
          type,
        },
        metadataKeys
      );

      await DocumentChildrenDomain.upsertExternalImage(
        doc,
        externalImageUpload
      );

      return doc;
    });
  },

  deleteDocument: async <T extends DocumentModel>(
    documentId: DocumentId,
    serviceInstanceId: ServiceInstanceId,
    hardDelete: boolean
  ): Promise<T> => {
    const [documentFromDb] = await DocumentDomain.loadDocumentBy({
      'Document.id': documentId,
      'Document.service_instance_id': serviceInstanceId,
    });

    if (!documentFromDb) {
      throw new Error('Document not found');
    }

    const childIds = await DocumentChildrenDomain.loadChildrenIds(documentId);
    if (hardDelete) {
      // Get all minio_name before their deletion
      const childrenDocumentFromDB = (
        await Promise.all(
          childIds.map((id) => DocumentDomain.loadDocumentBy({ id }))
        )
      ).flat();
      await withTransaction(async () => {
        await DocumentChildrenDomain.deleteChildrenByParent(documentId);

        await DocumentDomain.deleteDocuments([...childIds, documentId]);

        // Use Cases
        await objectUseCaseDomain.deleteObjectUseCaseBy({
          object_id: documentId as unknown as ObjectUseCaseObjectId,
        });
      });
      await DocumentHelper.deleteFileFromMinIO(
        childrenDocumentFromDB,
        documentFromDb
      );
      return documentFromDb as T;
    }

    // Soft delete => desactivate the document
    await DocumentDomain.deactivateDocuments([documentId, ...childIds]);

    return documentFromDb as T;
  },

  loadDocuments: async (input: QueryDocumentsArgs) => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        extractId<ServiceInstanceId>(input.serviceInstanceId)
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const { documentType, metadataKeys } =
      getMetadataKeysAndDocumentTypeFromServiceDefinition(serviceDefinition);

    return DocumentDomain.loadParentDocumentsByServiceInstance(
      documentType,
      input,
      metadataKeys
    );
  },

  loadPublicDocumentsByServiceSlug: async (
    serviceInstanceSlug: string
  ): Promise<Document[]> => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstanceSlug(
        serviceInstanceSlug
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const { documentType, metadataKeys } =
      getMetadataKeysAndDocumentTypeFromServiceDefinition(serviceDefinition);

    return DocumentDomain.loadSeoDocumentsByServiceSlug(
      documentType,
      serviceInstanceSlug,
      metadataKeys
    );
  },

  loadPublicDocumentBySlug: async (
    serviceInstanceId: ServiceInstanceId,
    slug: string
  ) => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        serviceInstanceId
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const { documentType, metadataKeys } =
      getMetadataKeysAndDocumentTypeFromServiceDefinition(serviceDefinition);

    return loadSeoDocumentWithCountersBySlug(documentType, slug, metadataKeys);
  },

  loadPublicDocuments: async (input: QueryPublicDocumentsArgs) => {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        extractId<ServiceInstanceId>(input.serviceInstanceId)
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }
    const serviceDefinitionIdentifier =
      serviceDefinition.identifier as ManageableServiceDefinitionIdentifier;

    const metadataKeys = DocumentHelper.getMetadataKeysForServiceDefinition(
      serviceDefinitionIdentifier
    );

    const documentType =
      DocumentHelper.retrieveDocumentTypeFromServiceDefinition(
        serviceDefinitionIdentifier
      );

    const { slug, ...opts } = input;

    return DocumentDomain.loadPaginatedSeoDocumentsByServiceSlug(
      documentType,
      slug,
      opts,
      metadataKeys
    );
  },

  loadDocument: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(documentId, ALL_METADATA_KEYS);
  },
};

const upsertDocument = async <T extends DocumentModel>(
  documentData: DocumentData<T>,
  metadataKeys: DocumentMetadataKeys<T> = []
): Promise<T> => {
  return await withTransaction(async () => {
    // Prepare the data to insert
    const document = await DocumentDomain.upsertOnSlug(
      documentData,
      metadataKeys
    );

    const documentWasUpdated = !!document.updated_at;

    // Handle parent document relationship
    if (documentData.parent_document_id) {
      // First, delete existing relationship if it exists (for upsert scenario)
      if (documentWasUpdated) {
        await DocumentChildrenDomain.deleteChild(document.id);
      }

      // Insert new relationship
      await DocumentChildrenDomain.insertChildRelationship({
        parentDocumentId: documentData.parent_document_id,
        childDocumentId: document.id,
      });
    }

    if (documentData.use_cases?.length) {
      if (documentWasUpdated) {
        await objectUseCaseDomain.deleteObjectUseCaseBy({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
        });
      }
      const insertObjectUseCase = [];
      for (const name of documentData.use_cases) {
        const useCase = await useCaseApp.loadOrCreateUseCase({
          name,
        });
        insertObjectUseCase.push({
          object_id: document.id as unknown as ObjectUseCaseObjectId,
          use_case_id: useCase.id,
        });
      }
      await objectUseCaseDomain.insertObjectUseCase(insertObjectUseCase);
    }

    if (metadataKeys.length > 0) {
      // If document was updated (not created)
      if (documentWasUpdated) {
        // Delete all existing metadata except 'version'
        await DocumentMetadataDomain.deleteMetadata({
          id: document.id,
          excludedKeys: ['product_version'],
        });
        const existingVersion = await DocumentMetadataDomain.loadProductVersion(
          document.id
        );
        if (existingVersion) {
          document['product_version'] = existingVersion;
        }
      }

      // Insert new metadata (excluding version) if documentWasUpdated
      const metadataKeysWithoutProductVersion = metadataKeys.filter(
        (key) => key !== 'product_version' || !documentWasUpdated
      );

      const metadatas = await DocumentMetadataDomain.insertMetadata(
        document.id,
        documentData,
        metadataKeysWithoutProductVersion
      );

      for (const metadata of metadatas) {
        document[metadata.key] = metadata.value;
      }
    }

    return document as T;
  });
};

const getMetadataKeysAndDocumentTypeFromServiceDefinition = (
  serviceDefinition: ServiceDefinition
): { documentType: DOCUMENT_TYPE; metadataKeys: string[] } => {
  const serviceDefinitionIdentifier =
    serviceDefinition.identifier as ManageableServiceDefinitionIdentifier;

  const metadataKeys = DocumentHelper.getMetadataKeysForServiceDefinition(
    serviceDefinitionIdentifier
  );

  const documentType = DocumentHelper.retrieveDocumentTypeFromServiceDefinition(
    serviceDefinitionIdentifier
  );

  return {
    documentType,
    metadataKeys,
  };
};

const shouldHandleFirstFileAsDocument = (
  documentType: string,
  metadata: DocumentMetadataResolverType[]
): boolean => {
  if (documentType !== OPENCTI_INTEGRATION_DOCUMENT_TYPE) {
    return true;
  }

  const integration_type = metadata.find(
    ({ key }) => key === 'integration_type'
  );

  if (!integration_type) {
    return true;
  }

  return integration_type.value !== IntegrationType.ThirdPartyIntegration;
};
