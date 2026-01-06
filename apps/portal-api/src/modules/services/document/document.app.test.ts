import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  requestContextAdminUser,
  SERVICE_CUSTOM_DASHBOARDS_ID,
} from '../../../../tests/tests.const';
import { requestContext } from '../../../context/request.context';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { DocumentApp } from './document.app';
import { deleteDocuments } from './document.helper';

describe('DocumentApp', () => {
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

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });

  it('should send a create telemetry event when creating a document', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();
    const testContext = {
      user: requestContextAdminUser.user,
      portalContext: {
        ...contextAdminUser,
        serviceInstanceId: SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
      },
    };
    requestContext.set(testContext);

    await DocumentApp.createDocument(
      {
        short_description: 'short_description',
        slug: 'slug',
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCustomDashboard',
        description: 'description',
        active: true,
      },
      [{ key: 'product_version', value: '1.2.3' }],
      SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
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
      resource_id: expect.any(String),
      resource_title: 'myCustomDashboard',
      status: 'published',
      service_type: undefined,
    });
  });
});
