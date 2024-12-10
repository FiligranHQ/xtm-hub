import { dbUnsecure } from '../../../../knexfile';
import Document, {
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceId } from '../../../model/kanel/public/Service';

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
    .replace(/[&\\#,+()$~%'":*?!<>{}]/g, '-');
};

export const checkDocumentExists = async (
  documentName: string,
  serviceId: ServiceId
) => {
  const documents: Document[] = await loadUnsecureDocumentsBy({
    file_name: normalizeDocumentName(documentName),
    active: true,
    service_id: serviceId,
  });
  return documents.length > 0;
};

export const loadUnsecureDocumentsBy = async (
  field: DocumentMutator
): Promise<Document[]> => {
  return dbUnsecure<Document>('Document')
    .where(field)
    .select('*') as unknown as Document[];
};

export const createDocument = async (documentData): Promise<Document[]> => {
  return dbUnsecure<Document>('Document')
    .insert(documentData)
    .returning('*') as unknown as Document[];
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};
