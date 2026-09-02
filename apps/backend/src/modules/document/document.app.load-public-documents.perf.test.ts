import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { measureAvgDuration } from '../../../tests/helper/test.helper';
import { SERVICES } from '../../../tests/tests.const';
import {
  DocumentOrdering,
  FilterKey,
  OrderingMode,
  QueryPublicDocumentsArgs,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import ServiceInstance from '../../model/kanel/public/ServiceInstance';
import { logApp } from '../../utils/app-logger.util';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../shareable-resource/opencti/integration/integration.model';
import { DocumentApp } from './document.app';
import {
  PerfAssertions,
  createPerfSuiteHelpers,
  describePerf,
} from './document.app.perf.shared';

const PERF_ASSERTIONS: PerfAssertions = {
  small: {
    datasetSize: 20,
    pageSize: 20,
    maxAvgMs: 30,
  },
  large: {
    datasetSize: 500,
    pageSize: 20,
    maxAvgMs: 50,
  },
};

describePerf('loadPublicDocuments — performance benchmarks', () => {
  const { createTestServiceInstance, seed, cleanup } = createPerfSuiteHelpers();
  const { small, large } = PERF_ASSERTIONS;

  afterAll(async () => {
    await cleanup();
  });

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

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'connector-integration',
          managerSupportedCount: small.datasetSize,
          groupTag: 'int-small',
          metadataVariant: 'integration',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "connector"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: small.pageSize,
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
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 3 — with metadata filter (manager_supported: true)', async () => {
        const input = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: small.pageSize,
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
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'connector-integration',
          managerSupportedCount: large.datasetSize,
          groupTag: 'int-large',
          metadataVariant: 'integration',
        });
      }, 120_000);

      it('should cover scenario 4 — large dataset: no search, no filters', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Integration S4 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });

      it('should cover scenario 5 — large dataset: search + metadata filter combined', async () => {
        const input = {
          serviceInstanceId: integrationServiceInstance.id,
          slug: integrationServiceInstance.slug!,
          first: large.pageSize,
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
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });
    });
  });

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

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
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
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "openaev"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          slug: scenarioServiceInstance.slug!,
          first: small.pageSize,
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
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
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
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Scenario S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });
    });
  });

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

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
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
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "dashboard"', async () => {
        const input: QueryPublicDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          slug: dashboardServiceInstance.slug!,
          first: small.pageSize,
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
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
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
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadPublicDocuments(input)
        );
        logApp.info(
          `[perf] Dashboard S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });
    });
  });
});
