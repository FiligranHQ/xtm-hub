import { Knex } from 'knex';
import {
  db,
  dbRaw,
  dbUnsecure,
  paginate,
  QueryOpts,
} from '../../../../../knexfile';
import {
  CustomDashboardConnection,
  DocumentConnection,
  IntegrationFeedConnection,
  MutationUpdateCsvFeedArgs,
  MutationUpdateCustomDashboardArgs,
  Organization,
  QueryDocumentsArgs,
} from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import { LabelId } from '../../../../model/kanel/public/Label';
import { ObjectLabelObjectId } from '../../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../../model/kanel/public/User';
import { MinIOClient } from '../../../../thirdparty/minio/client';
import { formatRawObject } from '../../../../utils/queryRaw.util';
import { extractId, omit } from '../../../../utils/utils';
import {
  addIncludeMetadataQuery,
  Document,
  FullDocumentMutator,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
} from '../document.helper';

import { toGlobalId } from 'graphql-relay/node/node.js';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import { labelsApp } from '../../../settings/labels/labels.app';
import { objectLabelDomain } from '../../../settings/objectLabel/object-label.domain';
import {
  processDocumentUpdateUploads,
  processUploads,
  Upload,
} from '../document.uploads.helper';
import { DocumentChildrenDomain } from './document.children.domain';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './document.metadata.domain';

export type DocumentData<T extends DocumentModel> = Omit<
  Partial<T>,
  'labels'
> & {
  labels?: string[];
  parent_document_id?: string;
};

type MutationUpdateDocumentArgs =
  | MutationUpdateCustomDashboardArgs
  | (MutationUpdateCsvFeedArgs & { input: { integration_type: string } });

export const DocumentDomain = {
  passOldDocumentsIntoInactive: async (
    existingDocuments: Document[],
    trx: Knex.Transaction
  ) => {
    const documentIds = existingDocuments.map((doc) => doc.id);
    await dbUnsecure<Document>('Document')
      .whereIn('id', documentIds)
      .update({ active: false })
      .returning('*')
      .transacting(trx);
  },

  createDocument: async <T extends DocumentModel>(
    documentData: DocumentData<T>,
    metadataKeys: DocumentMetadataKeys<T>,
    trx: Knex.Transaction
  ) => {
    const { user, portalContext } = requestContext.require();
    const extractedId = extractId<UserId>(documentData.uploader_id ?? '');
    const uploader_id =
      documentData.uploader_id && extractedId ? extractedId : user.id;
    const [document] = await db<DocumentModel>('Document')
      .insert({
        ...omit(documentData, [
          'parent_document_id',
          'labels',
          ...metadataKeys,
        ]),
        active: documentData.active ?? true,
        uploader_id,
        uploader_organization_id: user.selected_organization_id,
        ...(!!portalContext.serviceInstanceId && {
          service_instance_id:
            portalContext.serviceInstanceId as ServiceInstanceId,
        }),
      })
      .returning('*')
      .transacting(trx);

    return document;
  },

  upsertOnSlug: async <T extends DocumentModel>(
    documentData: Omit<Partial<T>, 'labels'> & {
      labels?: string[];
      parent_document_id?: string;
    },
    metadataKeys: DocumentMetadataKeys<T> = [],
    trx: Knex.Transaction
  ): Promise<DocumentModel> => {
    const { user } = requestContext.require();
    const insertData = {
      ...omit(documentData, ['parent_document_id', 'labels', ...metadataKeys]),
      uploader_id: user.id,
      uploader_organization_id: user.selected_organization_id,
    };

    const [document] = await db<DocumentModel>('Document')
      .insert(insertData)
      .onConflict('slug')
      .merge({
        ...omit(insertData, ['uploader_id']),
        updated_at: new Date(),
        updater_id: insertData.uploader_id,
      })
      .returning('*')
      .transacting(trx);

    return document;
  },

  deleteDocuments: async (ids: DocumentId[], trx: Knex.Transaction) => {
    await db<Document>('Document')
      .whereIn('Document.id', ids)
      .delete('Document.*')
      .transacting(trx);
  },
};

