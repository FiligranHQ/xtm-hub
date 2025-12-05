import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { DocumentId } from '../../../model/kanel/public/Document';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { MinioFile } from '../../../thirdparty/minio/types';
import { extractId } from '../../../utils/utils';

export interface Upload {
  file: FileUpload;
  promise: Promise<FileUpload>;
}

export interface UpdateDocumentDocuments {
  documentFile: MinioFile | undefined;
  newImages: MinioFile[];
  existingImageIds: DocumentId[];
}

export const waitForUploads = async (uploads: Upload[] | Upload) => {
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await Promise.all(uploads.map((upload) => upload.promise));
};

export const processUploads = async (uploads: Upload[] | Upload) => {
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await waitForUploads(uploads);
  return Promise.all(uploads.map((doc: Upload) => MinIOClient.createFile(doc)));
};

export const processDocumentUpdateUploads = async (
  document: Upload[] | undefined,
  updateDocument: boolean,
  images: string[]
): Promise<UpdateDocumentDocuments> => {
  let documentFile: MinioFile;
  let newImages: MinioFile[] = [];
  if (document && document.length > 0) {
    await waitForUploads(document);
    const files = await Promise.all(
      document.map((doc: Upload) => MinIOClient.createFile(doc))
    );
    if (updateDocument) {
      documentFile = files.shift();
    }
    newImages = files;
  }

  return {
    documentFile,
    newImages,
    existingImageIds: images.map((imageId) => extractId<DocumentId>(imageId)),
  };
};
