import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { MinioFile } from '../../../thirdparty/minio/types';

export interface Upload {
  file: FileUpload;
  promise: Promise<FileUpload>;
}

export interface UpdateDocumentDocuments {
  documentFile: MinioFile | undefined;
  newImages: MinioFile[];
  extractedExistingImageIds: DocumentId[];
}

export const waitForUploads = async (uploads: Upload[] | Upload) => {
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await Promise.all(uploads.map((upload) => upload.promise));
};

export const processUploads = async (
  uploads: Upload[] | Upload | undefined | null,
  serviceInstanceId: ServiceInstanceId
) => {
  if (uploads === undefined || uploads === null) {
    return [];
  }
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await waitForUploads(uploads);
  return Promise.all(
    uploads.map((doc: Upload) => MinIOClient.createFile(doc, serviceInstanceId))
  );
};
