import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dbTx } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import {
  DocumentOrdering,
  IntegrationFeedConnection,
  OrderingMode,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { upsertConnectors } from '../../ingest-manifest/ingest-manifest.domain';
import { ManifestInformation } from '../../ingest-manifest/ingest-manifest.model';
import sampleExtractedManifest from '../../ingest-manifest/test/sample-extracted-manifest.json';
import {
  Connector,
  CSV_FEED_CONNECTOR_METADATA,
  CSV_FEED_METADATA,
  CsvFeed,
  INTEGRATION_FEED_CONNECTORS_TYPE,
  INTEGRATION_FEED_CSV_FEED_TYPE,
  INTEGRATION_FEED_METADATA,
  INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../integration-feeds/integration-feeds.model';
import {
  createDocumentWithChildren,
  loadParentDocumentsByServiceInstance,
} from './document.domain';

import * as DocumentHelper from './document.helper';

describe('Document domain', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'filename',
  };
  beforeEach(() => {
    vi.spyOn(DocumentHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });
  describe(`${loadParentDocumentsByServiceInstance.name}`, () => {
    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
      const documentId = uuidv4() as DocumentId;
      const trx = await dbTx();
      await createDocumentWithChildren<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        {
          id: documentId,
          uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
          name: 'myCsvFeed',
          slug: 'myCsvFeed',
          description: 'description',
          minio_name: 'minioName',
          file_name: 'csvfilename',
          active: true,
          integration_type: INTEGRATION_FEED_CSV_FEED_TYPE,
        },
        [],
        CSV_FEED_METADATA,
        {
          ...contextAdminUser,
          serviceInstanceId: INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
        },
        trx
      );

      await trx.commit();

      await upsertConnectors([
        sampleExtractedManifest[0],
      ] as ManifestInformation[]);

      const connection: IntegrationFeedConnection =
        await loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          contextAdminUser,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
            ),
          },
          INTEGRATION_FEED_METADATA
        );

      const csvFeeds = connection.edges
        .filter(
          (feed) =>
            feed.node.integration_type === INTEGRATION_FEED_CSV_FEED_TYPE
        )
        .map((feed) => feed.node);
      expect(csvFeeds.length).toBeTruthy();

      const connectors = connection.edges.filter(
        (feed) =>
          feed.node.integration_type === INTEGRATION_FEED_CONNECTORS_TYPE
      );

      expect(connectors.length).toBeTruthy();
      const connector: Connector = connectors[0]?.node as Connector;
      CSV_FEED_CONNECTOR_METADATA.forEach((metadata) => {
        expect(connector[metadata]).toBeDefined();
      });
    });
  });
});
