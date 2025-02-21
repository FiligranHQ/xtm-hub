import { db, dbUnsecure } from '../../../../knexfile';
import {
  DocumentMutator,
  default as DocumentType,
} from '../../../model/kanel/public/Document';
import Label, { LabelId } from '../../../model/kanel/public/Label';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { PortalContext } from '../../../model/portal-context';
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

export const createDocument = async (
  context: PortalContext,
  { labels, ...documentData }: DocumentMutator & { labels?: string[] }
): Promise<Document[]> => {
  const [document] = await db<Document>(context, 'Document')
    .insert(documentData)
    .returning('*');
  if ((labels?.length ?? 0) > 0) {
    await db<ObjectLabel>(context, 'Object_Label').insert(
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
    uploader_id: context.user.id as UserId,
    name: 'picture for service' + serviceInstanceId,
    minio_name: minioName,
    file_name: document.file.name,
    service_instance_id: null,
    created_at: new Date(),
    mime_type: document.file.mimetype,
  };

  const [addedDocument] = await createDocument(data);
  return addedDocument;
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};
