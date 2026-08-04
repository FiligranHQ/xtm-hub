import { Knex } from 'knex';
import { db, dbRaw, paginate } from '../../../../knexfile';
import {
  DocumentConnection,
  DocumentMetadataKeyCode,
  IntegrationType,
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
import { omit } from '../../../utils/utils';
import { isLtsVersion } from '../../../utils/versioning';
import {
  ConnectorV2,
  INTEGRATION_CONNECTOR_V2_METADATA_KEYS,
} from '../../shareable-resource/opencti/integration/integration.model';
import { Document, DOCUMENT_TYPE, WithDocumentId } from '../document.helper';

import { requestContext } from '../../../context/request.context';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { SolutionCategoryId } from '../../../model/kanel/public/SolutionCategory';
import type { UseCaseId } from '../../../model/kanel/public/UseCase';
import {
  restrictDocumentToActive,
  restrictDocumentToUserOrganization,
} from '../../../security/restriction/document';
import { MinioFile } from '../../../thirdparty/minio/types';
import { stripNulls } from '../../../utils/typescript';
import {
  ManifestFragmentHelper,
  TAG_DECOUPLING,
} from '../../shareable-resource/manifest-fragment/manifest-fragment.helper';
import { isUserRestrictedToActiveDocument } from '../document.security';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './document.metadata.domain';

type UseCaseValue = UseCaseId | string;
type SolutionCategoryValue = SolutionCategoryId | string;

// Excludes documents tagged with TAG_DECOUPLING (case-insensitive), regardless of casing.
const excludeDecouplingTag = (query: Knex.QueryBuilder) =>
  query.whereRaw(
    `NOT (? ILIKE ANY(COALESCE("Document"."tags", ARRAY[]::text[])))`,
    [TAG_DECOUPLING]
  );

export type DocumentData<
  T extends DocumentModel,
  TUseCase extends UseCaseValue = UseCaseId,
  TSolutionCategory extends SolutionCategoryValue = SolutionCategoryId,
> = Omit<Partial<T>, 'use_cases'> & {
  use_cases?: TUseCase[];
  solution_category?: TSolutionCategory;
  parent_document_id?: DocumentId;
};

export const DocumentDomain = {
  deactivateDocuments: async (documentIds: DocumentId[]) => {
    const user = requestContext.requireUser();

    await db<Document>('Document')
      .whereIn('id', documentIds)
      .update({ active: false, remover_id: user.id });
  },

  createDocument: async <
    T extends DocumentModel,
    TUseCase extends UseCaseValue = UseCaseId,
  >(
    documentData: DocumentData<T, TUseCase>,
    metadataKeys: DocumentMetadataKeys<T>
  ): Promise<DocumentModel> => {
    const user = requestContext.requireUser();
    const uploader_id = documentData.uploader_id ?? user.id;
    const [document] = await db<DocumentModel>('Document')
      .insert({
        ...omit(documentData, [
          'parent_document_id',
          'use_cases',
          'solution_category',
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

  loadDocumentsWithMetadataByIds: async <T extends Document>(
    ids: string[],
    include_metadata: DocumentMetadataKeyCode[] = []
  ): Promise<T[]> => {
    if (ids.length === 0) return [];

    const docQuery = db<T>('Document')
      .whereIn('Document.id', ids)
      .select('Document.*')
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery;
  },

  lockDocumentsByMetadata: async (
    key: string,
    value: string
  ): Promise<void> => {
    await db<DocumentModel>('Document')
      .whereIn(
        'Document.id',
        db('Document_Metadata').select('document_id').where({ key, value })
      )
      .forUpdate();
  },

  loadDocumentsByMetadata: async (
    key: string,
    value: string,
    include_metadata: DocumentMetadataKeyCode[] = [],
    documentFilters: DocumentMutator = {}
  ): Promise<DocumentModel[]> => {
    const { tags, ...scalarFilters } = documentFilters;

    const docQuery = db<DocumentModel>('Document')
      .leftJoin(
        'Document_Metadata',
        'Document.id',
        'Document_Metadata.document_id'
      )
      .where('Document_Metadata.key', key)
      .andWhere('Document_Metadata.value', value)
      .andWhere(scalarFilters)
      .select('Document.*')
      .groupBy('Document.id');

    if (tags && tags.length > 0) {
      const placeholders = tags.map(() => '?').join(',');
      docQuery.whereRaw(
        `"Document"."tags"::text[] @> array[${placeholders}]`,
        tags
      );
    }

    DocumentMetadataDomain.addIncludeMetadataQuery(docQuery, include_metadata);

    return docQuery;
  },

  buildUploaderQuery: (documentIds: readonly string[]) => {
    return db<WithDocumentId<User>>('User')
      .leftJoin('Document', 'Document.uploader_id', 'User.id')
      .whereIn('Document.id', documentIds)
      .select('User.*', 'Document.id as _document_id');
  },

  loadUploader: async (
    documentId: string
  ): Promise<WithDocumentId<User> | undefined> => {
    const rows = await DocumentDomain.buildUploaderQuery([documentId]);
    return rows[0];
  },

  buildUploaderOrganizationQuery: (documentIds: readonly string[]) => {
    return db<WithDocumentId<Organization>>('Organization')
      .leftJoin(
        'Document',
        'Document.uploader_organization_id',
        'Organization.id'
      )
      .whereIn('Document.id', documentIds)
      .select('Organization.*', 'Document.id as _document_id');
  },

  loadUploaderOrganization: async (
    documentId: string
  ): Promise<WithDocumentId<Organization> | undefined> => {
    const rows = await DocumentDomain.buildUploaderOrganizationQuery([
      documentId,
    ]);
    return rows[0];
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
    const user = requestContext.requireUser();

    const loadDocumentQuery = db<Document>('Document')
      .select(['Document.*'])
      .tap(restrictDocumentToUserOrganization)
      .where(field)
      .modify(excludeDecouplingTag);

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

    loadDocumentQuery.groupBy(['Document.id']);

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
      .modify(excludeDecouplingTag)
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
        this.select(dbRaw('1'))
          .from('Document_Children')
          .whereRaw(
            '"Document_Children"."child_document_id" = "Document"."id"'
          );
      })
      .where('ServiceInstance.slug', '=', serviceSlug)
      .where('Document.active', '=', true)
      .where('Document.type', '=', type)
      .modify(excludeDecouplingTag)
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
    const user = requestContext.requireUser();
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
        ...stripNulls(
          omit(completeDocumentData, ['use_cases', 'solution_category'])
        ),
        uploader_organization_id,
        uploader_id,
        updated_at: new Date(),
        updater_id: user.id,
      })
      .returning('*');

    return updatedDocument;
  },

  upsertOnSlug: async <
    T extends DocumentModel,
    TUseCase extends string = UseCaseValue,
  >(
    documentData: DocumentData<T, TUseCase>,
    metadataKeys: DocumentMetadataKeys<T> = []
  ): Promise<DocumentModel> => {
    const user = requestContext.requireUser();
    const insertData = {
      ...omit(documentData, [
        'parent_document_id',
        'use_cases',
        ...metadataKeys,
      ]),
      uploader_id: user.id,
      uploader_organization_id: user.selected_organization_id,
    };

    const slug = (documentData as { slug?: string }).slug;

    const existingDocument = slug
      ? await db<DocumentModel>('Document')
          .where('slug', '=', slug)
          .modify(excludeDecouplingTag)
          .orderBy('created_at', 'desc')
          .first()
      : undefined;

    if (existingDocument) {
      const [updatedDocument] = await db<DocumentModel>('Document')
        .where('id', '=', existingDocument.id)
        .update({
          ...omit(insertData, ['uploader_id']),
          updated_at: new Date(),
          updater_id: insertData.uploader_id,
        })
        .returning('*');

      if (!updatedDocument) {
        throw new Error(UnknownErrorCode.DocumentUpdateError);
      }
      return updatedDocument;
    }

    const [document] = await db<DocumentModel>('Document')
      .insert(insertData)
      .returning('*');

    if (!document) {
      throw new Error(UnknownErrorCode.DocumentCreateError);
    }
    return document;
  },

  deleteDocuments: async (ids: DocumentId[]) => {
    await db<Document>('Document').whereIn('id', ids).delete();
  },

  loadNewestDocuments: async (
    limit: number,
    include_metadata: DocumentMetadataKeyCode[] = [],
    documentTypes?: DOCUMENT_TYPE[]
  ): Promise<Document[]> => {
    const query = db<Document>('Document')
      .select('Document.*')
      .where('Document.active', true)
      .whereNotExists(function () {
        this.select(dbRaw('1'))
          .from('Document_Children')
          .whereRaw(
            '"Document_Children"."child_document_id" = "Document"."id"'
          );
      })
      .modify(excludeDecouplingTag)
      .modify((qb) => {
        if (documentTypes?.length) {
          qb.whereIn('Document.type', documentTypes);
        }
      })
      .orderBy('Document.created_at', 'desc')
      .limit(limit)
      .groupBy(['Document.id']);

    DocumentMetadataDomain.addIncludeMetadataQuery(query, include_metadata);

    return query;
  },

  loadMostDeployedDocuments: async (
    limit: number,
    include_metadata: DocumentMetadataKeyCode[] = [],
    documentTypes?: DOCUMENT_TYPE[]
  ): Promise<Document[]> => {
    const deployCounts = db('OneClickDeployment')
      .select('resource_id')
      .count('* as deploy_count')
      .modify((qb) => {
        if (documentTypes?.length) {
          qb.whereIn(
            'resource_id',
            db('Document').select('id').whereIn('type', documentTypes)
          );
        }
      })
      .groupBy('resource_id')
      .as('deploy_counts');

    const query = db<Document>('Document')
      .select('Document.*')
      .join(deployCounts, 'deploy_counts.resource_id', 'Document.id')
      .groupBy(['Document.id'])
      .orderByRaw('MAX("deploy_counts"."deploy_count") DESC')
      .orderBy('Document.id', 'asc')
      .limit(limit);

    DocumentMetadataDomain.addIncludeMetadataQuery(query, include_metadata);

    return query;
  },

  /**
   * For each manifest_fragment_id in the provided list, returns the connector
   * with the highest product_version that is still compatible with manifestVersion
   * (i.e. minimum_deployable_version_padded is absent or <= manifestVersion, padded).
   * Exactly one row per manifest_fragment_id is returned (or none if no compatible version exists).
   */
  loadBestCompatibleConnectorsByManifestFragmentIds: async (
    manifestFragmentIds: string[],
    version: string
  ): Promise<ConnectorV2[]> => {
    if (manifestFragmentIds.length === 0) return [];

    const paddedVersion =
      ManifestFragmentHelper.validateAndFormatManifestVersion(version);
    const isLts = isLtsVersion(version);
    const metadataKeys =
      INTEGRATION_CONNECTOR_V2_METADATA_KEYS as DocumentMetadataKeyCode[];

    const query = db<DocumentModel>('Document')
      .distinctOn('dm_fragment.value')
      .join(
        'Document_Metadata as dm_type',
        'Document.id',
        'dm_type.document_id'
      )
      .join(
        'Document_Metadata as dm_fragment',
        'Document.id',
        'dm_fragment.document_id'
      )
      .where('dm_type.key', DocumentMetadataKeyCode.IntegrationType)
      .andWhere('dm_type.value', IntegrationType.Connector)
      .andWhere('dm_fragment.key', DocumentMetadataKeyCode.ManifestFragmentId)
      .whereIn('dm_fragment.value', manifestFragmentIds)
      .where('Document.active', true)
      .where('Document.is_decommissioned', false)
      .select('Document.*')
      .groupBy('Document.id', 'dm_fragment.value')
      // dm_pivot comes from addIncludeMetadataQuery
      .havingRaw(
        `(MAX(CASE WHEN "dm_pivot"."key" = ? THEN "dm_pivot"."value" END) IS NULL
          OR MAX(CASE WHEN "dm_pivot"."key" = ? THEN "dm_pivot"."value" END) <= ?)
         AND "Document"."version" ${isLts ? 'LIKE' : 'NOT LIKE'} '%.LTS.%'`,
        [
          DocumentMetadataKeyCode.MinimumDeployableVersionPadded,
          DocumentMetadataKeyCode.MinimumDeployableVersionPadded,
          paddedVersion,
        ]
      )
      .orderByRaw(
        `"dm_fragment"."value" ASC, "Document"."version" DESC NULLS LAST`
      );

    DocumentMetadataDomain.addIncludeMetadataQuery(query, metadataKeys);

    return query as unknown as Promise<ConnectorV2[]>;
  },
};
