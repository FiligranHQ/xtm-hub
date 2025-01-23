import config from 'config';
import { db, dbUnsecure, paginate } from '../../../../knexfile';
import { DocumentConnection } from '../../../__generated__/resolvers-types';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
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
  serviceInstanceId: ServiceInstanceId
) => {
  const fullMetadata = {
    mimetype: file.mimetype,
    filename: file.filename,
    encoding: file.encoding,
    Uploadinguserid: userId,
    ServiceInstanceId: serviceInstanceId,
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
  serviceInstanceId: ServiceInstanceId
): Promise<Document[]> => {
  return updateDocument(context, updateData, {
    id: documentId,
    service_instance_id: serviceInstanceId,
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
  serviceInstanceId: ServiceInstanceId
): Promise<Document> => {
  const [documentFromDb] = await loadDocumentBy(context, {
    id: documentId,
    service_instance_id: serviceInstanceId,
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
  serviceInstanceId: ServiceInstanceId
): Promise<DocumentConnection> => {
  return loadDocuments(context, opts, filter, serviceInstanceId);
};

export const loadDocuments = async (
  context: PortalContext,
  opts,
  filter,
  serviceInstanceId: ServiceInstanceId
): Promise<DocumentConnection> => {
  const query = paginate<Document>(context, 'Document', opts)
    .where('Document.active', '=', true)
    .where('Document.service_instance_id', '=', serviceInstanceId);
  if (filter) {
    query.andWhere(function () {
      this.where('Document.file_name', 'ILIKE', `%${filter}%`).orWhere(
        'Document.description',
        'ILIKE',
        `%${filter}%`
      );
    });
  }

  const documentConnection = await query
    .select(['Document.*'])
    .asConnection<DocumentConnection>();

  const queryCount = db<Document>(context, 'Document', opts)
    .where('Document.active', '=', true)
    .where('Document.service_instance_id', '=', serviceInstanceId);
  if (filter) {
    queryCount.andWhere(function () {
      this.where('Document.file_name', 'ILIKE', `%${filter}%`).orWhere(
        'Document.description',
        'ILIKE',
        `%${filter}%`
      );
    });
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
