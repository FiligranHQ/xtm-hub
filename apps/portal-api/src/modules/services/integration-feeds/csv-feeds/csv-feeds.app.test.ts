import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbTx } from '../../../../../knexfile';
import {
  contextAdminUser,
  requestContextAdminUser,
  SERVICE_INTEGRATIONS_FEEDS_ID,
} from '../../../../../tests/tests.const';
import { IntegrationFeedType } from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import { DocumentId } from '../../../../model/kanel/public/Document';
import {
  ADMIN_UUID,
  PLATFORM_ORGANIZATION_UUID,
} from '../../../../portal.const';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
} from '../../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../../telemetry/telemetry.types';
import { createDocumentWithChildren } from '../../document/document.domain';
import * as DocumentHelper from '../../document/document.helper';
import {
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../integration-feeds.model';
import { csvFeedsApp } from './csv-feeds.app';

describe('csv feeds app', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'csvfilename',
  };
  beforeEach(() => {
    vi.spyOn(DocumentHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });

  it('should send a create telemetry event when creating a document', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();
    const documentId = '117804d0-2e0e-42f0-b87c-019de622f605';

    const testContext = {
      user: requestContextAdminUser.user,
      portalContext: {
        ...contextAdminUser,
        serviceInstanceId: SERVICE_INTEGRATIONS_FEEDS_ID,
      },
    };
    requestContext.set(testContext);

    await csvFeedsApp.createCsvFeed(
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICE_INTEGRATIONS_FEEDS_ID,
        type: OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        active: false,
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
      service: TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
      service_type: TelemetryEventServiceType.CSV_FEEDS,
      resource_id: documentId,
      resource_title: 'myCsvFeed',
      status: 'draft',
    });
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

    const trx = await dbTx();
    await createDocumentWithChildren<CsvFeed>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      {
        id: documentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myCsvFeed',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICE_INTEGRATIONS_FEEDS_ID,
        active: false,
        integration_type: IntegrationFeedType.CsvFeed,
      },
      [],
      INTEGRATION_FEED_CSV_FEED_METADATA,
      trx
    );
    await trx.commit();

    const documentLoaded = await csvFeedsApp.loadCsvFeed(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  afterAll(async () => {
    vi.useRealTimers();
  });
});
