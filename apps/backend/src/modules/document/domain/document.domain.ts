import { Knex } from 'knex';
import { db, dbRaw, paginate } from '../../../../knexfile';
import {
  DocumentConnection,
  DocumentMetadataKeyCode,
  Organization,
  QueryDocumentsArgs,
  UpdateDocumentInput,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { formatRawObject } from '../../../utils/query-raw.util';
import { omit } from '../../../utils/utils';
import { Document } from '../document.helper';

import { requestContext } from '../../../context/request.context';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { UseCaseId } from '../../../model/kanel/public/UseCase';
import {
  restrictDocumentToActive,
  restrictDocumentToUserOrganization,
} from '../../../security/restriction/document';
import { MinioFile } from '../../../thirdparty/minio/types';
import { isUserRestrictedToActiveDocument } from '../document.security';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './document.metadata.domain';

export type DocumentData<T extends DocumentModel> = Omit<
  Partial<T>,
  'use_cases'
> & {
  use_cases?: UseCaseId[];
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
  ): Promise<T> => {
    const { user } = requestContext.require();
    const uploader_id = documentData.uploader_id ?? user.id;
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

    if (!document) {
      throw new Error(UnknownErrorCode.DocumentCreateError);
    }
    return document as T;
  },

  loadDocumentBy: async (
    field: DocumentMutator
  ): Promise<DocumentModel | undefined> => {
    return db<DocumentModel>('Document')
      .where(field)
      .select('Document.*')
      .first();
  },

  loadDocumentWithMetadataById: async <T extends Document>(
    id: string,
    include_metadata: DocumentMetadataKeyCode[] = []
  ): Promise<T> => {
    const docQuery = db<T>('Document')
      .where('Document.id', '=', id)
      .select('Document.*')
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery.first();
  },

  loadDocumentsByMetadata: async (
    key: string,
    value: string,
    include_metadata: DocumentMetadataKeyCode[] = []
  ): Promise<DocumentModel[]> => {
    const docQuery = db<DocumentModel>('Document')
      .leftJoin(
        'Document_Metadata',
        'Document.id',
        'Document_Metadata.document_id'
      )
      .where('Document_Metadata.key', key)
      .andWhere('Document_Metadata.value', value)
      .select('Document.*')
      .groupBy('Document.id');

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery;
  },

  loadUploader: async (documentId: string): Promise<User | undefined> => {
    return db<User>('User')
      .leftJoin('Document', 'Document.uploader_id', 'User.id')
      .where('Document.id', '=', documentId)
      .select('User.*')
      .first();
  },

  loadUploaderOrganization: async (
    documentId: string
  ): Promise<Organization | undefined> => {
    return db<Organization>('Organization')
      .leftJoin(
        'Document',
        'Document.uploader_organization_id',
        'Organization.id'
      )
      .where('Document.id', '=', documentId)
      .select('Organization.*')
      .first();
  },

  loadParentDocumentsByServiceInstance: async (
    type: string,
    input: QueryDocumentsArgs,
    include_metadata?: DocumentMetadataKeyCode[]
  ): Promise<DocumentConnection> => {
    return DocumentDomain.loadDocuments(
      {
        ...input,
        parentsOnly: input.parentsOnly ?? true,
        searchTerm: input.searchTerm,
      },
      {
        'Document.service_instance_id': input.serviceInstanceId,
        'Document.type': type,
      },
      include_metadata
    );
  },

  loadDocuments: async (
    opts: Partial<QueryDocumentsArgs>,
    field: Record<string, unknown>,
    include_metadata?: DocumentMetadataKeyCode[]
  ): Promise<DocumentConnection> => {
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

    return paginate<Document, DocumentConnection>(
      'Document',
      opts,
      { normalizeSearchTerm: true },
      loadDocumentQuery
    );
  },

  loadSeoDocumentBySlug: async (
    type: string,
    slug: string,
    include_metadata: DocumentMetadataKeyCode[] = []
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

  loadPaginatedSeoDocumentsByServiceSlug: async (
    type: string,
    serviceSlug: string,
    opts: Partial<QueryDocumentsArgs>,
    include_metadata?: DocumentMetadataKeyCode[]
  ) => {
    const useDefaultSort = !opts.orderBy;
    const loadDocumentsQuery = DocumentDomain.loadSeoDocumentsByServiceSlug(
      type,
      serviceSlug,
      include_metadata,
      useDefaultSort
    );

    return paginate<Document, DocumentConnection>(
      'Document',
      opts,
      opts,
      loadDocumentsQuery
    );
  },

  loadSeoDocumentsByServiceSlug: (
    type: string,
    serviceSlug: string,
    include_metadata: DocumentMetadataKeyCode[] = [],
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
    uploader_organization_id: OrganizationId | null;
    uploader_id: UserId;
  }): Promise<DocumentModel | undefined> => {
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

    if (!document) {
      throw new Error(UnknownErrorCode.DocumentCreateError);
    }
    return document;
  },

  deleteDocuments: async (ids: DocumentId[]) => {
    await db<Document>('Document').whereIn('id', ids).delete();
  },
};
