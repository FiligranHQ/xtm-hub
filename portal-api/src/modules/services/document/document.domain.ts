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
  MutationUpdateCsvFeedArgs,
  MutationUpdateCustomDashboardArgs,
  Organization,
  QueryDocumentsArgs,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../model/kanel/public/Document';
import DocumentChildren from '../../../model/kanel/public/DocumentChildren';
import Label, { LabelId } from '../../../model/kanel/public/Label';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User from '../../../model/kanel/public/User';
import { PortalContext } from '../../../model/portal-context';
import { formatRawObject } from '../../../utils/queryRaw.util';
import { extractId, omit } from '../../../utils/utils';
import { insertFileInMinio, UploadedFile } from './document-storage';
import {
  Document,
  FullDocumentMutator,
  getDocumentName,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
  processDocumentUpdateUploads,
  processUploads,
  Upload,
} from './document.helper';

import { toGlobalId } from 'graphql-relay/node/node.js';
import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import DocumentMetadata, {
  DocumentMetadataKey,
} from '../../../model/kanel/public/DocumentMetadata';
import { OrganizationId } from '../../../model/kanel/public/Organization';

export type DocumentMetadataKeys<T extends DocumentModel> = Array<
  Exclude<keyof Omit<T, 'labels'>, keyof DocumentResolverType>
>;

type MutationUpdateDocumentArgs =
  | MutationUpdateCustomDashboardArgs
  | MutationUpdateCsvFeedArgs;

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
  documentData: FullDocumentMutator,
  trx: Knex.Transaction
): Promise<Document> => {
  const existingDocuments = await loadUnsecureDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    passOldDocumentsIntoInactive(existingDocuments);
  }

  return createDocument<Document>(context, documentData, [], trx);
};

export const createDocument = async <T extends DocumentModel>(
  context: PortalContext,
  documentData: Omit<Partial<T>, 'labels'> & {
    labels?: string[];
    parent_document_id?: string;
  },
  metadataKeys: DocumentMetadataKeys<T> = [],
  trx: Knex.Transaction
): Promise<T> => {
  const [document] = await db<DocumentModel>(context, 'Document')
    .insert({
      ...omit(documentData, ['parent_document_id', 'labels', ...metadataKeys]),
      active: documentData.active ?? true,
      uploader_id: context.user.id,
      service_instance_id: context.serviceInstanceId as ServiceInstanceId,
      uploader_organization_id: context.user.selected_organization_id,
    })
    .returning('*')
    .transacting(trx);

  if (documentData.parent_document_id) {
    await db<DocumentChildren>(context, 'Document_Children').insert({
      parent_document_id: documentData.parent_document_id as DocumentId,
      child_document_id: document.id,
    }).transacting(trx);
  }

  if (documentData.labels?.length) {
    await db<ObjectLabel>(context, 'Object_Label').insert(
      documentData.labels.map((id: string) => ({
        object_id: document.id as unknown as ObjectLabelObjectId,
        label_id: extractId(id) as LabelId,
      }))
    ).transacting(trx);
  }

  if (metadataKeys.length) {
    const metadatas = await db<DocumentMetadata>(context, 'Document_Metadata')
      .insert(
        metadataKeys.map((key) => ({
          document_id: document.id,
          key: key as DocumentMetadataKey,
          value: documentData[key] as string,
        }))
      )
      .returning('*')
      .transacting(trx);

    for (const metadata of metadatas) {
      document[metadata.key] = metadata.value;
    }
  }

  return document as T;
};

export const createDocumentWithChildren = async <T extends DocumentModel>(
  type: string,
  input: Partial<T>,
  uploads: Upload[] | Upload,
  metadataKeys: DocumentMetadataKeys<T>,
  context: PortalContext,
  trx: Knex.Transaction
) => {
  const files = await processUploads(uploads, context);

  const docFile = files.shift();
  const doc = await createDocument<T>(
    context,
    {
      ...input,
      type,
      file_name: docFile.fileName,
      minio_name: docFile.minioName,
      mime_type: docFile.mimeType,
    },
    metadataKeys,
    trx
  );

  await Promise.all(
    files.map((file) => {
      createDocument(context, {
        type: 'image',
        parent_document_id: doc.id as DocumentId,
        file_name: file.fileName,
        minio_name: file.minioName,
        mime_type: file.mimeType,
      }, [], trx);
    })
  );

  return doc;
};

