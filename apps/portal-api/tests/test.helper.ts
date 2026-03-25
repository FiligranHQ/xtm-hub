import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { expect, vi } from 'vitest';
import { db } from '../knexfile';
import {
  DocumentMetadata as DocumentMetadataResolverType,
  IntegrationType,
} from '../src/__generated__/resolvers-types';
import Document, { DocumentId } from '../src/model/kanel/public/Document';
import { ServiceInstanceId } from '../src/model/kanel/public/ServiceInstance';
import { UserId } from '../src/model/kanel/public/User';
import { DocumentApp } from '../src/modules/services/document/document.app';
import { Upload } from '../src/modules/services/document/document.uploads.helper';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../src/modules/services/document/opencti/integrations/integrations.model';
import { TEST_ORGANIZATIONS } from './tests.const';

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

export const TestHelper = {
  document: {
    create: async ({
      name = 'myCsvFeed',
      description = 'description',
      short_description = 'short_description',
      slug = 'slug',
      active = true,
      uploader_id = TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      metadata = [
        { key: 'integration_type', value: IntegrationType.CsvFeed },
        { key: 'feed_url', value: 'https://example.com' },
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
    load: async (documentId: DocumentId): Promise<Document | undefined> => {
      return db<Document>('Document')
        .where('id', '=', documentId)
        .select('*')
        .first();
    },
  },
};
