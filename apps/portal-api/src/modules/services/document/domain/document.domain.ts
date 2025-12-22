import { Knex } from 'knex';
import { db, dbRaw, dbUnsecure, paginate } from '../../../../../knexfile';
import {
  CustomDashboardConnection,
  DocumentConnection,
  IntegrationConnection,
  MutationUpdateCsvFeedArgs,
  MutationUpdateCustomDashboardArgs,
  Organization,
  QueryDocumentsArgs,
} from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../../model/kanel/public/Document';
import { LabelId } from '../../../../model/kanel/public/Label';
import { ObjectLabelObjectId } from '../../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../../model/kanel/public/User';
import { formatRawObject } from '../../../../utils/queryRaw.util';
import { extractId, omit } from '../../../../utils/utils';
import { Document, normalizeDocumentName } from '../document.helper';

import { withTransaction } from '../../../../context/database.context';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import {
  restrictDocumentToActive,
  restrictDocumentToUserOrganization,
} from '../../../../security/restriction/document';
import { objectLabelDomain } from '../../../settings/objectLabel/object-label.domain';
import { isUserRestrictedToActiveDocument } from '../document.security';
import { processDocumentUpdateUploads } from '../document.uploads.helper';
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
  parent_document_id?: DocumentId;
};

type MutationUpdateDocumentArgs =
  | MutationUpdateCustomDashboardArgs
  | (MutationUpdateCsvFeedArgs & { input: { integration_type: string } });

export const DocumentDomain = {
  passOldDocumentsIntoInactive: async (existingDocuments: Document[]) => {
    const documentIds = existingDocuments.map((doc) => doc.id);
    await dbUnsecure<Document>('Document')
      .whereIn('id', documentIds)
      .update({ active: false })
      .returning('*');
  },

  createDocument: async <T extends DocumentModel>(
    documentData: DocumentData<T>,
    metadataKeys: DocumentMetadataKeys<T>
  ) => {
    const { user } = requestContext.require();
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
      })
      .returning('*');

    return document;
  },

  loadDocumentBy: async (
    field: Record<string, unknown>
  ): Promise<DocumentModel[]> => {
    return db<DocumentModel>('Document').where(field).select('Document.*');
  },

  loadDocumentWithMetadataById: async <T extends Document>(
    id: string,
    include_metadata: string[] = []
  ): Promise<T> => {
    const docQuery = db<T>('Document')
      .where('Document.id', '=', id)
      .select('Document.*')
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery.first();
  },

  upsertOnSlug: async <T extends DocumentModel>(
    documentData: Omit<Partial<T>, 'labels'> & {
      labels?: string[];
      parent_document_id?: string;
    },
    metadataKeys: DocumentMetadataKeys<T> = []
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
      .returning('*');

    return document;
  },

  deleteDocuments: async (ids: DocumentId[]) => {
    await db<Document>('Document').whereIn('id', ids).delete();
  },
};

export const updateDocument = async <T extends DocumentModel>(
  documentId: DocumentId,
  documentData: Omit<Partial<T>, 'labels'> & {
    labels?: string[];
  },
  metadataKeys: DocumentMetadataKeys<T> = []
): Promise<T> => {
  const { user } = requestContext.require();
  const uploader_organization_id = documentData.uploader_organization_id
    ? extractId<OrganizationId>(documentData.uploader_organization_id)
    : null;

  const extractedId = extractId<UserId>(documentData.uploader_id ?? '');
  const uploader_id = (
    documentData.uploader_id && extractedId ? extractedId : user.id
  ) as UserId;

  return await withTransaction(async () => {
    const [document] = await db<DocumentModel>('Document')
      .where('id', '=', documentId)
      .update({
        ...omit(documentData, ['labels', ...metadataKeys]),
        uploader_organization_id,
        uploader_id,
        updated_at: new Date(),
        updater_id: user.id,
      })
      .returning('*');

    // If label is null => that mean we want to update the field to empty
    if (documentData.labels !== undefined) {
      await objectLabelDomain.deleteObjectLabelBy({
        object_id: documentId as unknown as ObjectLabelObjectId,
      });

      if (documentData.labels?.length > 0) {
        await objectLabelDomain.insertObjectLabel(
          documentData.labels.map((id) => ({
            object_id: documentId as unknown as ObjectLabelObjectId,
            label_id: extractId(id) as LabelId,
          }))
        );
      }
    }

    if (metadataKeys.length) {
      await DocumentMetadataDomain.deleteMetadata({ id: documentId });
      const metadatas = await DocumentMetadataDomain.insertMetadata(
        document.id,
        documentData,
        metadataKeys
      );

      for (const metadata of metadatas) {
        document[metadata.key] = metadata.value;
      }
    }

    return document as T;
  });
};

