import { toGlobalId } from 'graphql-relay/node/node.js';
import { db, dbUnsecure, QueryOpts } from '../../../../../knexfile';
import { DocumentId } from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import { restrictDocumentToUserOrganization } from '../../../../security/restriction/document';
import { Document } from '../document.helper';

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
    parentDocumentId: DocumentId
  ): Promise<DocumentId[]> => {
    const children: Pick<DocumentChildren, 'child_document_id'>[] =
      await db<DocumentChildren>('Document_Children')
        .where('parent_document_id', '=', parentDocumentId)
        .select('child_document_id');
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
