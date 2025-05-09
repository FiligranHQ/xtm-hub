import config from 'config';
import { Knex } from 'knex';
import {
  db,
  dbRaw,
  dbUnsecure,
  paginate,
  QueryOpts,
} from '../../../../knexfile';
import {
  CsvFeedConnection,
  CustomDashboardConnection,
  DocumentConnection,
  Organization,
  QueryDocumentsArgs,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
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
  FullDocumentMutator,
  getDocumentName,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
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
  context: PortalContext,
  documentData: FullDocumentMutator
): Promise<Document> => {
  const existingDocuments = await loadUnsecureDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    passOldDocumentsIntoInactive(existingDocuments);
  }

  return createDocument<Document>(context, documentData);
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
  hardDelete: boolean,
  trx: Knex.Transaction
): Promise<boolean> => {
  const [documentFromDb] = await loadDocumentBy(context, {
    'Document.id': documentId,
    'Document.service_instance_id': serviceInstanceId,
  });

  if (!documentFromDb) {
    throw new Error('Document not found');
  }

  const children = await db<DocumentChildren>(context, 'Document_Children')
    .where('parent_document_id', '=', documentId)
    .select('child_document_id');
  const childIds = children.map((c) => c.child_document_id);

  if (hardDelete) {
    // Children
    await db<DocumentChildren>(context, 'Document_Children')
      .where('parent_document_id', '=', documentId)
      .delete('Document_Children.*')
      .transacting(trx);

    await db<Document>(context, 'Document')
      .whereIn('Document.id', childIds)
      .delete('Document.*')
      .transacting(trx);

    // Labels
    await db<ObjectLabel>(context, 'Object_Label')
      .where('object_id', '=', documentId)
      .delete('*')
      .transacting(trx);

    // Parent doc
    await db<Document>(context, 'Document')
      .where('Document.id', '=', documentId)
      .delete()
      .transacting(trx);

    return true;
  }

  // Soft delete => desactivate the document
  await passDocumentToInactive(context, [documentId, ...childIds]);

  return true;
};

export const passDocumentToInactive = async (
  context: PortalContext,
  documentId: DocumentId | DocumentId[]
) => {
  documentId = Array.isArray(documentId) ? documentId : [documentId];
  await db<Document>(context, 'Document')
    .whereIn('Document.id', documentId)
    .update({ active: false, remover_id: context.user.id });
};

export const loadParentDocumentsByServiceInstance = <
  T = DocumentConnection | CsvFeedConnection | CustomDashboardConnection,
>(
  context: PortalContext,
  input: QueryDocumentsArgs,
  include_metadata?: string[]
): Promise<T> => {
  return loadDocuments<T>(
    context,
    {
      ...input,
      parentsOnly: true,
      searchTerm: normalizeDocumentName(input.searchTerm),
    },
    {
      'Document.service_instance_id': extractId<ServiceInstanceId>(
        input.serviceInstanceId
      ),
    },
    include_metadata
  );
};

export const loadDocuments = <
  T = DocumentConnection | CsvFeedConnection | CustomDashboardConnection,
>(
  context: PortalContext,
  opts: QueryDocumentsArgs,
  field: Record<string, unknown>,
  include_metadata?: string[]
): Promise<T> => {
  const loadDocumentQuery = db<Document>(context, 'Document', opts)
    .select(['Document.*'])
    .where(field);

  if (opts.parentsOnly) {
    // Using the Document_Children table to filter for parent documents (those that have children)
    loadDocumentQuery.whereNotExists(function () {
      this.select(dbRaw('1'))
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    });

    loadDocumentQuery
      .leftJoin(
        'Document_Children',
        'Document.id',
        'Document_Children.parent_document_id'
      )
      .leftJoin(
        'Document as children_documents',
        'Document_Children.child_document_id',
        'children_documents.id'
      );
  }

  loadDocumentQuery.select(
    dbRaw(
      `CASE
      WHEN COUNT("children_documents"."id") = 0 THEN NULL
      ELSE (json_agg(json_build_object('id', "children_documents"."id", 'name', "children_documents"."name", 'active', "children_documents"."active", 'created_at', "children_documents"."created_at", 'file_name', "children_documents"."file_name", '__typename', 'Document'))::json)
    END AS children_documents`
    )
  );

  loadDocumentQuery.groupBy(['Document.id']);

  if (Array.isArray(include_metadata)) {
    include_metadata.forEach((metaKey, index) => {
      const metaAlias = `meta${index}`;
      loadDocumentQuery
        .select(`${metaAlias}.value as ${metaKey}`)
        .leftJoin(
          { [metaAlias]: 'Document_Metadata' },
          `${metaAlias}.document_id`,
          'Document.id'
        )
        .andWhere(`${metaAlias}.key`, '=', metaKey)
        .groupBy([metaKey]);
    });
  }

  return paginate<Document, T>(
    context,
    'Document',
    opts,
    undefined,
    loadDocumentQuery
  );
};

export const loadDocumentBy = async (
  context: PortalContext,
  field: Record<string, unknown>,
  opts = {}
) => {
  return db<Document>(context, 'Document', opts)
    .where(field)
    .select('Document.*');
};

export const getChildrenDocuments = async (
  context: PortalContext,
  documentId: string,
  opts: Partial<QueryOpts> = {}
): Promise<Document[]> => {
  return db<Document>(context, 'Document_Children', opts)
    .leftJoin('Document', 'Document.id', 'Document_Children.child_document_id')
    .where('Document_Children.parent_document_id', '=', documentId)
    .orderBy('created_at', 'asc')
    .select('Document.*')
    .groupBy('Document.id');
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

export const getUploaderOrganization = async (
  context,
  documentId,
  opts = {}
): Promise<Organization> => {
  const [organization] = await db<Organization>(context, 'Organization', opts)
    .leftJoin(
      'Document',
      'Document.uploader_organization_id',
      'Organization.id'
    )
    .where('Document.id', '=', documentId)
    .select('Organization.*');

  return organization;
};

export const getLabels = (
  context: PortalContext,
  documentId: string,
  opts: Partial<QueryOpts> = {}
): Promise<Label[]> =>
  db<Label>(context, 'Label', opts)
    .leftJoin('Object_Label as ol', 'ol.label_id', 'Label.id')
    .where('ol.object_id', '=', documentId)
    .returning('Label.*');

export const getMetadata = (
  context: PortalContext,
  documentId: string,
  metadataKeys: string[],
  opts: Partial<QueryOpts> = {}
): Promise<Label[]> =>
  db<Label>(context, 'Label', opts)
    .leftJoin('Object_Label as ol', 'ol.label_id', 'Label.id')
    .where('ol.object_id', '=', documentId)
    .returning('Label.*');

export const incrementShareNumber = (documentId: DocumentId) => {
  return dbUnsecure<Document>('Document')
    .where('id', '=', documentId)
    .increment('share_number', 1)
    .returning('*');
};
