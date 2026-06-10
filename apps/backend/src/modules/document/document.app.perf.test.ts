import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  measureAvgDuration,
  seedDocuments,
  TestHelper,
} from '../../../tests/helper/test.helper';
import { SERVICES } from '../../../tests/tests.const';
import {
  DocumentOrdering,
  FilterKey,
  OrderingMode,
  QueryPublicDocumentsArgs,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import { logApp } from '../../utils/app-logger.util';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../shareable-resource/opencti/integration/integration.model';
import { DocumentApp } from './document.app';

// Unique run prefix — keeps slugs and names from colliding with other test runs
const RUN_PREFIX = `perf-${uuidv4().slice(0, 8)}`;

// Track all created resources for teardown
const allCreatedDocumentIds: DocumentId[] = [];
const allCreatedImageDocumentIds: DocumentId[] = [];
const allCreatedServiceInstanceIds: ServiceInstanceId[] = [];

// ---------------------------------------------------------------------------
// Service-instance helper
// ---------------------------------------------------------------------------

async function createTestServiceInstance(opts: {
  serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  serviceDefinitionId: ServiceDefinitionId;
  slugSuffix: string;
}): Promise<ServiceInstance> {
  const slug = `${RUN_PREFIX}-${opts.slugSuffix}`;
  const instance = await TestHelper.serviceInstance.create({
    name: `perf-${opts.slugSuffix}-${RUN_PREFIX}`,
    slug,
    service_definition_id: opts.serviceDefinitionId,
    creation_status: ServiceInstanceCreationStatus.Ready,
    public: true,
    tags: [],
    ordering: 99,
  });
  allCreatedServiceInstanceIds.push(instance.id);
  return instance;
}

async function seed(
  count: number,
  opts: Omit<Parameters<typeof seedDocuments>[1], 'runPrefix'>
): Promise<void> {
  const { documentIds, imageDocumentIds } = await seedDocuments(count, {
    ...opts,
    runPrefix: RUN_PREFIX,
  });
  allCreatedDocumentIds.push(...documentIds);
  allCreatedImageDocumentIds.push(...imageDocumentIds);
}

describe('loadPublicDocuments — performance benchmarks', () => {
  afterAll(async () => {
    // 1. Remove child links first (respects FK constraints on Document_Children)
    await Promise.all(
      allCreatedImageDocumentIds.map((id) =>
        TestHelper.documentChildren.delete({ child_document_id: id })
      )
    );
    // 2. Delete image documents
    await Promise.all(
      allCreatedImageDocumentIds.map((id) => TestHelper.document.delete({ id }))
    );
    // 3. Delete parent documents (metadata rows cascade via the app layer or
    //    are cleaned up implicitly since Document_Metadata has no FK back-ref)
    await Promise.all(
      allCreatedDocumentIds.map((id) => TestHelper.document.delete({ id }))
    );
    // 4. Delete the test service instances created for this run
    await Promise.all(
      allCreatedServiceInstanceIds.map((id) =>
        TestHelper.serviceInstance.delete({ id })
      )
    );
  });

  // =========================================================================
  // OPENCTI INTEGRATIONS (connectors)
  // =========================================================================
  describe('opencti integrations (connector)', () => {
    let integrationServiceInstance: ServiceInstance;

    beforeAll(async () => {
      integrationServiceInstance = await createTestServiceInstance({
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiIntegrations,
        serviceDefinitionId: SERVICES.DEFINITIONS.OPENCTI_INTEGRATIONS.ID,
        slugSuffix: 'integrations',
      });
    });

    describe('small dataset — 20 documents', () => {
      beforeAll(async () => {
        await seed(20, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'connector-integration',
          managerSupportedCount: 20,
          groupTag: 'int-small',
          metadataVariant: 'integration',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });

      it('should cover scenario 2 — with search term "connector"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'connector',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });

      it('should cover scenario 3 — with metadata filter (manager_supported: true)', async () => {
        const input = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          filters: [{ key: FilterKey.ManagerSupported, value: ['true'] }],
        } as unknown as QueryPublicDocumentsArgs;
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S3 – metadata filter (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });
    });

    describe('large dataset — +500 documents', () => {
      beforeAll(async () => {
        await seed(500, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'connector-integration',
          managerSupportedCount: 500,
          groupTag: 'int-large',
          metadataVariant: 'integration',
        });
      }, 120_000);

      it('should cover scenario 4 — large dataset: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S4 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });

      it('should cover scenario 5 — large dataset: search + metadata filter combined', async () => {
        const input = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'connector',
          filters: [{ key: FilterKey.ManagerSupported, value: ['true'] }],
        } as unknown as QueryPublicDocumentsArgs;
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S5 – search + filter (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });
    });
  });

  // =========================================================================
  // OPENAEV SCENARIOS
  // =========================================================================
  describe('openaev scenarios', () => {
    let scenarioServiceInstance: ServiceInstance;

    beforeAll(async () => {
      scenarioServiceInstance = await createTestServiceInstance({
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenaevScenarios,
        serviceDefinitionId:
          '97280ba3-8587-4a3e-87ad-ed279b0e768f' as ServiceDefinitionId,
        slugSuffix: 'openaev-scenarios',
      });
    });

    describe('small dataset — 20 documents', () => {
      beforeAll(async () => {
        await seed(20, {
          serviceInstanceId: scenarioServiceInstance.id,
          documentType: OPENAEV_SCENARIO_DOCUMENT_TYPE,
          namePrefix: 'openaev-scenario',
          groupTag: 'sc-small',
          metadataVariant: 'scenario',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          slug: scenarioServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });

      it('should cover scenario 2 — with search term "openaev"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          slug: scenarioServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'openaev',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });
    });

    describe('large dataset — +500 documents', () => {
      beforeAll(async () => {
        await seed(500, {
          serviceInstanceId: scenarioServiceInstance.id,
          documentType: OPENAEV_SCENARIO_DOCUMENT_TYPE,
          namePrefix: 'openaev-scenario',
          groupTag: 'sc-large',
          metadataVariant: 'scenario',
        });
      }, 120_000);

      it('should cover scenario 3 — large dataset: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          slug: scenarioServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });

      it('should cover scenario 4 — large dataset: search + product_version filter', async () => {
        const input = {
          serviceInstanceId: scenarioServiceInstance.id,
          slug: scenarioServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'openaev',
          filters: [{ key: FilterKey.ProductVersion, value: ['5.2.0'] }],
        } as unknown as QueryPublicDocumentsArgs;
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S4 – search + version filter (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });
    });
  });

  // =========================================================================
  // OPENCTI CUSTOM DASHBOARDS
  // =========================================================================
  describe('opencti custom dashboards', () => {
    let dashboardServiceInstance: ServiceInstance;

    beforeAll(async () => {
      dashboardServiceInstance = await createTestServiceInstance({
        serviceDefinitionIdentifier:
          ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        serviceDefinitionId:
          'e974c9c3-f3c5-4b48-b183-a73ff218dec1' as ServiceDefinitionId,
        slugSuffix: 'opencti-custom-dashboards',
      });
    });

    describe('small dataset — 20 documents', () => {
      beforeAll(async () => {
        await seed(20, {
          serviceInstanceId: dashboardServiceInstance.id,
          documentType: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          namePrefix: 'custom-dashboard',
          groupTag: 'db-small',
          metadataVariant: 'dashboard',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          slug: dashboardServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });

      it('should cover scenario 2 — with search term "dashboard"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          slug: dashboardServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'dashboard',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(30);
      });
    });

    describe('large dataset — +500 documents', () => {
      beforeAll(async () => {
        await seed(500, {
          serviceInstanceId: dashboardServiceInstance.id,
          documentType: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          namePrefix: 'custom-dashboard',
          groupTag: 'db-large',
          metadataVariant: 'dashboard',
        });
      }, 120_000);

      it('should cover scenario 3 — large dataset: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          slug: dashboardServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });

      it('should cover scenario 4 — large dataset: search + product_version filter', async () => {
        const input = {
          serviceInstanceId: dashboardServiceInstance.id,
          slug: dashboardServiceInstance.slug!,
          first: 20,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'dashboard',
          filters: [{ key: FilterKey.ProductVersion, value: ['5.2.0'] }],
        } as unknown as QueryPublicDocumentsArgs;
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S4 – search + version filter (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(50);
      });
    });
  });
});