export const updateDocument = async <T extends DocumentModel>(
  context: PortalContext,
  documentId: string,
  documentData: Omit<Partial<T>, 'labels'> & {
    labels?: string[];
  },
  metadataKeys: DocumentMetadataKeys<T> = [],
  trx: Knex.Transaction
): Promise<T> => {
  const uploader_organization_id = documentData.uploader_organization_id
    ? extractId<OrganizationId>(documentData.uploader_organization_id)
    : null;

  const [document] = await db<DocumentModel>(context, 'Document')
    .where('id', '=', documentId)
    .update({
      ...omit(documentData, ['labels', ...metadataKeys]),
      uploader_organization_id,
      updated_at: new Date(),
      updater_id: context.user.id,
    })
    .returning('*')
    .transacting(trx);

  // If label is null => that mean we want to update the field to empty
  if (documentData.labels !== undefined) {
    await db<ObjectLabel>(context, 'Object_Label')
      .where('object_id', '=', documentId)
      .delete()
      .transacting(trx);

    if (documentData.labels?.length > 0) {
      await db<ObjectLabel>(context, 'Object_Label').insert(
        documentData.labels.map((id) => ({
          object_id: documentId as unknown as ObjectLabelObjectId,
          label_id: extractId(id) as LabelId,
        }))
      ).transacting(trx);
    }
  }

  if (metadataKeys.length) {
    await db<DocumentMetadata>(context, 'Document_Metadata')
      .where('document_id', '=', documentId)
      .delete()
      .transacting(trx);

    const metadatas = await db<DocumentMetadata>(context, 'Document_Metadata')
      .insert(
        metadataKeys.map((key) => ({
          document_id: documentId as DocumentId,
          key: key as DocumentMetadataKey,
          value: documentData[key] as string,
        }))
      )
      .returning('*').transacting(trx);

    for (const metadata of metadatas) {
      document[metadata.key] = metadata.value;
    }
  }

  return document as T;
};

export const updateDocumentWithChildren = async <T extends DocumentModel>(
  type: string,
  id: string,
  mutationArgs: MutationUpdateDocumentArgs,
  metadataKeys: DocumentMetadataKeys<T>,
  context: PortalContext,
  trx: Knex.Transaction
) => {
  const { document, updateDocument: isUpdateDoc, images, input } = mutationArgs;
  const documents = await processDocumentUpdateUploads(
    document,
    isUpdateDoc,
    images,
    context
  );

  const { documentFile, newImages, existingImages } = documents;
  const data = {
    ...input,
    type,
  } as Partial<T>;

  // We are updating the base document
  if (documentFile) {
    Object.assign(data, {
      file_name: documentFile.fileName,
      minio_name: documentFile.minioName,
      mime_type: documentFile.mimeType,
    });
  }

  const updatedDocument = await updateDocument<T>(
    context,
    id,
    data,
    metadataKeys,
    trx
  );

  // Delete the images that are not in the existingImages array
  const childIds = await db<DocumentChildren>(context, 'Document_Children')
    .where('parent_document_id', '=', id)
    .whereNotIn('child_document_id', existingImages)
    .select('child_document_id')
    .transacting(trx);
  if (childIds.length > 0) {
    await db<Document>(context, 'Document')
      .whereIn(
        'id',
        childIds.map((childId) => childId.child_document_id)
      )
      .delete()
      .transacting(trx);
  }

  // Create new images
  await Promise.all(
    newImages.map((image) =>
      createDocument(context, {
        type: 'image',
        parent_document_id: id,
        file_name: image.fileName,
        minio_name: image.minioName,
        mime_type: image.mimeType,
      }, [], trx)
    )
  );

  return updatedDocument;
};

export const incrementDocumentsDownloads = async (
  context: PortalContext,
  document: DocumentModel,
  trx: Knex.Transaction
) => {
  await updateDocument(context, document.id, {
    download_number: document.download_number + 1,
  }, [], trx);
};

export const deleteDocument = async <T extends DocumentModel>(
  context: PortalContext,
  documentId: DocumentId,
  serviceInstanceId: ServiceInstanceId,
  hardDelete: boolean,
  trx: Knex.Transaction
): Promise<T> => {
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

    return documentFromDb as T;
  }

  // Soft delete => desactivate the document
  await passDocumentToInactive(context, [documentId, ...childIds]);

  return documentFromDb as T;
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

