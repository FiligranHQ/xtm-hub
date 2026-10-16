import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../thirdparty/minio/client';

export interface Upload {
  file: FileUpload;
  promise: Promise<FileUpload>;
}

export const DocumentUploadsHelper = {
  waitForUploads: async (uploads: Upload[] | Upload) => {
    const uploadList = Array.isArray(uploads) ? uploads : [uploads];
    await Promise.all(uploadList.map((upload) => upload.promise));
  },

  processUploads: async (
    uploads: Upload[] | Upload | undefined | null,
    serviceInstanceId: ServiceInstanceId
  ) => {
    if (uploads === undefined || uploads === null) {
      return [];
    }

    const uploadList = Array.isArray(uploads) ? uploads : [uploads];
    await DocumentUploadsHelper.waitForUploads(uploadList);

    return Promise.all(
      uploadList.map((doc) => MinIOClient.createFile(doc, serviceInstanceId))
    );
  },
};
