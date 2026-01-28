import { Knex } from 'knex';
import { db, dbRaw, paginate } from '../../../../../knexfile';
import {
  CustomDashboardConnection,
  DocumentConnection,
  IntegrationConnection,
  Organization,
  QueryDocumentsArgs,
  UpdateDocumentInput,
} from '../../../../__generated__/resolvers-types';
import {
  default as DocumentModel,
  DocumentId,
} from '../../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../../model/kanel/public/User';
import { formatRawObject } from '../../../../utils/queryRaw.util';
import { extractId, omit } from '../../../../utils/utils';
import { Document } from '../document.helper';

import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import {
  restrictDocumentToActive,
  restrictDocumentToUserOrganization,
} from '../../../../security/restriction/document';
import { MinioFile } from '../../../../thirdparty/minio/types';
import { isUserRestrictedToActiveDocument } from '../document.security';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './document.metadata.domain';

export type DocumentData<T extends DocumentModel> = Omit<
  Partial<T>,
  'use_cases'
> & {
  use_cases?: string[];
  parent_document_id?: DocumentId;
};

export const DocumentDomain = {
  deactivateDocuments: async (documentIds: DocumentId[]) => {
    const { user } = requestContext.require();

    await db<Document>('Document')
      .whereIn('id', documentIds)
      .update({ active: false, remover_id: user.id });
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
          'use_cases',
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

  loadUploader: async (documentId: string): Promise<User | null> => {
    return db<User>('User')
      .leftJoin('Document', 'Document.uploader_id', 'User.id')
      .where('Document.id', '=', documentId)
      .select('User.*')
      .first();
  },

  loadUploaderOrganization: async (
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
  },

  loadParentDocumentsByServiceInstance: async <
    T = DocumentConnection | IntegrationConnection | CustomDashboardConnection,
  >(
    type: string,
    input: QueryDocumentsArgs,
    include_metadata?: string[]
  ): Promise<T> => {
    return DocumentDomain.loadDocuments<T>(
      {
        ...input,
        parentsOnly: true,
        searchTerm: input.searchTerm,
      },
      {
        'Document.service_instance_id': extractId<ServiceInstanceId>(
          input.serviceInstanceId
        ),
        'Document.type': type,
      },
      include_metadata
    );
  },

  loadDocuments: async <
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
          .whereRaw(
            '"Document_Children"."child_document_id" = "Document"."id"'
          );
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

    return paginate<Document, T>(
      'Document',
      opts,
      { normalizeSearchTerm: true },
      loadDocumentQuery
    );
  },

  loadSeoDocumentBySlug: async (
    type: string,
    slug: string,
    include_metadata: string[] = []
  ) => {
    const docQuery = db<Document>('Document')
      .select('Document.*')
      .where('Document.slug', '=', slug)
      .where('Document.active', '=', true)
      .where('Document.type', '=', type)
      .whereNotExists(function () {
        this.select('*')
          .from('Document_Children')
          .whereRaw(
            '"Document_Children"."child_document_id" = "Document"."id"'
          );
      })
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery.first();
  },

  loadPaginatedSeoDocumentsByServiceSlug: async <
    T = DocumentConnection | IntegrationConnection | CustomDashboardConnection,
  >(
    type: string,
    serviceSlug: string,
    opts: Partial<QueryDocumentsArgs>,
    include_metadata?: string[]
  ) => {
    const useDefaultSort = !opts.orderBy;
    const loadDocumentsQuery = DocumentDomain.loadSeoDocumentsByServiceSlug(
      type,
      serviceSlug,
      include_metadata,
      useDefaultSort
    );

    return paginate<Document, T>(
      'Document',
      opts,
      undefined,
      loadDocumentsQuery
    );
  },

  loadSeoDocumentsByServiceSlug: (
    type: string,
    serviceSlug: string,
    include_metadata: string[] = [],
    orderResults: boolean = true
  ): Knex.QueryBuilder => {
    const loadDocumentsQuery = db<Document>('Document')
      .select('Document.*')
      .leftJoin(
        'ServiceInstance',
        'Document.service_instance_id',
        'ServiceInstance.id'
      )
      .whereNotExists(function () {
        this.select('*')
          .from('Document_Children')
          .whereRaw(
            '"Document_Children"."child_document_id" = "Document"."id"'
          );
      })
      .where('ServiceInstance.slug', '=', serviceSlug)
      .where('Document.active', '=', true)
      .where('Document.type', '=', type)
      .modify((qb) => {
        if (orderResults) {
          qb.orderBy([
            { column: 'Document.updated_at', order: 'desc' },
            { column: 'Document.created_at', order: 'desc' },
          ]);
        }
      })
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(
      loadDocumentsQuery,
      include_metadata
    );

    return loadDocumentsQuery;
  },

  updateDocument: async ({
    parentDocumentId,
    document,
    uploader_id,
    uploader_organization_id,
  }: {
    parentDocumentId: string;
    document: {
      data: UpdateDocumentInput;
      file?: MinioFile;
      type: string;
    };
    uploader_organization_id: OrganizationId;
    uploader_id: UserId;
  }): Promise<DocumentModel> => {
    const { user } = requestContext.require();
    const completeDocumentData = {
      ...document.data,
      ...(document.file
        ? {
            file_name: document.file.fileName,
            minio_name: document.file.minioName,
            mime_type: document.file.mimeType,
          }
        : {}),
      type: document.type,
    };
    const [updatedDocument] = await db<DocumentModel>('Document')
      .where('id', '=', parentDocumentId)
      .update({
        ...omit(completeDocumentData, ['use_cases']),
        uploader_organization_id,
        uploader_id,
        updated_at: new Date(),
        updater_id: user.id,
      })
      .returning('*');

    return updatedDocument;
  },

  upsertOnSlug: async <T extends DocumentModel>(
    documentData: Omit<Partial<T>, 'use_cases'> & {
      use_cases?: string[];
      parent_document_id?: string;
    },
    metadataKeys: DocumentMetadataKeys<T> = []
  ): Promise<DocumentModel> => {
    const { user } = requestContext.require();
    const insertData = {
      ...omit(documentData, [
        'parent_document_id',
        'use_cases',
        ...metadataKeys,
      ]),
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
