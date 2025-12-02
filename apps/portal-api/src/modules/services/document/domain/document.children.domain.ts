import { Knex } from 'knex';
import { db } from '../../../../../knexfile';
import { DocumentId } from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import { Document } from '../document.helper';

export const DocumentChildrenDomain = {
  insertChildRelationship: async (
    {
      childDocumentId,
      parentDocumentId,
    }: { childDocumentId: DocumentId; parentDocumentId: DocumentId },
    trx: Knex.Transaction
  ) => {
    await db<DocumentChildren>('Document_Children')
      .insert({
        parent_document_id: parentDocumentId,
        child_document_id: childDocumentId,
      })
      .transacting(trx);
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

  deleteChildrenByParent: async (
    parentDocumentId: DocumentId,
    trx: Knex.Transaction
  ) => {
    await db<DocumentChildren>('Document_Children')
      .where('parent_document_id', '=', parentDocumentId)
      .delete('Document_Children.*')
      .transacting(trx);
  },

  deleteChild: async (childDocumentId: DocumentId, trx: Knex.Transaction) => {
    await db<DocumentChildren>('Document_Children')
      .where({ child_document_id: childDocumentId })
      .delete()
      .transacting(trx);
  },

  deleteChildImagesByParent: async (
    parentDocumentId: DocumentId,
    trx: Knex.Transaction
  ): Promise<Pick<Document, 'id' | 'minio_name'>[]> => {
    return db('Document')
      .delete()
      .whereIn('id', function () {
        this.select('child_document_id')
          .from('Document_Children')
          .where('parent_document_id', parentDocumentId);
      })
      .andWhere('type', 'image')
      .returning(['id', 'minio_name'])
      .transacting(trx);
  },
};
