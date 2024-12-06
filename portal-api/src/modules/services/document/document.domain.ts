import config from 'config';
import { db, dbUnsecure, paginate } from '../../../../knexfile';
import { DocumentConnection } from '../../../__generated__/resolvers-types';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceId } from '../../../model/kanel/public/Service';
import { PortalContext } from '../../../model/portal-context';
import { insertFileInMinio, UploadedFile } from './document-storage';
import {
  createDocument,
  getDocumentName,
  loadUnsecureDocumentsBy,
} from './document.helper';

export const sendFileToS3 = async (
  file: UploadedFile,
  userId: string,
  serviceId: ServiceId
) => {
  const fullMetadata = {
    mimetype: file.mimetype,
    filename: file.filename,
    encoding: file.encoding,
    Uploadinguserid: userId,
    ServiceId: serviceId,
  };

  const fileParams = {
    Bucket: config.get('minio.bucketName'),
    Key: getDocumentName(file.filename),
    Body: file.createReadStream(),
    Metadata: fullMetadata,
  };

  return await insertFileInMinio(fileParams);
};

export const passOldDocumentsIntoInactive = async (
  existingDocuments: Document[]
) => {
  const documentIds = existingDocuments.map((doc) => doc.id);
  await dbUnsecure<Document>('Document')
    .whereIn('id', documentIds)
    .update({ active: false })
    .returning('*');
};

export const insertDocument = async (
  documentData: Document
): Promise<Document[]> => {
  const existingDocuments = await loadUnsecureDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    passOldDocumentsIntoInactive(existingDocuments);
  }

  return createDocument(documentData);
};

export const updateDocumentDescription = async (
  context: PortalContext,
  updateData: DocumentMutator,
  documentId: DocumentId,
  serviceId: ServiceId
): Promise<Document[]> => {
  return updateDocument(context, updateData, {
    id: documentId,
    service_id: serviceId,
  });
};

export const updateDocument = async (
  context: PortalContext,
  updateData: DocumentMutator,
  field: DocumentMutator
): Promise<Document[]> => {
  return db<Document>(context, 'Document')
    .where(field)
    .update(updateData)
    .returning('*');
};

export const incrementDocumentsDownloads = async (
  context: PortalContext,
  document: Document
) => {
  const data: DocumentMutator = {
    download_number: document.download_number + 1,
  };
  await updateDocument(context, data, { id: document.id });
};

export const deleteDocument = async (
  context: PortalContext,
  documentId: DocumentId,
  serviceId: ServiceId
): Promise<Document> => {
  const [documentFromDb] = await loadDocumentBy(context, {
    id: documentId,
    service_id: serviceId,
  });
  await passDocumentToInactive(context, documentFromDb);
  return documentFromDb;
};

export const passDocumentToInactive = async (
  context: PortalContext,
  document: Document
) => {
  await db<Document>(context, 'Document')
    .where('Document.id', '=', document.id)
    .update({ active: false, remover_id: context.user.id });
};

export const getDocuments = async (
  context: PortalContext,
  opts,
  filter,
  serviceId: ServiceId
): Promise<DocumentConnection> => {
  return loadDocuments(context, opts, filter, serviceId);
};

export const loadDocuments = async (
  context: PortalContext,
  opts,
  filter,
  serviceId: ServiceId
): Promise<DocumentConnection> => {
  const query = paginate<Document>(context, 'Document', opts)
    .where('Document.active', '=', true)
    .where('Document.service_id', '=', serviceId);
  if (filter) {
    query
      .where('Document.file_name', 'LIKE', `%${filter}%`)
      .orWhere('Document.description', 'LIKE', `%${filter}%`);
  }

  const documentConnection = await query
    .select(['Document.*'])
    .asConnection<DocumentConnection>();

  const queryCount = db<Document>(context, 'Document', opts)
    .where('Document.active', '=', true)
    .where('Document.service_id', '=', serviceId);
  if (filter) {
    queryCount.where('Document.file_name', 'LIKE', `${filter}%`);
  }
  const { totalCount } = await queryCount
    .countDistinct('Document.id as totalCount')
    .first();

  return {
    totalCount,
    ...documentConnection,
  };
};
export const loadDocumentBy = async (
  context: PortalContext,
  field: DocumentMutator
) => {
  return db<Document>(context, 'Document').where(field);
};