export const insertDocument = async (
  documentData: FullDocumentMutator,
  trx: Knex.Transaction
): Promise<Document> => {
  const existingDocuments = await loadUnsecureDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    void DocumentDomain.passOldDocumentsIntoInactive(existingDocuments, trx);
  }

  return createDocument<Document>(documentData, [], trx);
};

export const upsertDocumentWithChildren = async <T extends DocumentModel>(
  type: string,
  input: Partial<T>,
  uploads: Upload[] | Upload,
  metadataKeys: DocumentMetadataKeys<T>,
  trx: Knex.Transaction
) => {
  const doc = await upsertDocument<T>(
    {
      ...input,
      type,
    },
    metadataKeys,
    trx
  );

  await upsertImage(doc, uploads, trx);
  return doc;
};

export const upsertImage = async <T extends DocumentModel>(
  doc: T,
  upload: Upload[] | Upload,
  trx: Knex.Transaction
) => {
  const files = await processUploads(upload);
  const deletedDocuments =
    await DocumentChildrenDomain.deleteChildImagesByParent(doc.id, trx);

  // Create all new image documents
  await Promise.all(
    files.map((file) =>
      createDocument(
        {
          type: 'image',
          parent_document_id: doc.id as DocumentId,
          file_name: file.fileName,
          minio_name: file.minioName,
          mime_type: file.mimeType,
        },
        [],
        trx
      )
    )
  );

  // Clean up MinIO files for deleted documents, need to be sure that we are finished with the logic
  if (deletedDocuments.length > 0) {
    await Promise.all(
      deletedDocuments.map((doc) => {
        return MinIOClient.deleteFile(doc.minio_name);
      })
    );
  }
};

export const upsertDocument = async <T extends DocumentModel>(
  documentData: DocumentData<T>,
  metadataKeys: DocumentMetadataKeys<T> = [],
  trx: Knex.Transaction
): Promise<T> => {
  // Prepare the data to insert
  const document = await DocumentDomain.upsertOnSlug(
    documentData,
    metadataKeys,
    trx
  );

  const documentWasUpdated = !!document.updated_at;

  // Handle parent document relationship
  if (documentData.parent_document_id) {
    // First, delete existing relationship if it exists (for upsert scenario)
    if (documentWasUpdated) {
      await DocumentChildrenDomain.deleteChild(document.id, trx);
    }

    // Insert new relationship
    await DocumentChildrenDomain.insertChildRelationship(
      {
        parentDocumentId: documentData.parent_document_id as DocumentId,
        childDocumentId: document.id,
      },
      trx
    );
  }

  if (documentData.labels?.length) {
    if (documentWasUpdated) {
      await objectLabelDomain.deleteObjectLabelBy(
        {
          object_id: document.id as unknown as ObjectLabelObjectId,
        },
        trx
      );
    }
    const insertObjectLabel = [];
    for (const name of documentData.labels) {
      const label = await labelsApp.loadOrCreateLabel({
        name,
      });
      insertObjectLabel.push({
        object_id: document.id as unknown as ObjectLabelObjectId,
        label_id: label.id,
      });
    }
    await objectLabelDomain.insertObjectLabel(insertObjectLabel, trx);
  }

  if (metadataKeys.length > 0) {
    // If document was updated (not created)
    if (documentWasUpdated) {
      // Delete all existing metadata except 'version'
      await DocumentMetadataDomain.deleteMetadata(
        { id: document.id, excludedKeys: ['product_version'] },
        trx
      );
      const existingVersion = await DocumentMetadataDomain.loadProductVersion(
        document.id
      );
      if (existingVersion) {
        document['product_version'] = existingVersion;
      }
    }

    // Insert new metadata (excluding version) if documentWasUpdated
    const metadataKeysWithoutProductVersion = metadataKeys.filter(
      (key) => key !== 'product_version' || !documentWasUpdated
    );

    const metadatas = await DocumentMetadataDomain.insertMetadata(
      document.id,
      documentData,
      metadataKeysWithoutProductVersion,
      trx
    );

    for (const metadata of metadatas) {
      document[metadata.key] = metadata.value;
    }
  }

  return document as T;
};

