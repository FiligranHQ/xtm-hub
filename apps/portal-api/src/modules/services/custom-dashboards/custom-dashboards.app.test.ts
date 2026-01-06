import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_CUSTOM_DASHBOARDS_ID } from '../../../../tests/tests.const';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from '../document/document.app';
import { deleteDocuments } from '../document/document.helper';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { CustomDashboardsApp } from './custom-dashboards.app';
import {
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './custom-dashboards.domain';

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

  it('customDashboard should return the document with elastic search counters', async () => {
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

    await DocumentApp.createDocumentWithImageUploadsAndMetadata<CustomDashboard>(
      OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCustomDashboard',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'customDashboardsFilename',
        service_instance_id: SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        type: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        active: true,
      },
      [],
      CUSTOM_DASHBOARD_METADATA
    );

    const documentLoaded =
      await CustomDashboardsApp.loadCustomDashboard(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  it('SeoCustomDashboard should return the document with elastic search counters', async () => {
    const documentId = 'dd3fa0b7-0263-47de-8ec8-dc1f00e0e0f1' as DocumentId;
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

    await DocumentApp.createDocumentWithImageUploadsAndMetadata<CustomDashboard>(
      OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCustomDashboard',
        slug: 'myCustomDashboard',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'customDashboardsFilename',
        service_instance_id: SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        type: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        active: true,
      },
      [],
      CUSTOM_DASHBOARD_METADATA
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
