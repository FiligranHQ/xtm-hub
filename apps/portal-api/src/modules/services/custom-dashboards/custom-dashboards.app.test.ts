import { afterAll, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  SERVICE_CUSTOM_DASHBOARDS_ID,
} from '../../../../tests/tests.const';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import * as DocumentHelper from '../document/document.helper';
import { deleteDocuments } from '../document/document.helper';
import { CustomDashboardsApp } from './custom-dashboards.app';
import { CUSTOM_DASHBOARD_DOCUMENT_TYPE } from './custom-dashboards.domain';

describe('custom dashboards app', () => {
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
      fileName: 'customDashboardsFilename',
    };
    vi.spyOn(DocumentHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);

    await CustomDashboardsApp.createCustomDashboard(
      {
        ...contextAdminUser,
        serviceInstanceId: SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
      },
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCustomDashboard',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'customDashboardsFilename',
        service_instance_id: SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        type: CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        active: true,
      },
      []
    );
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: TelemetryEventType.CREATE,
      organization_id: PLATFORM_ORGANIZATION_UUID,
      organization_name: 'Filigran',
      organization_type: 'Professional',
      source: TELEMETRY_SOURCE,
      user_id: ADMIN_UUID,
      service: TelemetryEventService.CUSTOM_DASHBOARDS_LIBRARY,
      resource_id: documentId,
      resource_title: 'myCustomDashboard',
      status: 'published',
    });
  });

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });
});