export const createDocument = async <T extends DocumentModel>(
  documentData: DocumentData<T>,
  metadataKeys: DocumentMetadataKeys<T> = [],
  trx: Knex.Transaction
): Promise<T> => {
  const document = await DocumentDomain.createDocument(
    documentData,
    metadataKeys,
    trx
  );

  if (documentData.parent_document_id) {
    await DocumentChildrenDomain.insertChildRelationship(
      {
        parentDocumentId: documentData.parent_document_id as DocumentId,
        childDocumentId: document.id,
      },
      trx
    );
  }

  if (metadataKeys.length) {
    const metadatas = await DocumentMetadataDomain.insertMetadata(
      document.id,
      documentData,
      metadataKeys,
      trx
    );

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
  trx: Knex.Transaction
) => {
  const files = await processUploads(uploads);

  const docFile = files.shift();
  const doc = await createDocument<T>(
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
    files.map((file) =>
      createDocument(
        {
          type: 'image',
          parent_document_id: doc.id as DocumentId,
          file_name: file.fileName,
          minio_name: file.minioName,
          mime_type: file.mimeType,
        },
        [],
        trx
      )
    )
  );

  return doc;
};

export const updateDocument = async <T extends DocumentModel>(
  documentId: DocumentId,
  documentData: Omit<Partial<T>, 'labels'> & {
    labels?: string[];
  },
  metadataKeys: DocumentMetadataKeys<T> = [],
  trx: Knex.Transaction
): Promise<T> => {
  const { user } = requestContext.require();
  const uploader_organization_id = documentData.uploader_organization_id
    ? extractId<OrganizationId>(documentData.uploader_organization_id)
    : null;

  const extractedId = extractId<UserId>(documentData.uploader_id ?? '');
  const uploader_id = (
    documentData.uploader_id && extractedId ? extractedId : user.id
  ) as UserId;

  const [document] = await db<DocumentModel>('Document')
    .where('id', '=', documentId)
    .update({
      ...omit(documentData, ['labels', ...metadataKeys]),
      uploader_organization_id,
      uploader_id,
      updated_at: new Date(),
      updater_id: user.id,
    })
    .returning('*')
    .transacting(trx);

  // If label is null => that mean we want to update the field to empty
  if (documentData.labels !== undefined) {
    await objectLabelDomain.deleteObjectLabelBy(
      { object_id: documentId as unknown as ObjectLabelObjectId },
      trx
    );

    if (documentData.labels?.length > 0) {
      await objectLabelDomain.insertObjectLabel(
        documentData.labels.map((id) => ({
          object_id: documentId as unknown as ObjectLabelObjectId,
          label_id: extractId(id) as LabelId,
        })),
        trx
      );
    }
  }

  if (metadataKeys.length) {
    await DocumentMetadataDomain.deleteMetadata({ id: documentId }, trx);
    const metadatas = await DocumentMetadataDomain.insertMetadata(
      document.id,
      documentData,
      metadataKeys,
      trx
    );

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
  trx: Knex.Transaction
) => {
  const { document, updateDocument: isUpdateDoc, images, input } = mutationArgs;
  const { documentFile, newImages, existingImages } =
    await processDocumentUpdateUploads(document, isUpdateDoc, images);
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
    id as DocumentId,
    data,
    metadataKeys,
    trx
  );

  // Delete the images that are not in the existingImages array
  const childIds = await db<DocumentChildren>('Document_Children')
    .where('parent_document_id', '=', id)
    .whereNotIn('child_document_id', existingImages)
    .select('child_document_id')
    .transacting(trx);
  if (childIds.length > 0) {
    await db<Document>('Document')
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
      createDocument(
        {
          type: 'image',
          parent_document_id: id,
          file_name: image.fileName,
          minio_name: image.minioName,
          mime_type: image.mimeType,
        },
        [],
        trx
      )
    )
  );

  return updatedDocument;
};

export const deleteDocument = async <T extends DocumentModel>(
  documentId: DocumentId,
  serviceInstanceId: ServiceInstanceId,
  hardDelete: boolean,
  trx: Knex.Transaction
): Promise<T> => {
  const [documentFromDb] = await loadDocumentBy({
    'Document.id': documentId,
    'Document.service_instance_id': serviceInstanceId,
  });

  if (!documentFromDb) {
    throw new Error('Document not found');
  }

  const childIds = await DocumentChildrenDomain.loadChildrenIds(documentId);
  if (hardDelete) {
    await DocumentChildrenDomain.deleteChildrenByParent(documentId, trx);
    await DocumentDomain.deleteDocuments([...childIds, documentId], trx);

    // Labels
    await objectLabelDomain.deleteObjectLabelBy(
      {
        object_id: documentId as unknown as ObjectLabelObjectId,
      },
      trx
    );

    return documentFromDb as T;
  }

  // Soft delete => desactivate the document
  await passDocumentToInactive([documentId, ...childIds]);

  return documentFromDb as T;
};

