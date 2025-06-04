import { db, dbUnsecure } from '../../../../knexfile';
import {
  CreateCsvFeedInput,
  Document as DocumentResolverType,
  UpdateCsvFeedInput,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
import { PortalContext } from '../../../model/portal-context';
import {
  createDocument,
  loadDocumentById,
  updateDocument,
} from '../document/document.domain';
import {
  MinioFile,
  UpdateDocumentDocuments,
} from '../document/document.helper';

export type CsvFeed = Document;

export type CsvFeedMetadataKeys = Array<
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export const CSV_FEED_METADATA: CsvFeedMetadataKeys = [];

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

export const updateCsvFeed = async (
  id: string,
  input: UpdateCsvFeedInput,
  documents: UpdateDocumentDocuments,
  context: PortalContext
) => {
  const { documentFile, newImages, existingImages } = documents;
  const data = {
    ...input,
    type: 'csv_feed',
  };

  // We are updating the base document
  if (documentFile) {
    Object.assign(data, {
      file_name: documentFile.fileName,
      minio_name: documentFile.minioName,
      mime_type: documentFile.mimeType,
    });
  }

  const doc = await updateDocument<CsvFeed>(
    context,
    id,
    data,
    CSV_FEED_METADATA
  );

  // Delete the images that are not in the existingImages array
  await db<DocumentChildren>(context, 'Document_Children')
    .where('parent_document_id', '=', id)
    .whereNotIn('child_document_id', existingImages)
    .delete();

  // Create new images
  await Promise.all(
    newImages.map((image) => {
      createDocument(context, {
        type: 'image',
        parent_document_id: id,
        file_name: image.fileName,
        minio_name: image.minioName,
        mime_type: image.mimeType,
      });
    })
  );

  return doc;
};
