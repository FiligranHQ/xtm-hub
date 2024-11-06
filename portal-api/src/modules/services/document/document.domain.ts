import {downloadFileFromMinio, insertFileInMinio, UploadedFile} from './document-storage';
import config from 'config';
import Document, {DocumentId, DocumentMutator} from '../../../model/kanel/public/Document';
import {db, dbUnsecure, paginate} from '../../../../knexfile';
import {
  createDocument, getDocumentName,
  loadUnsecureDocumentsBy,
} from './document.helper';
import {PortalContext} from "../../../model/portal-context";
import {DocumentConnection} from "../../../__generated__/resolvers-types";

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
    updateData:DocumentMutator,
    documentId: DocumentId
): Promise<Document[]> => {
  return db<Document>(context, 'Document').where({id: documentId}).update(
    updateData
  ).returning('*')
}

export const loadDocuments = async(
    context: PortalContext,
    opts,
    filter
): Promise<DocumentConnection> => {
  const query = paginate<Document>(context, 'Document', opts).where('active', '=', true);
  if (filter) {
    query.where('file_name', 'LIKE', `${filter}%`)
  }

  const documentConnection = await query.select(['Document.*']).asConnection<DocumentConnection>();

  const { totalCount } = await db<Document>(context, 'Document', opts).where('active', '=', true)
      .countDistinct('id as totalCount')
      .first();

  return {
    totalCount, ...documentConnection
  }
}
const loadDocumentBy = async (context: PortalContext, field: DocumentMutator) => {
  return db<Document>(context, 'Document').where(field)
}
export const downloadDocument = async (context: PortalContext, documentId: DocumentId) => {
  const [document] = await loadDocumentBy(context, {id: documentId})
  await updateDocument(context, {download_number: document.download_number+1}, document.id)
  return downloadFileFromMinio(document.minio_name, document.file_name)
}