export const passDocumentToInactive = async (
  documentId: DocumentId | DocumentId[]
) => {
  const { user } = requestContext.require();
  documentId = Array.isArray(documentId) ? documentId : [documentId];
  await db<Document>('Document')
    .whereIn('Document.id', documentId)
    .update({ active: false, remover_id: user.id });
};

export const loadParentDocumentsByServiceInstance = async <
  T =
    | DocumentConnection
    | IntegrationFeedConnection
    | CustomDashboardConnection,
>(
  type: string,
  input: QueryDocumentsArgs,
  include_metadata?: string[]
): Promise<T> => {
  return loadDocuments<T>(
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
  T =
    | DocumentConnection
    | IntegrationFeedConnection
    | CustomDashboardConnection,
>(
  opts: Partial<QueryDocumentsArgs>,
  field: Record<string, unknown>,
  include_metadata?: string[]
): Promise<T> => {
  const loadDocumentQuery = db<Document>('Document', opts)
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

  addIncludeMetadataQuery(loadDocumentQuery, include_metadata);

  return paginate<Document, T>('Document', opts, undefined, loadDocumentQuery);
};

export const loadDocumentBy = async (
  field: Record<string, unknown>,
  opts = {}
): Promise<DocumentModel[]> => {
  return db<DocumentModel>('Document', opts).where(field).select('Document.*');
};

export const getChildrenDocuments = async (
  documentId: string,
  opts: Partial<QueryOpts> = {}
): Promise<Document[]> => {
  return db<Document>('Document_Children', opts)
    .leftJoin('Document', 'Document.id', 'Document_Children.child_document_id')
    .where('Document_Children.parent_document_id', '=', documentId)
    .orderBy('created_at', 'asc')
    .select('Document.*')
    .groupBy('Document.id');
};

export const getUploader = async (
  documentId: string,
  opts: Partial<QueryOpts> = {}
): Promise<User | null> => {
  return db<User>('User', opts)
    .leftJoin('Document', 'Document.uploader_id', 'User.id')
    .where('Document.id', '=', documentId)
    .select('User.*')
    .first();
};

export const loadUploaderOrganization = async (
  documentId: string,
  opts: Partial<QueryOpts> = {}
): Promise<Organization> => {
  const [organization] = await db<Organization>('Organization', opts)
    .leftJoin(
      'Document',
      'Document.uploader_organization_id',
      'Organization.id'
    )
    .where('Document.id', '=', documentId)
    .select('Organization.*');

  return organization;
};

export const loadDocumentById = async <T extends Document>(
  id: string,
  include_metadata: string[] = []
): Promise<T> => {
  const docQuery = db<T>('Document')
    .where('Document.id', '=', id)
    .select('Document.*')
    .groupBy(['Document.id']);

  addIncludeMetadataQuery(docQuery, include_metadata);

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

  addIncludeMetadataQuery(docQuery, include_metadata);

  return docQuery.first();
};

export const loadPaginatedSeoDocumentsByServiceSlug = async <
  T =
    | DocumentConnection
    | IntegrationFeedConnection
    | CustomDashboardConnection,
>(
  type: string,
  serviceSlug: string,
  opts: Partial<QueryDocumentsArgs>,
  include_metadata?: string[]
) => {
  const loadDocumentsQuery = loadSeoDocumentsByServiceSlug(
    type,
    serviceSlug,
    include_metadata
  );

  return paginate<Document, T>('Document', opts, undefined, loadDocumentsQuery);
};

export const loadSeoDocumentsByServiceSlug = (
  type: string,
  serviceSlug: string,
  include_metadata: string[] = []
): Knex.QueryBuilder => {
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

  addIncludeMetadataQuery(loadDocumentsQuery, include_metadata);

  return loadDocumentsQuery;
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
