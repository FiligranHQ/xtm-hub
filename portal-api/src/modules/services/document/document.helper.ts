import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { dbUnsecure } from '../../../../knexfile';
import {
  DocumentId,
  default as DocumentModel,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import Label from '../../../model/kanel/public/Label';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { createDocument, sendFileToS3 } from './document.domain';

export type Document = DocumentModel & { labels: Label[] };
export type FullDocumentMutator = Partial<DocumentModel> & {
  labels?: string[];
  parent_document_id?: DocumentId;
};

export const getDocumentName = (documentName: string) => {
  const splitName = documentName.split('.');
  const nameWithoutExtension = splitName[0];
  const extensionName = splitName[1];
  return `${nameWithoutExtension}_${Date.now()}.${extensionName}`;
};

export const normalizeDocumentName = (documentName: string = ''): string => {
  return documentName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export interface MinioFile {
  minioName: string;
  fileName: string;
  mimeType: string;
}

export interface ExistingFile {
  id: string;
  file_name: string;
  name: string;
}

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

export const createFileInMinIO = async (
  jsonFile: Upload,
  context: PortalContext
): Promise<MinioFile> => {
  const fileName = normalizeDocumentName(jsonFile.file.filename);
  const minioName = await sendFileToS3(
    jsonFile.file,
    fileName,
    context.user.id,
    context.serviceInstanceId as ServiceInstanceId
  );
  return { minioName, fileName, mimeType: jsonFile.file.mimetype };
};

export const checkDocumentExists = async (
  documentName: string,
  serviceInstanceId: ServiceInstanceId
) => {
  const documents: Document[] = await loadUnsecureDocumentsBy({
    file_name: normalizeDocumentName(documentName),
    active: true,
    service_instance_id: serviceInstanceId,
  });
  return documents.length > 0;
};

export const loadUnsecureDocumentsBy = async (
  field: DocumentMutator
): Promise<Document[]> => {
  return dbUnsecure<Document[]>('Document').where(field).select('*');
};

export const uploadNewFile = async (context: PortalContext, document) => {
  if (!document || !document.file) {
    return;
  }
  const minioName = await sendFileToS3(
    document.file,
    document.file.name,
    context.user.id,
    context.serviceInstanceId as ServiceInstanceId
  );

  const data: FullDocumentMutator = {
    uploader_id: context.user.id,
    name: context.serviceInstanceId,
    minio_name: minioName,
    file_name: document.file.name,
    service_instance_id: null,
    created_at: new Date(),
    mime_type: document.file.mimetype,
    type: 'service_picture',
  };

  return createDocument(context, data);
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};
