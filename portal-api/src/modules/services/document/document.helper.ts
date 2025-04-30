import { db, dbUnsecure } from '../../../../knexfile';
import {
  CsvFeed,
  CustomDashboard,
  Document as DocumentResolverType,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
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
import { extractId, pick } from '../../../utils/utils';
import { sendFileToS3 } from './document.domain';

export type Document = DocumentType & { labels: Label[] };
export type FullDocumentMutator = DocumentMutator & {
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

export const createDocument = async <
  T extends DocumentResolverType | CustomDashboard | CsvFeed,
  K extends keyof T,
>(
  context: PortalContext,
  { labels, parent_document_id, ...documentData }: FullDocumentMutator,
  metadataKeys: K[] = []
): Promise<T> => {
  const [document] = await db<DocumentType>(context, 'Document')
    .insert({
      ...pick(documentData, [
        'id',
        'uploader_id',
        'service_instance_id',
        'description',
        'file_name',
        'minio_name',
        'active',
        'created_at',
        'download_number',
        'remover_id',
        'mime_type',
        'name',
        'updated_at',
        'updater_id',
        'short_description',
        'product_version',
        'slug',
        'share_number',
        'uploader_organization_id',
        'type',
      ]),
      uploader_id: context.user.id,
      service_instance_id: context.serviceInstanceId as ServiceInstanceId,
      uploader_organization_id: context.user.selected_organization_id,
    })
    .returning('*');

  if (parent_document_id) {
    await db<DocumentChildren>(context, 'Document_Children').insert({
      parent_document_id: parent_document_id,
      child_document_id: document.id,
    });
  }

  if (labels?.length) {
    await db<ObjectLabel>(context, 'Object_Label').insert(
      labels.map((id) => ({
        object_id: document.id as unknown as ObjectLabelObjectId,
        label_id: extractId(id) as LabelId,
      }))
    );
  }

  if (metadataKeys.length) {
    await db<DocumentMetadata>(context, 'Document_Metadata').insert(
      metadataKeys.map((key: any) => ({
        document_id: document.id,
        key,
        value: documentData[key],
      }))
    );
  }

  return document as unknown as T;
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
