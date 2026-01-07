import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationType } from '../../../../__generated__/resolvers-types';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../../telemetry/telemetry.types';
import { DocumentApp } from '../../document/document.app';
import { loadDocumentWithCountersById } from '../../document/document.helper';
import * as DocumentUploadsHelper from '../../document/document.uploads.helper';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../integrations.model';

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

  it('cvsFeed should return the document with elastic search counters', async () => {
    const document = await DocumentApp.createDocument(
      {
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        short_description: 'short_description',
        slug: 'slug',
        active: true,
      },
      [{ key: 'integration_type', value: IntegrationType.CsvFeed }],
      INTEGRATION_SERVICE_INSTANCE_ID,
      []
    );
    expect(document).toBeDefined();

    const documentId = document!.id;

    vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
      async (eventType: TelemetryEventType, documentId: string) => {
        if (
          documentId === documentId &&
          eventType === TelemetryEventType.DOWNLOAD
        )
          return 5;
        if (documentId === documentId && eventType === TelemetryEventType.SHARE)
          return 12;
        return 0; // default
      }
    );

    const documentLoaded = await loadDocumentWithCountersById(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  afterAll(async () => {
    vi.useRealTimers();
  });
});