export const updateDocumentWithChildren = async <T extends DocumentModel>(
  type: string,
  parentDocumentId: DocumentId,
  serviceInstanceId: ServiceInstanceId,
  mutationArgs: MutationUpdateDocumentArgs,
  metadataKeys: DocumentMetadataKeys<T>
) => {
  const { document, updateDocument: isUpdateDoc, images, input } = mutationArgs;
  const { documentFile, newImages, existingImageIds } =
    await processDocumentUpdateUploads(
      document,
      isUpdateDoc,
      images,
      serviceInstanceId
    );
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

  return withTransaction(async () => {
    const updatedDocument = await updateDocument<T>(
      parentDocumentId,
      data,
      metadataKeys
    );

    // Delete the images that are not in the existingImages array
    const childIds = await DocumentChildrenDomain.loadChildrenIds(
      parentDocumentId,
      existingImageIds
    );
    if (childIds.length > 0) {
      await DocumentDomain.deleteDocuments(childIds);
    }

    await DocumentChildrenDomain.createImageDocuments(
      parentDocumentId,
      serviceInstanceId,
      newImages
    );
    return updatedDocument;
  });
};

export const deleteDocument = async <T extends DocumentModel>(
  documentId: DocumentId,
  serviceInstanceId: ServiceInstanceId,
  hardDelete: boolean
): Promise<T> => {
  const [documentFromDb] = await DocumentDomain.loadDocumentBy({
    'Document.id': documentId,
    'Document.service_instance_id': serviceInstanceId,
  });

  if (!documentFromDb) {
    throw new Error('Document not found');
  }

  const childIds = await DocumentChildrenDomain.loadChildrenIds(documentId);
  if (hardDelete) {
    await withTransaction(async () => {
      await DocumentChildrenDomain.deleteChildrenByParent(documentId);
      await DocumentDomain.deleteDocuments([...childIds, documentId]);

      // Labels
      await objectLabelDomain.deleteObjectLabelBy({
        object_id: documentId as unknown as ObjectLabelObjectId,
      });
    });
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
  T = DocumentConnection | IntegrationConnection | CustomDashboardConnection,
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
  T = DocumentConnection | IntegrationConnection | CustomDashboardConnection,
>(
  opts: Partial<QueryDocumentsArgs>,
  field: Record<string, unknown>,
  include_metadata?: string[]
): Promise<T> => {
  const { user } = requestContext.require();

  const loadDocumentQuery = db<Document>('Document')
    .select(['Document.*'])
    .tap(restrictDocumentToUserOrganization)
    .where(field);

  if (
    field['Document.service_instance_id'] &&
    (await isUserRestrictedToActiveDocument(
      user,
      field['Document.service_instance_id'] as ServiceInstanceId
    ))
  ) {
    loadDocumentQuery.tap(restrictDocumentToActive);
  }

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

  DocumentMetadataDomain.addIncludeMetadataQuery(
    loadDocumentQuery,
    include_metadata
  );

  return paginate<Document, T>('Document', opts, undefined, loadDocumentQuery);
};

export const getUploader = async (documentId: string): Promise<User | null> => {
  return db<User>('User')
    .leftJoin('Document', 'Document.uploader_id', 'User.id')
    .where('Document.id', '=', documentId)
    .select('User.*')
    .first();
};

export const loadUploaderOrganization = async (
  documentId: string
): Promise<Organization> => {
  const [organization] = await db<Organization>('Organization')
    .leftJoin(
      'Document',
      'Document.uploader_organization_id',
      'Organization.id'
    )
    .where('Document.id', '=', documentId)
    .select('Organization.*');

  return organization;
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

  DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

  return docQuery.first();
};

export const loadPaginatedSeoDocumentsByServiceSlug = async <
  T = DocumentConnection | IntegrationConnection | CustomDashboardConnection,
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

  DocumentMetadataDomain.addIncludeMetadataQuery(
    loadDocumentsQuery,
    include_metadata
  );

  return loadDocumentsQuery;
};
