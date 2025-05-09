import { db } from '../../../../knexfile';
import { CreateCsvFeedInput } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import {
  createDocument,
  Document,
  MinioFile,
} from '../document/document.helper';

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
  if (files.length > 0) {
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
  }
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
