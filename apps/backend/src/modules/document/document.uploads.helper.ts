import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../thirdparty/minio/client';

export interface Upload {
  file: FileUpload;
  promise: Promise<FileUpload>;
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
