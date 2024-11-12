import config from 'config';
import { db, dbUnsecure, paginate } from '../../../../knexfile';
import { DocumentConnection } from '../../../__generated__/resolvers-types';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import {
  deleteFileToMinio,
  downloadFileFromMinio,
  insertFileInMinio,
  UploadedFile,
} from './document-storage';
import {
  createDocument,
  deleteDocumentBy,
  getDocumentName,
  loadUnsecureDocumentsBy,
} from './document.helper';

export const sendFileToS3 = async (file: UploadedFile, userId: string) => {
  const fullMetadata = {
    mimetype: file.mimetype,
    filename: file.filename,
    encoding: file.encoding,
    Uploadinguserid: userId,
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

export const updateDocument = async (
  context: PortalContext,
  updateData: DocumentMutator,
  documentId: DocumentId
): Promise<Document[]> => {
  return db<Document>(context, 'Document')
    .where({ id: documentId })
    .update(updateData)
    .returning('*');
};

export const deleteDocument = async (
  context: PortalContext,
  documentId: DocumentId
): Promise<Document> => {
  const [documentFromDb] = await loadDocumentBy(context, { id: documentId });
  await deleteFileToMinio(documentFromDb.minio_name);
  await deleteDocumentBy({ id: documentId });
  return documentFromDb;
};

export const loadDocuments = async (
  context: PortalContext,
  opts,
  filter
): Promise<DocumentConnection> => {
  const query = paginate<Document>(context, 'Document', opts).where(
    'active',
    '=',
    true
  );
  if (filter) {
    query.where('file_name', 'LIKE', `${filter}%`);
  }

  const documentConnection = await query
    .select(['Document.*'])
    .asConnection<DocumentConnection>();

  const queryCount = db<Document>(context, 'Document', opts).where(
    'active',
    '=',
    true
  );
  if (filter) {
    queryCount.where('file_name', 'LIKE', `${filter}%`);
  }
  const { totalCount } = await queryCount
    .countDistinct('id as totalCount')
    .first();

  return {
    totalCount,
    ...documentConnection,
  };
};
const loadDocumentBy = async (
  context: PortalContext,
  field: DocumentMutator
) => {
  return db<Document>(context, 'Document').where(field);
};
export const downloadDocument = async (
  context: PortalContext,
  documentId: DocumentId
) => {
  const [document] = await loadDocumentBy(context, { id: documentId });
  await updateDocument(
    context,
    { download_number: document.download_number + 1 },
    document.id
  );
  return downloadFileFromMinio(document.minio_name, document.file_name);
};
