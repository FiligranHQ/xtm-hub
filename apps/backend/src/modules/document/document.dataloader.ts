import DataLoader from 'dataloader';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../knexfile';
import {
  DocumentMetadataKeyCode,
  IntegrationType,
  Organization,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import UseCase from '../../model/kanel/public/UseCase';
import User from '../../model/kanel/public/User';
import { restrictDocumentToUserOrganization } from '../../security/restriction/document';
import { Document } from './document.helper';
import { DOCUMENT_IMAGE_METADATA_KEYS } from './document.model';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

export interface DocumentDataLoaders {
  uploaderLoader: DataLoader<string, User | null>;
  uploaderOrganizationLoader: DataLoader<string, Organization | null>;
  childrenDocumentsLoader: DataLoader<string, Document[]>;
  imagesByDocumentIdLoader: DataLoader<string, Document[]>;
  useCasesByDocumentIdLoader: DataLoader<string, UseCase[]>;
  integrationTypeLoader: DataLoader<string, IntegrationType | null>;
}

export const DocumentDataLoader = {
  batchLoadUploaders: async (
    ids: readonly string[]
  ): Promise<(User | null)[]> => {
    type Row = User & { _document_id: string };
    const rows = await db<Row>('User')
      .leftJoin('Document', 'Document.uploader_id', 'User.id')
      .whereIn('Document.id', ids)
      .select('User.*', 'Document.id as _document_id');

    const map = new Map<string, User>(
      rows.map((row: Row) => [row._document_id, row])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  batchLoadUploaderOrganizations: async (
    ids: readonly string[]
  ): Promise<(Organization | null)[]> => {
    type Row = Organization & { _document_id: string };
    const rows = await db<Row>('Organization')
      .leftJoin(
        'Document',
        'Document.uploader_organization_id',
        'Organization.id'
      )
      .whereIn('Document.id', ids)
      .select('Organization.*', 'Document.id as _document_id');

    const map = new Map<string, Organization>(
      rows.map((row: Row) => [row._document_id, row])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  batchLoadChildrenDocuments: async (
    ids: readonly string[]
  ): Promise<Document[][]> => {
    type Row = Document & { _parent_id: string };
    const context = requestContext.get();
    const query = db<Row>('Document_Children')
      .leftJoin(
        'Document',
        'Document.id',
        'Document_Children.child_document_id'
      )
      .whereIn('Document_Children.parent_document_id', ids)
      .modify((qb) => {
        if (context?.user) {
          restrictDocumentToUserOrganization(qb);
        }
      })
      .orderBy('created_at', 'asc')
      .select(
        'Document.*',
        'Document_Children.parent_document_id as _parent_id'
      )
      .groupBy('Document.id', 'Document_Children.parent_document_id');

    DocumentMetadataDomain.addIncludeMetadataQuery(
      query,
      DOCUMENT_IMAGE_METADATA_KEYS
    );

    const rows: Row[] = await query;

    const map = new Map<string, Document[]>();
    for (const row of rows) {
      const existing = map.get(row._parent_id) ?? [];
      existing.push(row);
      map.set(row._parent_id, existing);
    }
    return ids.map((id) => map.get(id) ?? []);
  },

  batchLoadImagesByDocumentId: async (
    ids: readonly string[]
  ): Promise<Document[][]> => {
    type Row = Document & { _parent_id: string };
    const query = db<Row>('Document')
      .select(
        'Document.*',
        'Document_Children.parent_document_id as _parent_id'
      )
      .join(
        'Document_Children',
        'Document.id',
        '=',
        'Document_Children.child_document_id'
      )
      .whereIn('Document_Children.parent_document_id', ids)
      .where('Document.mime_type', 'like', 'image/%')
      .groupBy('Document.id', 'Document_Children.parent_document_id');

    DocumentMetadataDomain.addIncludeMetadataQuery(
      query,
      DOCUMENT_IMAGE_METADATA_KEYS
    );

    const rows: Row[] = await query;

    const map = new Map<string, Document[]>();
    for (const row of rows) {
      const image = {
        ...row,
        id: toGlobalId('Document', row.id) as typeof row.id,
      };
      const existing = map.get(row._parent_id) ?? [];
      existing.push(image);
      map.set(row._parent_id, existing);
    }
    return ids.map((id) => map.get(id) ?? []);
  },

  batchLoadUseCasesByDocumentId: async (
    ids: readonly string[]
  ): Promise<UseCase[][]> => {
    type Row = UseCase & { _document_id: string };
    const rows: Row[] = await db<Row>('UseCase')
      .leftJoin('Object_UseCase as ouc', 'ouc.use_case_id', 'UseCase.id')
      .whereIn('ouc.object_id', ids)
      .select('UseCase.*', 'ouc.object_id as _document_id');

    const map = new Map<string, UseCase[]>();
    for (const row of rows) {
      const existing = map.get(row._document_id) ?? [];
      existing.push(row);
      map.set(row._document_id, existing);
    }
    return ids.map((id) => map.get(id) ?? []);
  },

  batchLoadIntegrationTypes: async (
    ids: readonly string[]
  ): Promise<(IntegrationType | null)[]> => {
    type Row = { document_id: string; value: string };
    const rows: Row[] = await db<Row>('Document_Metadata')
      .select('document_id', 'value')
      .whereIn('document_id', ids)
      .where('key', DocumentMetadataKeyCode.IntegrationType);

    const map = new Map<string, IntegrationType>(
      rows.map((row: Row) => [row.document_id, row.value as IntegrationType])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  create: (): DocumentDataLoaders => ({
    uploaderLoader: new DataLoader(DocumentDataLoader.batchLoadUploaders),
    uploaderOrganizationLoader: new DataLoader(
      DocumentDataLoader.batchLoadUploaderOrganizations
    ),
    childrenDocumentsLoader: new DataLoader(
      DocumentDataLoader.batchLoadChildrenDocuments
    ),
    imagesByDocumentIdLoader: new DataLoader(
      DocumentDataLoader.batchLoadImagesByDocumentId
    ),
    useCasesByDocumentIdLoader: new DataLoader(
      DocumentDataLoader.batchLoadUseCasesByDocumentId
    ),
    integrationTypeLoader: new DataLoader(
      DocumentDataLoader.batchLoadIntegrationTypes
    ),
  }),
};
