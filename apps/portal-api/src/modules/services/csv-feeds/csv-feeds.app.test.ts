import { afterAll, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  SERVICE_CSV_FEEDS_ID,
} from '../../../../tests/tests.const';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import * as DocumentHelper from '../document/document.helper';
import { deleteDocuments } from '../document/document.helper';
import { csvFeedsApp } from './csv-feeds.app';
import { CSV_FEED_DOCUMENT_TYPE } from './csv-feeds.domain';

describe('csv feeds app', () => {
  it('should send a create telemetry event when creating a document', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();
    const documentId = '117804d0-2e0e-42f0-b87c-019de622f605';

    const minioFileMock = {
      minioName: 'minioFile',
      mimeType: 'mimeType',
      fileName: 'csvfilename',
    };
    vi.spyOn(DocumentHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);

    await csvFeedsApp.createCsvFeed(
      {
        ...contextAdminUser,
        serviceInstanceId: SERVICE_CSV_FEEDS_ID as ServiceInstanceId,
      },
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICE_CSV_FEEDS_ID as ServiceInstanceId,
        type: CSV_FEED_DOCUMENT_TYPE,
        active: false,
      },
      []
    );
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: TelemetryEventType.CREATE,
      organization_id: PLATFORM_ORGANIZATION_UUID,
      organization_name: 'Filigran',
      source: TELEMETRY_SOURCE,
      user_id: ADMIN_UUID,
      service: TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
      service_type: TelemetryEventServiceType.CSV_FEEDS,
      resource_id: documentId,
      resource_title: 'myCsvFeed',
      status: 'draft',
    });
  });

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });
});
