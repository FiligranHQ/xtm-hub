import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationType } from '../../../__generated__/resolvers-types';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from '../document/document.app';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { integrationsApp } from './integrations.app';
import { INTEGRATION_SERVICE_INSTANCE_ID } from './integrations.model';

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
    await DocumentApp.createDocument(
      {
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        short_description: 'short_description',
        slug: 'myCsvFeed',
        active: true,
      },
      [
        { key: 'integration_type', value: IntegrationType.CsvFeed },
        { key: 'feed_url', value: 'https://example.com' },
      ],
      INTEGRATION_SERVICE_INSTANCE_ID,
      []
    );

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

    const documentLoaded =
      await integrationsApp.loadPublicAccessIntegration('myCsvFeed');

    expect(documentLoaded.download_number).toBe(8);
    expect(documentLoaded.share_number).toBe(13);
  });
});
