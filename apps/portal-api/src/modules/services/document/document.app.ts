import { db } from '../../../../knexfile';
import {
  CreateDocumentInput,
  DocumentMetadata as DocumentMetadataResolverType,
  MutationUpdateCsvFeedArgs,
  MutationUpdateDocumentArgs as MutationUpdateDocumentArgsResolverType,
  MutationUpdateOpenAevScenarioArgs,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import Document, {
  DocumentId,
  default as DocumentModel,
} from '../../../model/kanel/public/Document';
import { LabelId } from '../../../model/kanel/public/Label';
import { ObjectLabelObjectId } from '../../../model/kanel/public/ObjectLabel';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { extractId, omit } from '../../../utils/utils';
import { labelsApp } from '../../settings/labels/labels.app';
import { objectLabelDomain } from '../../settings/objectLabel/object-label.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import {
  CUSTOM_DASHBOARD_METADATA,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from '../custom-dashboards/custom-dashboards.domain';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import {
  INTEGRATION_METADATA,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations/integrations.model';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
} from '../openaev-scenarios/openaev-scenarios.domain';
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

export type MutationUpdateDocumentArgs =
  | MutationUpdateOpenAevScenarioArgs
  | (MutationUpdateCsvFeedArgs & {
      input: { integration_type: string };
    });

type CreatableServiceDefinition =
  | ServiceDefinitionIdentifier.OpenctiIntegrations
  | ServiceDefinitionIdentifier.OpenctiCustomDashboards
  | ServiceDefinitionIdentifier.OpenaevScenarios;

const DocumentTypeMappedByServiceDefinition: Record<
  CreatableServiceDefinition,
  string
> = {
  [ServiceDefinitionIdentifier.OpenctiIntegrations]:
    OPENCTI_INTEGRATION_DOCUMENT_TYPE,
  [ServiceDefinitionIdentifier.OpenctiCustomDashboards]:
    OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
  [ServiceDefinitionIdentifier.OpenaevScenarios]:
    OPENAEV_SCENARIO_DOCUMENT_TYPE,
};

const DocumentMetadataMappedByServiceIdentifier: Record<
  CreatableServiceDefinition,
  string[]
> = {
  [ServiceDefinitionIdentifier.OpenctiCustomDashboards]:
    CUSTOM_DASHBOARD_METADATA,
  [ServiceDefinitionIdentifier.OpenctiIntegrations]: INTEGRATION_METADATA,
  [ServiceDefinitionIdentifier.OpenaevScenarios]: OPENAEV_SCENARIO_METADATA,
};

export const DocumentApp = {
  createDocument: async (
    input: CreateDocumentInput,
    metadata: DocumentMetadataResolverType[],
    serviceInstanceId: ServiceInstanceId,
    document: Upload[]
  ) => {
    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        serviceInstanceId
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const documentType =
      DocumentTypeMappedByServiceDefinition[serviceDefinition.identifier];

    const metadataKeys: string[] =
      DocumentMetadataMappedByServiceIdentifier[serviceDefinition.identifier];

    const isMissingMetadata = metadataKeys.some(
      (key) => !metadata.some((meta) => meta.key === key)
    );
    if (isMissingMetadata) {
      throw new Error(ErrorCode.DocumentMissingMetadata);
    }

    const files = await processUploads(document, serviceInstanceId);
    const docFile = files.shift();
    const documentData = {
      ...input,
      service_instance_id: serviceInstanceId,
      type: documentType,
      file_name: docFile.fileName,
      minio_name: docFile.minioName,
      mime_type: docFile.mimeType,
    };

    const createdDocument = await withTransaction(async () => {
      const document = await DocumentDomain.createDocument(
        documentData,
        metadataKeys as DocumentMetadataKeys<Document>
      );

      if (metadataKeys.length) {
        await DocumentMetadataDomain.insertMetadataFromKeyValue(
          document.id,
          metadata
        );

        for (const meta of metadata) {
          document[meta.key] = meta.value;
        }
      }

      await DocumentChildrenDomain.createImageDocuments(
        document.id,
        document.service_instance_id,
        files
      );

      if (documentData.labels?.length) {
        await objectLabelDomain.insertObjectLabel(
          documentData.labels.map((id) => ({
            object_id: document.id as unknown as ObjectLabelObjectId,
            label_id: extractId(id) as LabelId,
          }))
        );
      }

      return document;
    });

    try {
      const createEvent = await buildCreateEvent(createdDocument);
      void telemetryApp.sendTelemetryEvent(createEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for document creation', {
        error,
      });
    }

    return createdDocument;
  },

  updateDocumentWithChildrenAndMetadata: async (
    parentDocumentId: DocumentId,
    serviceInstanceId: ServiceInstanceId,
    metadata: DocumentMetadataResolverType[],
    mutationArgs: MutationUpdateDocumentArgsResolverType
  ) => {
    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionByServiceInstance(
        serviceInstanceId
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const documentType =
      DocumentTypeMappedByServiceDefinition[serviceDefinition.identifier];

    const {
      document,
      updateDocument: isUpdateDoc,
      images,
      input,
    } = mutationArgs;
    const { documentFile, newImages, existingImageIds } =
      await processDocumentUpdateUploads(
        document,
        isUpdateDoc,
        images,
        serviceInstanceId
      );
    const data = {
      ...input,
      ...(documentFile
        ? {
            file_name: documentFile.fileName,
            minio_name: documentFile.minioName,
            mime_type: documentFile.mimeType,
          }
        : {}),
      type: documentType,
    };

    return withTransaction(async () => {
      const { user } = requestContext.require();
      const uploader_organization_id = data.uploader_organization_id
        ? extractId<OrganizationId>(data.uploader_organization_id)
        : null;

      const extractedId = extractId<UserId>(data.uploader_id ?? '');
      const uploader_id = (
        data.uploader_id && extractedId ? extractedId : user.id
      ) as UserId;

      const [updatedDocument] = await db<DocumentModel>('Document')
        .where('id', '=', parentDocumentId)
        .update({
          ...omit(data, ['labels']),
          uploader_organization_id,
          uploader_id,
          updated_at: new Date(),
          updater_id: user.id,
        })
        .returning('*');

      // If label is null => that mean we want to update the field to empty
      if (data.labels !== undefined) {
        await objectLabelDomain.deleteObjectLabelBy({
          object_id: parentDocumentId as unknown as ObjectLabelObjectId,
        });

        if (data.labels?.length > 0) {
          await objectLabelDomain.insertObjectLabel(
            data.labels.map((id) => ({
              object_id: parentDocumentId as unknown as ObjectLabelObjectId,
              label_id: extractId(id) as LabelId,
            }))
          );
        }
      }

      if (metadata.length) {
        await DocumentMetadataDomain.deleteMetadata({ id: parentDocumentId });
        await DocumentMetadataDomain.insertMetadataFromKeyValue(
          updatedDocument.id,
          metadata
        );

        for (const meta of metadata) {
          updatedDocument[meta.key] = meta.value;
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

  createDocumentWithImageUploadsAndMetadata: async <T extends DocumentModel>(
    type: string,
    input: Partial<T>,
    uploads: Upload[] | Upload,
    metadataKeys: DocumentMetadataKeys<T>
  ) => {
    const files = await processUploads(uploads, input.service_instance_id);
    const docFile = files.shift();
    return await withTransaction(async () => {
      const doc = await DocumentApp.createDocumentWithChildrenAndMetadata<T>(
        {
          ...input,
          type,
          file_name: docFile.fileName,
          minio_name: docFile.minioName,
          mime_type: docFile.mimeType,
        },
        metadataKeys
      );

      await DocumentChildrenDomain.createImageDocuments(
        doc.id,
        doc.service_instance_id,
        files
      );

      return doc;
    });
  },

  updateDocument: async <T extends DocumentModel>(
    documentId: DocumentId,
    documentData: Omit<Partial<T>, 'labels'> & {
      labels?: string[];
    },
    metadataKeys: DocumentMetadataKeys<T> = []
  ): Promise<T> => {
    const { user } = requestContext.require();
    const uploader_organization_id = documentData.uploader_organization_id
      ? extractId<OrganizationId>(documentData.uploader_organization_id)
      : null;

    const extractedId = extractId<UserId>(documentData.uploader_id ?? '');
    const uploader_id = (
      documentData.uploader_id && extractedId ? extractedId : user.id
    ) as UserId;

    return await withTransaction(async () => {
      const [document] = await db<DocumentModel>('Document')
        .where('id', '=', documentId)
        .update({
          ...omit(documentData, ['labels', ...metadataKeys]),
          uploader_organization_id,
          uploader_id,
          updated_at: new Date(),
          updater_id: user.id,
        })
        .returning('*');

      // If label is null => that mean we want to update the field to empty
      if (documentData.labels !== undefined) {
        await objectLabelDomain.deleteObjectLabelBy({
          object_id: documentId as unknown as ObjectLabelObjectId,
        });

        if (documentData.labels?.length > 0) {
          await objectLabelDomain.insertObjectLabel(
            documentData.labels.map((id) => ({
              object_id: documentId as unknown as ObjectLabelObjectId,
              label_id: extractId(id) as LabelId,
            }))
          );
        }
      }

      if (metadataKeys.length) {
        await DocumentMetadataDomain.deleteMetadata({ id: documentId });
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
  updateDocumentWithChildren: async <T extends DocumentModel>(
    type: string,
    parentDocumentId: DocumentId,
    serviceInstanceId: ServiceInstanceId,
    mutationArgs: MutationUpdateDocumentArgs,
    metadataKeys: DocumentMetadataKeys<T>
  ) => {
    const {
      document,
      updateDocument: isUpdateDoc,
      images,
      input,
    } = mutationArgs;
    const { documentFile, newImages, existingImageIds } =
      await processDocumentUpdateUploads(
        document,
        isUpdateDoc,
        images,
        serviceInstanceId
      );
    const data = {
      ...input,
      type,
    } as unknown as Partial<T>;

    // We are updating the base document
    if (documentFile) {
      Object.assign(data, {
        file_name: documentFile.fileName,
        minio_name: documentFile.minioName,
        mime_type: documentFile.mimeType,
      });
    }

    return withTransaction(async () => {
      const updatedDocument = await DocumentApp.updateDocument<T>(
        parentDocumentId,
        data,
        metadataKeys
      );

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

  upsertDocumentWithChildren: async <T extends DocumentModel>(
    type: string,
    input: Partial<T>,
    uploads: Upload[] | Upload,
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

      await DocumentChildrenDomain.upsertImages(doc, uploads);
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
      await withTransaction(async () => {
        await DocumentChildrenDomain.deleteChildrenByParent(documentId);
        await DocumentDomain.deleteDocuments([...childIds, documentId]);

        // Labels
        await objectLabelDomain.deleteObjectLabelBy({
          object_id: documentId as unknown as ObjectLabelObjectId,
        });
      });
      return documentFromDb as T;
    }

    // Soft delete => desactivate the document
    await DocumentDomain.deactivateDocuments([documentId, ...childIds]);

    return documentFromDb as T;
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

    if (documentData.labels?.length) {
      if (documentWasUpdated) {
        await objectLabelDomain.deleteObjectLabelBy({
          object_id: document.id as unknown as ObjectLabelObjectId,
        });
      }
      const insertObjectLabel = [];
      for (const name of documentData.labels) {
        const label = await labelsApp.loadOrCreateLabel({
          name,
        });
        insertObjectLabel.push({
          object_id: document.id as unknown as ObjectLabelObjectId,
          label_id: label.id,
        });
      }
      await objectLabelDomain.insertObjectLabel(insertObjectLabel);
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
