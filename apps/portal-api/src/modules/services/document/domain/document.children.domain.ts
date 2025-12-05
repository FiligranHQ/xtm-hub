import { toGlobalId } from 'graphql-relay/node/node.js';
import { db, dbUnsecure, QueryOpts } from '../../../../../knexfile';
import { withTransaction } from '../../../../context/database.context';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import { restrictDocumentToUserOrganization } from '../../../../security/restriction/document';
import { MinIOClient } from '../../../../thirdparty/minio/client';
import { MinioFile } from '../../../../thirdparty/minio/types';
import { Document } from '../document.helper';
import { processUploads, Upload } from '../document.uploads.helper';
import { createDocument } from './document.domain';

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

  loadChildrenDocuments: async (
    documentId: string,
    opts: Partial<QueryOpts> = {}
  ): Promise<Document[]> => {
    return db<Document>('Document_Children', opts)
      .leftJoin(
        'Document',
        'Document.id',
        'Document_Children.child_document_id'
      )
      .where('Document_Children.parent_document_id', '=', documentId)
      .tap(restrictDocumentToUserOrganization)
      .orderBy('created_at', 'asc')
      .select('Document.*')
      .groupBy('Document.id');
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
    files: MinioFile[]
  ) => {
    await Promise.all(
      files.map((file) =>
        createDocument(
          {
            type: 'image',
            parent_document_id: parentDocumentId,
            file_name: file.fileName,
            minio_name: file.minioName,
            mime_type: file.mimeType,
          },
          []
        )
      )
    );
  },

  loadImagesByDocumentId: async (documentId: string) => {
    const images = await dbUnsecure<Document>('Document')
      .select(['Document.id', 'Document.file_name'])
      .join(
        'Document_Children',
        'Document.id',
        '=',
        'Document_Children.child_document_id'
      )
      .where('Document_Children.parent_document_id', '=', documentId)
      .where('Document.mime_type', 'like', 'image/%');

    for (const image of images) {
      image.id = toGlobalId('ShareableResourceImage', image.id);
    }
    return images;
  },

  upsertImages: async <T extends DocumentModel>(
    doc: T,
    upload: Upload[] | Upload
  ) => {
    const files = await processUploads(upload);

    const deletedDocuments = await withTransaction(async () => {
      const deletedDocuments =
        await DocumentChildrenDomain.deleteChildImagesByParent(doc.id);

      await DocumentChildrenDomain.createImageDocuments(doc.id, files);

      return deletedDocuments;
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

  deleteChildImagesByParent: async (
    parentDocumentId: DocumentId
  ): Promise<Pick<Document, 'id' | 'minio_name'>[]> => {
    return db('Document')
      .delete()
      .whereIn('id', function () {
        this.select('child_document_id')
          .from('Document_Children')
          .where('parent_document_id', parentDocumentId);
      })
      .andWhere('type', 'image')
      .returning(['id', 'minio_name']);
  },
};
