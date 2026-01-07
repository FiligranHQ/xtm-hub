import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_INTEGRATIONS_ID } from '../../../../../tests/tests.const';
import { IntegrationType } from '../../../../__generated__/resolvers-types';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../../telemetry/telemetry.types';
import { DocumentApp } from '../../document/document.app';
import { loadDocumentWithCountersById } from '../../document/document.helper';
import * as DocumentUploadsHelper from '../../document/document.uploads.helper';
import {
  CsvFeed,
  INTEGRATION_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations.model';

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
    const documentId = '7705f7bd-ee75-4a16-ad0a-75b0ef55986a' as DocumentId;
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

    await DocumentApp.createDocumentWithImageUploadsAndMetadata<CsvFeed>(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      {
        id: documentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICE_INTEGRATIONS_ID,
        active: false,
        integration_type: IntegrationType.CsvFeed,
      },
      [],
      INTEGRATION_CSV_FEED_METADATA
    );

    const documentLoaded = await loadDocumentWithCountersById(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  afterAll(async () => {
    vi.useRealTimers();
  });
});
