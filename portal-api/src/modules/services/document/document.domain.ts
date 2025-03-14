import config from 'config';
import { db, dbRaw, dbUnsecure, paginate } from '../../../../knexfile';
import {
  DocumentConnection,
  QueryDocumentsArgs,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import Label, { LabelId } from '../../../model/kanel/public/Label';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User from '../../../model/kanel/public/User';
import { PortalContext } from '../../../model/portal-context';
import { extractId } from '../../../utils/utils';
import { insertFileInMinio, UploadedFile } from './document-storage';
import {
  createDocument,
  Document,
  getDocumentName,
  loadUnsecureDocumentsBy,
} from './document.helper';

export const sendFileToS3 = async (
  file: UploadedFile,
  filename: string,
  userId: string,
  serviceInstanceId: ServiceInstanceId
) => {
  const fullMetadata = {
    mimetype: file.mimetype,
    filename,
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
  documentData: DocumentMutator
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
  { labels, ...updateData }: DocumentMutator & { labels?: string[] },
  field: DocumentMutator
): Promise<Document[]> => {
  // IF label is null => that mean we want to update the field to empty
  if (labels !== undefined) {
    const { id: object_id } = field as { id: string };
    const existing = await db<ObjectLabel>(context, 'Object_Label')
      .where('object_id', '=', object_id)
      .select('*');
    if (existing) {
      await db<ObjectLabel>(context, 'Object_Label')
        .where('object_id', '=', object_id)
        .delete('*');
    }
    if ((labels.length ?? 0) > 0) {
      await db<ObjectLabel>(context, 'Object_Label').insert(
        labels.map((id) => ({
          object_id: object_id as unknown as ObjectLabelObjectId,
          label_id: extractId(id) as LabelId,
        }))
      );
    }
  }
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
  serviceInstanceId: ServiceInstanceId,
  forceDelete: boolean
): Promise<Document> => {
  const [documentFromDb] = await loadDocumentBy(context, {
    'Document.id': documentId,
    'Document.service_instance_id': serviceInstanceId,
  } as DocumentMutator);
  await db<ObjectLabel>(context, 'Object_Label')
    .where('object_id', '=', documentId)
    .delete('*');
  if (forceDelete) {
    await db<Document>(context, 'Document')
      .where('Document.id', '=', documentFromDb.id)
      .delete();
  } else {
    await passDocumentToInactive(context, documentFromDb);
  }
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

export const loadDocuments = (
  context: PortalContext,
  opts: QueryDocumentsArgs,
  field: DocumentMutator
): Promise<DocumentConnection> => {
  const loadDocumentQuery = db<Document>(context, 'Document', opts)
    .select(['Document.*'])
    .where(field);

  if (opts.parentsOnly) {
    loadDocumentQuery.whereNull('Document.parent_document_id');
    // left join children_documents
    loadDocumentQuery.leftJoin('Document as children_documents', function () {
      this.on('Document.id', '=', 'children_documents.parent_document_id');
    });
    loadDocumentQuery.select(
      dbRaw(
        `CASE
        WHEN COUNT("children_documents"."id") = 0 THEN NULL
        ELSE (json_agg(json_build_object('id', "children_documents"."id", 'name', "children_documents"."name", 'active', "children_documents"."active", 'created_at', "children_documents"."created_at", 'file_name', "children_documents"."file_name", '__typename', 'Document'))::json)
      END AS children_documents`
      )
    );
    loadDocumentQuery.groupBy(['Document.id']);
  }

  return paginate<Document, DocumentConnection>(
    context,
    'Document',
    opts,
    undefined,
    loadDocumentQuery
  );
};

export const loadDocumentBy = async (
  context: PortalContext,
  field: DocumentMutator
) => {
  return db<Document>(context, 'Document').where(field).select('Document.*');
};

export const getChildrenDocuments = async (
  context,
  documentId
): Promise<Document[]> => {
  return db<Document>(context, 'Document')
    .where('Document.parent_document_id', '=', documentId)
    .orderBy('created_at', 'asc')
    .select('Document.*');
};

export const getUploader = async (
  context,
  documentId,
  opts = {}
): Promise<User> => {
  return (
    await db<User>(context, 'User', opts)
      .leftJoin('Document', 'Document.uploader_id', 'User.id')
      .where('Document.id', '=', documentId)
      .limit(1)
      .returning('User.*')
  )[0];
};

export const getLabels = (context, documentId, opts = {}): Promise<Label[]> =>
  db<Label>(context, 'Label', opts)
    .leftJoin('Object_Label as ol', 'ol.label_id', 'Label.id')
    .where('ol.object_id', '=', documentId)
    .returning('Label.*');
