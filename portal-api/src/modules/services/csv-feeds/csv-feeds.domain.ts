import { db, dbUnsecure } from '../../../../knexfile';
import { CreateCsvFeedInput } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { createDocument } from '../document/document.domain';
import { Document, MinioFile } from '../document/document.helper';

export type CsvFeed = Document;

export const createCsvFeed = async (
  input: CreateCsvFeedInput,
  files: MinioFile[],
  context: PortalContext
) => {
  const csvFeedFile = files.shift();
  const csvFeed = await createDocument<CsvFeed>(context, {
    ...input,
    type: 'csv_feed',
    file_name: csvFeedFile.fileName,
    minio_name: csvFeedFile.minioName,
    mime_type: csvFeedFile.mimeType,
  });

  await Promise.all(
    files.map((file) => {
      createDocument(context, {
        type: 'image',
        parent_document_id: csvFeed.id as DocumentId,
        file_name: file.fileName,
        minio_name: file.minioName,
        mime_type: file.mimeType,
      });
    })
  );

  return csvFeed;
};

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
