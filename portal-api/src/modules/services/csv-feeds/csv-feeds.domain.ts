import {
  CreateCsvFeedInput,
  CsvFeed,
} from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import { createDocument, MinioFile } from '../document/document.helper';

export const createCsvFeed = async (
  inputData: CreateCsvFeedInput,
  file: MinioFile,
  context: PortalContext
) => {
  return createDocument<CsvFeed>(context, {
    ...inputData,
    file_name: file.fileName,
    minio_name: file.minioName,
    mime_type: file.mimeType,
    type: 'csv_feed',
  });
};
