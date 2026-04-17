import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import {
  DocumentMetadataKeyCode,
  DocumentMetadata as DocumentMetadataResolverType,
  IntegrationType,
} from '../../src/__generated__/resolvers-types';

import { FileUpload } from 'graphql-upload/processRequest.mjs';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../../src/model/kanel/public/Document';
import DocumentChildren, {
  DocumentChildrenMutator,
} from '../../src/model/kanel/public/DocumentChildren';
import DocumentMetadata, {
  DocumentMetadataMutator,
} from '../../src/model/kanel/public/DocumentMetadata';
import { ServiceInstanceId } from '../../src/model/kanel/public/ServiceInstance';
import { UserId } from '../../src/model/kanel/public/User';
import { DocumentApp } from '../../src/modules/document/document.app';
import { Upload } from '../../src/modules/document/document.uploads.helper';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../../src/modules/shareable-resource/opencti/integration/integration.model';
import { TEST_ORGANIZATIONS } from '../tests.const';
const mockFileUpload: FileUpload = {
  filename: 'test-image.png',
  mimetype: 'image/png',
  encoding: '7bit',
  createReadStream: vi.fn(),
};

const mockUpload = {
  file: mockFileUpload,
  promise: Promise.resolve(mockFileUpload),
};

export const TestDocumentHelper = {
  document: {
    createWholeDocument: async ({
      name = 'myCsvFeed',
      description = 'description',
      short_description = 'short_description',
      slug = 'slug',
      active = true,
      uploader_id = TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      metadata = [
        {
          key: DocumentMetadataKeyCode.IntegrationType,
          value: IntegrationType.CsvFeed,
        },
        { key: DocumentMetadataKeyCode.FeedUrl, value: 'https://example.com' },
      ],
      serviceInstanceId = INTEGRATION_SERVICE_INSTANCE_ID,
      sourceDocument = mockUpload,
    }: {
      name?: string;
      description?: string;
      short_description?: string;
      slug?: string;
      active?: boolean;
      uploader_id?: UserId;
      metadata?: DocumentMetadataResolverType[];
      serviceInstanceId?: ServiceInstanceId;
      sourceDocument?: Upload;
    }): Promise<Document> => {
      const document = await DocumentApp.createDocument({
        input: {
          name,
          description,
          short_description,
          slug,
          active,
          uploader_id,
        },
        metadata,
        serviceInstanceId,
        sourceDocument,
      });

      expect(document).toBeDefined();

      return document!;
    },
    create: async (data?: DocumentMutator): Promise<Document> => {
      const [document] = await db<Document>('Document')
        .insert({
          id: uuidv4() as DocumentId,
          type: 'image',
          ...data,
        })
        .returning('*');
      expect(document).toBeDefined();
      return document;
    },
    load: async (field: DocumentMutator): Promise<Document> => {
      return db<Document>('Document').where(field).select('*').first();
    },
    loadAll: async (field: DocumentMutator): Promise<Document[]> => {
      return db<Document[]>('Document').where(field).select('*');
    },
    delete: async (field: DocumentMutator) => {
      await db<Document>('Document').where(field).del();
    },
    update: async (
      fieldWhere: DocumentMutator,
      fieldUpdate: DocumentMutator
    ) => {
      await db<Document>('Document').where(fieldWhere).update(fieldUpdate);
    },
  },
  documentChildren: {
    create: async (
      data?: DocumentChildrenMutator
    ): Promise<DocumentChildren> => {
      const [documentChildren] = await db<DocumentChildren>('Document_Children')
        .insert({
          ...data,
        })
        .returning('*');
      expect(documentChildren).toBeDefined();
      return documentChildren;
    },
    delete: async (field: DocumentChildrenMutator) => {
      await db<DocumentChildren>('Document_Children').where(field).del();
    },
    load: async (
      field: DocumentChildrenMutator
    ): Promise<DocumentChildrenMutator[]> => {
      return db<DocumentChildren[]>('Document_Children')
        .where(field)
        .select('*');
    },
  },
  documentMetadata: {
    create: async (
      data: DocumentMetadataMutator
    ): Promise<DocumentMetadata> => {
      const [metadata] = await db<DocumentMetadata>('Document_Metadata')
        .insert(data)
        .returning('*');
      expect(metadata).toBeDefined();
      return metadata;
    },
    delete: async (field: DocumentMetadataMutator) => {
      await db<DocumentMetadata>('Document_Metadata').where(field).del();
    },
  },
};
