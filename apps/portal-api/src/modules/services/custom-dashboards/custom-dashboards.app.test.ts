import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from '../document/document.app';
import { deleteDocuments } from '../document/document.helper';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { CustomDashboardsApp } from './custom-dashboards.app';

describe('custom dashboards app', () => {
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

  it('SeoCustomDashboard should return the document with elastic search counters', async () => {
    await DocumentApp.createDocument(
      {
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        name: 'myCustomDashboard',
        description: 'description',
        short_description: 'short_description',
        slug: 'myCustomDashboard',
        active: true,
      },
      [{ key: 'product_version', value: '1.2.3' }],
      SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
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
      await CustomDashboardsApp.loadSeoCustomDashboard('myCustomDashboard');

    expect(documentLoaded.download_number).toBe(8);
    expect(documentLoaded.share_number).toBe(13);
  });

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });
});
