import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { measureAvgDuration } from '../../../tests/helper/test.helper';
import { SERVICES } from '../../../tests/tests.const';
import {
  DocumentOrdering,
  FilterKey,
  LogicalOperator,
  OrderingMode,
  QueryDocumentsArgs,
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
    maxAvgMs: 5,
  },
  large: {
    datasetSize: 500,
    pageSize: 20,
    maxAvgMs: 30,
  },
};

describePerf('loadDocuments — performance benchmarks', () => {
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
        slugSuffix: 'load-documents-integrations',
      });
    });

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'load-doc-integration',
          managerSupportedCount: small.datasetSize,
          groupTag: 'load-int-small',
          metadataVariant: 'integration',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Integration S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "integration"', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'integration',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Integration S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 3 — with logical filter (manager_supported: true)', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          logicalFilters: {
            operator: LogicalOperator.And,
            children: [
              {
                leaf: {
                  key: FilterKey.ManagerSupported,
                  value: ['true'],
                },
              },
            ],
          },
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Integration S3 – logical filter (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
          serviceInstanceId: integrationServiceInstance.id,
          documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          namePrefix: 'load-doc-integration',
          managerSupportedCount: large.datasetSize,
          groupTag: 'load-int-large',
          metadataVariant: 'integration',
        });
      }, 120_000);

      it('should cover scenario 4 — large dataset: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Integration S4 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });

      it('should cover scenario 5 — large dataset: search term', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: integrationServiceInstance.id,
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'integration',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Integration S5 – search (large): avg=${avgMs.toFixed(2)}ms`
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
        slugSuffix: 'load-documents-openaev-scenarios',
      });
    });

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
          serviceInstanceId: scenarioServiceInstance.id,
          documentType: OPENAEV_SCENARIO_DOCUMENT_TYPE,
          namePrefix: 'load-doc-openaev-scenario',
          groupTag: 'load-sc-small',
          metadataVariant: 'scenario',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Scenario S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "openaev"', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'openaev',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Scenario S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
          serviceInstanceId: scenarioServiceInstance.id,
          documentType: OPENAEV_SCENARIO_DOCUMENT_TYPE,
          namePrefix: 'load-doc-openaev-scenario',
          groupTag: 'load-sc-large',
          metadataVariant: 'scenario',
        });
      }, 120_000);

      it('should cover scenario 3 — large dataset: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: scenarioServiceInstance.id,
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Scenario S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
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
        slugSuffix: 'load-documents-opencti-custom-dashboards',
      });
    });

    describe(`small dataset — ${small.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(small.datasetSize, {
          serviceInstanceId: dashboardServiceInstance.id,
          documentType: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          namePrefix: 'load-doc-custom-dashboard',
          groupTag: 'load-db-small',
          metadataVariant: 'dashboard',
        });
      });

      it('should cover scenario 1 — baseline: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Dashboard S1 – baseline (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });

      it('should cover scenario 2 — with search term "dashboard"', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          first: small.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
          searchTerm: 'dashboard',
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Dashboard S2 – search (small): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(small.maxAvgMs);
      });
    });

    describe(`large dataset — +${large.datasetSize} documents`, () => {
      beforeAll(async () => {
        await seed(large.datasetSize, {
          serviceInstanceId: dashboardServiceInstance.id,
          documentType: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          namePrefix: 'load-doc-custom-dashboard',
          groupTag: 'load-db-large',
          metadataVariant: 'dashboard',
        });
      }, 120_000);

      it('should cover scenario 3 — large dataset: no search, no filters', async () => {
        const input: QueryDocumentsArgs = {
          serviceInstanceId: dashboardServiceInstance.id,
          first: large.pageSize,
          orderBy: DocumentOrdering.CreatedAt,
          orderMode: OrderingMode.Desc,
        };
        const avgMs = await measureAvgDuration(() =>
          DocumentApp.loadDocuments(input)
        );
        logApp.info(
          `[perf] loadDocuments Dashboard S3 – baseline (large): avg=${avgMs.toFixed(2)}ms`
        );
        expect(avgMs).toBeLessThan(large.maxAvgMs);
      });
    });
  });
});
