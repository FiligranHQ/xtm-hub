import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_OPENAEV_SCENARIOS_ID } from '../../../../tests/tests.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from '../document/document.app';
import { deleteDocuments } from '../document/document.helper';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { OpenAEVScenariosApp } from './openaev-scenarios.app';

describe('openaev scenarios app', () => {
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

  it('loadOpenAEVScenario should return the document with elastic search counters', async () => {
    const document = await DocumentApp.createDocument(
      {
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        short_description: 'short_description',
        slug: 'slug',
        active: true,
      },
      [{ key: 'product_version', value: '1.2.3' }],
      SERVICE_OPENAEV_SCENARIOS_ID,
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

    const documentLoaded =
      await OpenAEVScenariosApp.loadOpenAEVScenario(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  it('loadSeoOpenAEVScenario should return the document with elastic search counters', async () => {
    await DocumentApp.createDocument(
      {
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        short_description: 'short_description',
        slug: 'myOpenAEV-scenario',
        active: true,
      },
      [{ key: 'product_version', value: '1.2.3' }],
      SERVICE_OPENAEV_SCENARIOS_ID,
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
      await OpenAEVScenariosApp.loadSeoOpenAEVScenario('myOpenAEV-scenario');

    expect(documentLoaded.download_number).toBe(8);
    expect(documentLoaded.share_number).toBe(13);
  });

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });
});
