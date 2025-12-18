import { withTransaction } from '../../../context/database.context';
import { default as DocumentModel } from '../../../model/kanel/public/Document';
import { ObjectLabelObjectId } from '../../../model/kanel/public/ObjectLabel';
import { labelsApp } from '../../settings/labels/labels.app';
import { objectLabelDomain } from '../../settings/objectLabel/object-label.domain';
import { processUploads, Upload } from './document.uploads.helper';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentData, DocumentDomain } from './domain/document.domain';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './domain/document.metadata.domain';

export const DocumentApp = {
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
