import { db, dbRaw, paginate } from '../../../../../knexfile';
import {
  CsvFeedsConnection,
  QueryDocumentsArgs,
} from '../../../../__generated__/resolvers-types';
import { DocumentMutator } from '../../../../model/kanel/public/Document';
import { PortalContext } from '../../../../model/portal-context';
import { Document } from '../document.helper';

export const loadCsvFeeds = (
  context: PortalContext,
  opts: QueryDocumentsArgs,
  field: DocumentMutator
): Promise<CsvFeedsConnection> => {
  const loadDocumentQuery = db<Document>(context, 'Document', opts)
    .select(['Document.*'])
    .where(field);

  if (opts.parentsOnly) {
    // Using the Document_Children table to filter for parent documents (those that have children)
    loadDocumentQuery.whereNotExists(function () {
      this.select(dbRaw('1'))
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    });

    loadDocumentQuery
      .leftJoin(
        'Document_Children',
        'Document.id',
        'Document_Children.parent_document_id'
      )
      .leftJoin(
        'Document as children_documents',
        'Document_Children.child_document_id',
        'children_documents.id'
      );

    loadDocumentQuery.select(
      dbRaw(
        `CASE
        WHEN COUNT("children_documents"."id") = 0 THEN NULL
        ELSE (json_agg(json_build_object('id', "children_documents"."id", 'name', "children_documents"."name", 'active', "children_documents"."active", 'created_at', "children_documents"."created_at", 'file_name', "children_documents"."file_name", '__typename', 'Document'))::json)
      END AS children_documents`
      )
    );
    loadDocumentQuery.groupBy(['Document.id']);
  }

  return paginate<Document, CsvFeedsConnection>(
    context,
    'Document',
    opts,
    undefined,
    loadDocumentQuery
  );
};
