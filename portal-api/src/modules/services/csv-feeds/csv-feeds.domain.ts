import { db } from '../../../../knexfile';
import { CreateCsvFeedInput } from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import {
  createDocument,
  Document,
  MinioFile,
} from '../document/document.helper';

export type CsvFeed = Document;

export const createCsvFeed = async (
  inputData: CreateCsvFeedInput,
  file: MinioFile,
  context: PortalContext
) => {
  return createDocument<CsvFeed>(context, {
    ...inputData,
    labels: inputData.labels,
    file_name: file.fileName,
    minio_name: file.minioName,
    mime_type: file.mimeType,
    type: 'csv_feed',
  });
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
