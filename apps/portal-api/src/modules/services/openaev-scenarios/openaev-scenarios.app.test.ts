import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbTx } from '../../../../knexfile';
import {
  contextAdminUser,
  requestContextAdminUser,
  SERVICE_OPENAEV_SCENARIOS_ID,
} from '../../../../tests/tests.const';
import { requestContext } from '../../../context/request.context';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { createDocumentWithChildren } from '../document/document.domain';
import * as DocumentHelper from '../document/document.helper';
import { deleteDocuments } from '../document/document.helper';
import { OpenAEVScenariosApp } from './openaev-scenarios.app';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
  OpenAEVScenario,
} from './openaev-scenarios.domain';

describe('openaev scenarios app', () => {
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
        serviceInstanceId: SERVICE_OPENAEV_SCENARIOS_ID as ServiceInstanceId,
      },
    };
    requestContext.set(testContext);

    await OpenAEVScenariosApp.createOpenAEVScenario(
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myOpenAEV scenario',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'openAEVfilename',
        service_instance_id: SERVICE_OPENAEV_SCENARIOS_ID as ServiceInstanceId,
        type: OPENAEV_SCENARIO_DOCUMENT_TYPE,
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
      service: TelemetryEventService.OPENAEV_SCENARIOS_LIBRARY,
      resource_id: documentId,
      resource_title: 'myOpenAEV scenario',
      status: 'draft',
    });
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

    const trx = await dbTx();
    await createDocumentWithChildren<OpenAEVScenario>(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myOpenAEV scenario',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'openAEVfilename',
        service_instance_id: SERVICE_OPENAEV_SCENARIOS_ID as ServiceInstanceId,
        type: OPENAEV_SCENARIO_DOCUMENT_TYPE,
        active: false,
      },
      [],
      OPENAEV_SCENARIO_METADATA,
      trx
    );
    await trx.commit();

    const documentLoaded =
      await OpenAEVScenariosApp.loadOpenAEVScenario(documentId);

    expect(documentLoaded.download_number).toBe(5);
    expect(documentLoaded.share_number).toBe(12);
  });

  it('customDashboard should return the document with elastic search counters', async () => {
    const documentId = 'bee63ef6-0919-406e-8432-ce4acd3aaf1c' as DocumentId;
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

    const trx = await dbTx();
    await createDocumentWithChildren<OpenAEVScenario>(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      {
        id: documentId as DocumentId,
        uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'myOpenAEV scenario',
        slug: 'myOpenAEV-scenario',
        description: 'description',
        minio_name: 'minioName',
        file_name: 'openAEVfilename',
        service_instance_id: SERVICE_OPENAEV_SCENARIOS_ID as ServiceInstanceId,
        type: OPENAEV_SCENARIO_DOCUMENT_TYPE,
        active: true,
      },
      [],
      OPENAEV_SCENARIO_METADATA,
      trx
    );
    await trx.commit();

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