export const loadParentDocumentsByServiceInstance = async <
  T = DocumentConnection | CsvFeedConnection | CustomDashboardConnection,
>(
  type: string,
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
      'Document.type': type,
    },
    include_metadata
  );
};

export const loadDocuments = async <
  T = DocumentConnection | CsvFeedConnection | CustomDashboardConnection,
>(
  context: PortalContext,
  opts: Partial<QueryDocumentsArgs>,
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
  }

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
    )
    .leftJoin(
      'ServiceInstance',
      'Document.service_instance_id',
      'ServiceInstance.id'
    );

  loadDocumentQuery.select(
    dbRaw(
      `CASE
      WHEN COUNT("children_documents"."id") = 0 THEN NULL
      ELSE (json_agg(json_build_object('id', "children_documents"."id", 'name', "children_documents"."name", 'active', "children_documents"."active", 'created_at', "children_documents"."created_at", 'file_name', "children_documents"."file_name", '__typename', 'Document'))::json)
    END AS children_documents`
    ),
    dbRaw(
      formatRawObject({
        columnName: 'ServiceInstance',
        typename: 'ServiceInstance',
        as: 'service_instance',
      })
    )
  );

  loadDocumentQuery.groupBy(['Document.id', 'ServiceInstance.*']);

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
): Promise<DocumentModel[]> => {
  return db<DocumentModel>(context, 'Document', opts)
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
  context: PortalContext,
  documentId: string,
  opts: Partial<QueryOpts> = {}
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
  context: PortalContext,
  documentId: string,
  opts: Partial<QueryOpts> = {}
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

export const incrementShareNumber = (documentId: DocumentId) => {
  return dbUnsecure<Document>('Document')
    .where('id', '=', documentId)
    .increment('share_number', 1)
    .returning('*');
};

export const loadDocumentById = async <T extends Document>(
  context: PortalContext,
  id: string,
  include_metadata: string[] = []
): Promise<T> => {
  const docQuery = db<T>(context, 'Document')
    .where('Document.id', '=', id)
    .select('Document.*')
    .groupBy(['Document.id']);

  if (Array.isArray(include_metadata)) {
    include_metadata.forEach((metaKey, index) => {
      const metaAlias = `meta${index}`;
      docQuery
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
  return docQuery.first();
};

export const loadSeoDocumentBySlug = async (
  type: string,
  slug: string,
  include_metadata: string[] = []
) => {
  const docQuery = dbUnsecure<Document>('Document')
    .select('Document.*')
    .where('Document.slug', '=', slug)
    .where('Document.active', '=', true)
    .where('Document.type', '=', type)
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .groupBy(['Document.id']);

  if (Array.isArray(include_metadata)) {
    include_metadata.forEach((metaKey, index) => {
      const metaAlias = `meta${index}`;
      docQuery
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

  return await docQuery.first();
};

export const loadSeoDocumentsByServiceSlug = async (
  type: string,
  serviceSlug: string,
  include_metadata: string[] = []
) => {
  const loadDocumentsQuery = dbUnsecure<Document>('Document')
    .select('Document.*')
    .leftJoin(
      'ServiceInstance',
      'Document.service_instance_id',
      'ServiceInstance.id'
    )
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .where('ServiceInstance.slug', '=', serviceSlug)
    .where('Document.active', '=', true)
    .where('Document.type', '=', type)
    .orderBy([
      { column: 'Document.updated_at', order: 'desc' },
      { column: 'Document.created_at', order: 'desc' },
    ])
    .groupBy(['Document.id']);

  if (Array.isArray(include_metadata)) {
    include_metadata.forEach((metaKey, index) => {
      const metaAlias = `meta${index}`;
      loadDocumentsQuery
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

  return await loadDocumentsQuery;
};

export const loadImagesByDocumentId = async (documentId: string) => {
  const images = await dbUnsecure<Document>('Document')
    .select(['Document.id', 'Document.file_name'])
    .join(
      'Document_Children',
      'Document.id',
      '=',
      'Document_Children.child_document_id'
    )
    .where('Document_Children.parent_document_id', '=', documentId)
    .where('Document.mime_type', 'like', 'image/%');

  for (const image of images) {
    image.id = toGlobalId('ShareableResourceImage', image.id);
  }
  return images;
};
