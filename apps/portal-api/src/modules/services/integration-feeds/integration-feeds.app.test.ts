import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_INTEGRATIONS_FEEDS_ID } from '../../../../tests/tests.const';
import { IntegrationFeedType } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from '../document/document.app';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { integrationFeedsApp } from './integration-feeds.app';
import {
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from './integration-feeds.model';

describe('csv feeds app', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'csvfilename',
  };
  beforeEach(() => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });

  it('SeoCsvFeed should return the document with elastic search counters', async () => {
    const documentId = 'b90555a3-d194-4b54-af86-5e6568cc9ce0' as DocumentId;
    vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
      async (eventType: TelemetryEventType, documentId: string) => {
        if (
          documentId === documentId &&
          eventType === TelemetryEventType.DOWNLOAD
        )
          return 8;
        if (documentId === documentId && eventType === TelemetryEventType.SHARE)
          return 13;
        return 0; // default
      }
    );

    await DocumentApp.createDocumentWithChildren<CsvFeed>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      {
        id: documentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        slug: 'myCsvFeed',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICE_INTEGRATIONS_FEEDS_ID,
        integration_type: IntegrationFeedType.CsvFeed,
        active: true,
      },
      [],
      INTEGRATION_FEED_CSV_FEED_METADATA
    );

    const documentLoaded =
      await integrationFeedsApp.loadPublicAccessIntegrationFeed('myCsvFeed');

    expect(documentLoaded.download_number).toBe(8);
    expect(documentLoaded.share_number).toBe(13);
  });
});
