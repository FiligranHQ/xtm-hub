import { toGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../../knexfile';
import {
  DocumentImageType,
  DocumentMetadataKeyCode,
  DocumentSourceType,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { restrictDocumentToUserOrganization } from '../../../security/restriction/document';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { MinioFile } from '../../../thirdparty/minio/types';
import { ErrorCode } from '../../../utils/error/error.code';
import { DocumentApp } from '../document.app';
import { Document } from '../document.helper';
import { DOCUMENT_IMAGE_METADATA_KEYS, DocumentImage } from '../document.model';
import { DocumentUploadsHelper, Upload } from '../document.uploads.helper';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './document.metadata.domain';

export const DocumentChildrenDomain = {
  insertChildRelationship: async ({
    childDocumentId,
    parentDocumentId,
  }: {
    childDocumentId: DocumentId;
    parentDocumentId: DocumentId;
  }) => {
    await db<DocumentChildren>('Document_Children').insert({
      parent_document_id: parentDocumentId,
      child_document_id: childDocumentId,
    });
  },

  loadChildrenIds: async (
    parentDocumentId: DocumentId,
    excludeChildrenIds: DocumentId[] = []
  ): Promise<DocumentId[]> => {
    const qb = db<DocumentChildren>('Document_Children')
      .where('parent_document_id', '=', parentDocumentId)
      .select('child_document_id');

    if (excludeChildrenIds.length) {
      qb.whereNotIn('child_document_id', excludeChildrenIds);
    }

    const children: Pick<DocumentChildren, 'child_document_id'>[] = await qb;
    return children.map(({ child_document_id }) => child_document_id);
  },

  buildChildrenDocumentsQuery: <T extends object = Document>(
    parentIds: readonly string[],
    options: {
      isDataLoader?: boolean;
      includeMetadata?: DocumentMetadataKeyCode[];
    } = {}
  ) => {
    const { isDataLoader = false, includeMetadata = [] } = options;
    const context = requestContext.get();
    const query = db<T>('Document_Children')
      .leftJoin(
        'Document',
        'Document.id',
        'Document_Children.child_document_id'
      )
      .whereIn('Document_Children.parent_document_id', parentIds)
      .modify((qb) => {
        if (context?.user) {
          restrictDocumentToUserOrganization(qb);
        }
      })
      .orderBy('created_at', 'asc')
      .groupBy('Document.id');

    if (isDataLoader) {
      query
        .select(
          'Document.*',
          'Document_Children.parent_document_id as _parent_id'
        )
        .groupBy('Document_Children.parent_document_id');
    } else {
      query.select('Document.*');
    }

    DocumentMetadataDomain.addIncludeMetadataQuery(query, includeMetadata);
    return query;
  },

  loadChildrenDocuments: async (
    documentId: string,
    include_metadata: DocumentMetadataKeyCode[] = []
  ): Promise<Document[]> => {
    return DocumentChildrenDomain.buildChildrenDocumentsQuery([documentId], {
      includeMetadata: include_metadata,
    });
  },

  deleteChildrenByParent: async (parentDocumentId: DocumentId) => {
    await db<DocumentChildren>('Document_Children')
      .where('parent_document_id', '=', parentDocumentId)
      .delete('Document_Children.*');
  },

  deleteChild: async (childDocumentId: DocumentId) => {
    await db<DocumentChildren>('Document_Children')
      .where({ child_document_id: childDocumentId })
      .delete();
  },

  createImageDocuments: async (
    parentDocumentId: DocumentId,
    serviceInstanceId: ServiceInstanceId,
    files: MinioFile[],
    imageType: DocumentImageType,
    sourceType: DocumentSourceType = DocumentSourceType.Internal
  ) => {
    await Promise.all(
      files.map((file) =>
        DocumentApp.createDocumentWithChildrenAndMetadata<DocumentImage>(
          {
            type: 'image',
            parent_document_id: parentDocumentId,
            file_name: file.fileName,
            minio_name: file.minioName,
            mime_type: file.mimeType,
            service_instance_id: serviceInstanceId,
            source_type: sourceType,
            image_type: imageType,
          },
          DOCUMENT_IMAGE_METADATA_KEYS as DocumentMetadataKeys<DocumentImage>
        )
      )
    );
  },

  buildImagesByDocumentIdQuery: <T extends object = Document>(
    parentIds: readonly string[],
    options: { isDataLoader?: boolean } = {}
  ) => {
    const { isDataLoader = false } = options;
    const query = db<T>('Document')
      .join(
        'Document_Children',
        'Document.id',
        '=',
        'Document_Children.child_document_id'
      )
      .whereIn('Document_Children.parent_document_id', parentIds)
      .where('Document.mime_type', 'like', 'image/%')
      .groupBy('Document.id');

    if (isDataLoader) {
      query
        .select(
          'Document.*',
          'Document_Children.parent_document_id as _parent_id'
        )
        .groupBy('Document_Children.parent_document_id');
    } else {
      query.select('Document.*');
    }

    DocumentMetadataDomain.addIncludeMetadataQuery(
      query,
      DOCUMENT_IMAGE_METADATA_KEYS
    );
    return query;
  },

  loadImagesByDocumentId: async (documentId: string) => {
    const images = await DocumentChildrenDomain.buildImagesByDocumentIdQuery([
      documentId,
    ]);

    for (const image of images) {
      image.id = toGlobalId('Document', image.id);
    }
    return images;
  },

  upsertExternalImage: async <T extends DocumentModel>(
    doc: T,
    externalImageUpload: Upload
  ) => {
    const { service_instance_id } = doc;
    if (!service_instance_id) {
      throw new Error(ErrorCode.ServiceInstanceNotFound);
    }

    const [logoFile] = await DocumentUploadsHelper.processUploads(
      externalImageUpload,
      service_instance_id
    );

    const deletedDocuments = await withTransaction(async () => {
      const deletedChildrenDocuments =
        await DocumentChildrenDomain.deleteExternalImages(doc.id);

      if (logoFile) {
        await DocumentChildrenDomain.createImageDocuments(
          doc.id,
          service_instance_id,
          [logoFile],
          DocumentImageType.Logo,
          DocumentSourceType.External
        );
      }

      return deletedChildrenDocuments;
    });
    // Clean up MinIO files for deleted documents, need to be sure that we are finished with the logic
    if (deletedDocuments.length > 0) {
      await Promise.all(
        deletedDocuments.map((doc) => {
          return MinIOClient.deleteFile(doc.minio_name);
        })
      );
    }
  },

  deleteExternalImages: async (
    parentDocumentId: DocumentId
  ): Promise<{ id: string; minio_name: string }[]> => {
    return db('Document')
      .delete()
      .whereIn('id', function () {
        this.select('child_document_id')
          .from('Document_Children')
          .where('parent_document_id', parentDocumentId);
      })
      .andWhere('Document.type', '=', 'image')
      .andWhere('Document.source_type', '=', DocumentSourceType.External)
      .returning(['id', 'minio_name']);
  },
};
