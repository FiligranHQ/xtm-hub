import { db, dbRaw, dbUnsecure, paginate } from '../../../../../knexfile';
import {
  CsvFeed,
  CsvFeedsConnection,
  QueryDocumentsArgs,
} from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import DocumentMetadata from '../../../../model/kanel/public/DocumentMetadata';
import ObjectLabel from '../../../../model/kanel/public/ObjectLabel';
import { PortalContext } from '../../../../model/portal-context';
import { addPrefixToObject } from '../../../../utils/typescript';
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

export const loadCsvFeedsBy = async (
  context: PortalContext,
  field: addPrefixToObject<DocumentMutator, 'Document.'> | DocumentMutator,
  opts = {}
) => {
  return db<CsvFeed>(context, 'Document', opts)
    .where(field)
    .select('Document.*');
};

export const deleteCsvFeed = async (
  context: PortalContext,
  documentId: DocumentId,
  forceDelete: boolean,
  trx
): Promise<CsvFeed> => {
  await db<ObjectLabel>(context, 'Object_Label')
    .where('object_id', '=', documentId)
    .delete()
    .transacting(trx);

  if (forceDelete) {
    // Children
    const children = await db<DocumentChildren>(context, 'Document_Children')
      .where('parent_document_id', '=', documentId)
      .delete('Document_Children.*')
      .transacting(trx);
    const childIds = children.map((c) => c.child_document_id);
    await db<Document>(context, 'Document')
      .whereIn('Document.id', childIds)
      .delete('Document.*')
      .transacting(trx);

    // Metadata
    await db<DocumentMetadata>(context, 'Document_Metadata')
      .where('document_id', '=', documentId)
      .delete('Document_Metadata.*')
      .transacting(trx);

    // Delete parent
    const [parent] = await db<CsvFeed>(context, 'Document')
      .where('Document.id', '=', documentId)
      .delete('Document.*')
      .returning('Document.*')
      .transacting(trx);
    return parent;
  }
  const children = await db<DocumentChildren[]>(context, 'Document_Children')
    .where('parent_document_id', '=', documentId)
    .select('Document_Children.*');
  const childIds = children.map((c) => c.child_document_id);
  await db<Document>(context, 'Document')
    .whereIn('Document.id', childIds)
    .update({ active: false, remover_id: context.user.id })
    .transacting(trx);

  const [parent] = await db<CsvFeed>(context, 'Document')
    .where('Document.id', '=', documentId)
    .update({ active: false, remover_id: context.user.id })
    .returning('Document.*')
    .transacting(trx);
  return parent;
};

export const loadSeoCsvFeedsByServiceSlug = async (
  serviceSlug: string
): Promise<Document[]> => {
  const csvFeeds = await dbUnsecure<Document>('Document')
    .select('Document.*')
    .leftJoin(
      'ServiceInstance',
      'Document.service_instance_id',
      'ServiceInstance.id'
    )
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .where('ServiceInstance.slug', '=', serviceSlug)
    .where('Document.active', '=', true)
    .orderBy([
      { column: 'Document.updated_at', order: 'desc' },
      { column: 'Document.created_at', order: 'desc' },
    ]);
  return csvFeeds;
};

export const loadSeoCsvFeedBySlug = async (slug: string) => {
  const csvFeed = await dbUnsecure<Document>('Document')
    .select('Document.*')
    .where('Document.slug', '=', slug)
    .where('Document.active', '=', true)
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .first();
  return csvFeed;
};
