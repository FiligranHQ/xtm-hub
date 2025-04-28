import { db, dbUnsecure } from '../../../../knexfile';
import {
  DocumentMutator,
  default as DocumentType,
} from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
import DocumentMetadata from '../../../model/kanel/public/DocumentMetadata';
import Label, { LabelId } from '../../../model/kanel/public/Label';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { addPrefixToObject } from '../../../utils/typescript';
import { extractId } from '../../../utils/utils';
import { sendFileToS3 } from './document.domain';

export type Document = DocumentType & { labels: Label[] };

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
    .replace(/[&\\#,+()$~%'":*?!<>{}\s]/g, '-');
};

export interface MinioFile {
  minioName: string;
  fileName: string;
  mimeType: string;
}

export const createFileInMinIO = async (
  jsonFile,
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

export const createDocumentMetadata = async (
  context: PortalContext,
  data: {
    document_id;
    key;
    value;
  },
  trx
): Promise<DocumentMetadata[]> => {
  return db<DocumentMetadata>(context, 'Document_Metadata')
    .insert(data)
    .returning('*')
    .transacting(trx);
};

export const loadDocumentMetadata = async (
  context: PortalContext,
  field: addPrefixToObject<DocumentMutator, 'Document.'> | DocumentMutator
): Promise<DocumentMetadata[]> => {
  return db<DocumentMetadata[]>(context, 'Document_Metadata')
    .where(field)
    .select('*');
};

export const createDocumentCustomDashboard = async ({
  labels,
  parent_document_id,
  ...documentData
}: DocumentMutator & { labels?: string[] }): Promise<Document[]> => {
  const [document] = await dbUnsecure<Document>('Document')
    .insert(documentData)
    .returning('*');

  if (parent_document_id) {
    await dbUnsecure<DocumentChildren>('Document_Children').insert({
      parent_document_id: parent_document_id,
      child_document_id: document.id,
    });
  }

  if (labels?.length) {
    await dbUnsecure<ObjectLabel>('Object_Label').insert(
      labels.map((id) => ({
        object_id: document.id as unknown as ObjectLabelObjectId,
        label_id: extractId(id) as LabelId,
      }))
    );
  }
  return [document];
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

  const data: DocumentMutator & { labels?: string[] } = {
    uploader_id: context.user.id,
    name: serviceInstanceId,
    minio_name: minioName,
    file_name: document.file.name,
    service_instance_id: null,
    created_at: new Date(),
    mime_type: document.file.mimetype,
    type: 'service_picture',
  };

  const [addedDocument] = await createDocumentCustomDashboard(data);
  return addedDocument;
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};
