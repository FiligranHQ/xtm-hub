import { dbUnsecure } from '../../../../knexfile';
import Document, {
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';

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
  documentData: DocumentMutator
): Promise<Document[]> => {
  return dbUnsecure<Document>('Document').insert(documentData).returning('*');
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};
