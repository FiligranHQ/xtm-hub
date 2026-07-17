import DataLoader from 'dataloader';
import { toGlobalId } from 'graphql-relay/node/node.js';
import {
  IntegrationType,
  Organization,
} from '../../__generated__/resolvers-types';
import UseCase from '../../model/kanel/public/UseCase';
import User, { UserId } from '../../model/kanel/public/User';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { useCaseDomain } from '../use-case/use-case.domain';
import { Document, WithDocumentId, WithParentId } from './document.helper';
import { DOCUMENT_IMAGE_METADATA_KEYS } from './document.model';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

export interface DocumentDataLoaders {
  userLoader: DataLoader<string, User | null>;
  uploaderLoader: DataLoader<string, User | null>;
  uploaderOrganizationLoader: DataLoader<string, Organization | null>;
  childrenDocumentsLoader: DataLoader<string, Document[]>;
  imagesByDocumentIdLoader: DataLoader<string, Document[]>;
  useCasesByDocumentIdLoader: DataLoader<string, UseCase[]>;
  integrationTypeLoader: DataLoader<string, IntegrationType | null>;
}

export const DocumentDataLoader = {
  batchLoadUsers: async (ids: readonly string[]): Promise<(User | null)[]> => {
    const users = await UserDomain.loadUsers(ids as UserId[]);
    const map = new Map<string, User>(users.map((user) => [user.id, user]));
    return ids.map((id) => map.get(id) ?? null);
  },

  batchLoadUploaders: async (
    ids: readonly string[]
  ): Promise<(User | null)[]> => {
    const rows: WithDocumentId<User>[] =
      await DocumentDomain.buildUploaderQuery(ids);

    const map = new Map<string, User>(
      rows.map((row) => [row._document_id, row])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  batchLoadUploaderOrganizations: async (
    ids: readonly string[]
  ): Promise<(Organization | null)[]> => {
    const rows: WithDocumentId<Organization>[] =
      await DocumentDomain.buildUploaderOrganizationQuery(ids);

    const map = new Map<string, Organization>(
      rows.map((row) => [row._document_id, row])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  batchLoadChildrenDocuments: async (
    ids: readonly string[]
  ): Promise<Document[][]> => {
    const rows: WithParentId<Document>[] =
      await DocumentChildrenDomain.buildChildrenDocumentsQuery<
        WithParentId<Document>
      >(ids, {
        isDataLoader: true,
        includeMetadata: DOCUMENT_IMAGE_METADATA_KEYS,
      });

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
    const rows: WithParentId<Document>[] =
      await DocumentChildrenDomain.buildImagesByDocumentIdQuery<
        WithParentId<Document>
      >(ids, {
        isDataLoader: true,
      });

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
    const rows: WithDocumentId<UseCase>[] =
      await useCaseDomain.buildUseCasesByDocumentIdQuery(ids);

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
    type Row = { document_id: string; value: IntegrationType };
    const rows: Row[] =
      await DocumentMetadataDomain.buildIntegrationTypeQuery(ids);

    const map = new Map<string, IntegrationType>(
      rows.map((row) => [row.document_id, row.value])
    );
    return ids.map((id) => map.get(id) ?? null);
  },

  create: (): DocumentDataLoaders => ({
    userLoader: new DataLoader(DocumentDataLoader.batchLoadUsers),
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
