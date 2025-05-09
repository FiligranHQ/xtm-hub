import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { db, dbUnsecure, QueryOpts } from '../../../../knexfile';
import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
import DocumentMetadata, {
  DocumentMetadataKey,
} from '../../../model/kanel/public/DocumentMetadata';
import Label, { LabelId } from '../../../model/kanel/public/Label';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { extractId, omit } from '../../../utils/utils';
import { sendFileToS3 } from './document.domain';

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

export const createDocument = async <T extends DocumentModel>(
  context: PortalContext,
  documentData: Omit<Partial<T>, 'labels'> & {
    labels?: string[];
    parent_document_id?: string;
  },
  metadataKeys: Array<
    Exclude<keyof Omit<T, 'labels'>, keyof DocumentResolverType>
  > = []
): Promise<T> => {
  const [document] = await db<DocumentModel>(context, 'Document')
    .insert({
      ...omit(documentData, ['parent_document_id', 'labels', ...metadataKeys]),
      uploader_id: context.user.id,
      service_instance_id: context.serviceInstanceId as ServiceInstanceId,
      uploader_organization_id: context.user.selected_organization_id,
    })
    .returning('*');

  if (documentData.parent_document_id) {
    await db<DocumentChildren>(context, 'Document_Children').insert({
      parent_document_id: documentData.parent_document_id as DocumentId,
      child_document_id: document.id,
    });
  }

  if (documentData.labels?.length) {
    await db<ObjectLabel>(context, 'Object_Label').insert(
      documentData.labels.map((id: string) => ({
        object_id: document.id as unknown as ObjectLabelObjectId,
        label_id: extractId(id) as LabelId,
      }))
    );
  }

  if (metadataKeys.length) {
    await db<DocumentMetadata>(context, 'Document_Metadata').insert(
      metadataKeys.map((key) => ({
        document_id: document.id,
        key: key as DocumentMetadataKey,
        value: documentData[key] as string,
      }))
    );

    const metadatas = await db<DocumentMetadata>(context, 'Document_Metadata')
      .select(['Document_Metadata.*'])
      .where('Document_Metadata.document_id', '=', document.id)
      .andWhere('Document_Metadata.key', 'IN', metadataKeys);

    for (const metadata of metadatas) {
      document[metadata.key] = metadata.value;
    }
  }

  return document as T;
};

export const uploadNewFile = async (
  context: PortalContext,
  document,
  serviceInstanceId: ServiceInstanceId
) => {
  if (!document || !document.file) {
    return;
  }
  const minioName = await sendFileToS3(
    document.file,
    document.file.name,
    context.user.id,
    serviceInstanceId
  );

  const data: FullDocumentMutator = {
    uploader_id: context.user.id,
    name: serviceInstanceId,
    minio_name: minioName,
    file_name: document.file.name,
    service_instance_id: null,
    created_at: new Date(),
    mime_type: document.file.mimetype,
    type: 'service_picture',
  };

  const addedDocument = await createDocument(context, data);
  return addedDocument;
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};

export const loadDocumentById = async (
  context: PortalContext,
  id: string,
  opts: QueryOpts = {}
): Promise<Document> => {
  return db<Document>(context, 'Document', opts)
    .where('id', '=', id)
    .select('Document.*')
    .first();
};
