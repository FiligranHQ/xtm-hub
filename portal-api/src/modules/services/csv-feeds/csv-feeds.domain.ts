import { db, dbUnsecure } from '../../../../knexfile';
import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { loadDocumentById } from '../document/document.domain';

export type CsvFeed = Document;

export type CsvFeedMetadataKeys = Array<
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export const CSV_FEED_METADATA: CsvFeedMetadataKeys = [];

export const loadCsvFeedsById = async (
  context: PortalContext,
  id: string,
  opts = {}
): Promise<Document> => {
  return db<Document>(context, 'Document', opts)
    .where('id', '=', id)
    .select('Document.*')
    .first();
};

export const loadSeoCsvFeedsByServiceSlug = async (
  serviceSlug: string
): Promise<CsvFeed[]> => {
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

export const loadCsvFeedById = async (
  context: PortalContext,
  id: string,
  include_metadata = []
): Promise<CsvFeed> => {
  return loadDocumentById(context, id, include_metadata);
};
