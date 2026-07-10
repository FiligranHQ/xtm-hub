import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { OneClickDeploymentInitializer } from '../../model/kanel/public/OneClickDeployment';
import { OneClickDeploymentDomain } from './one-click-deployment.domain';
import { TelemetryTargetProduct } from './telemetry.const';

const buildRow = (
  overrides: Partial<OneClickDeploymentInitializer> = {}
): OneClickDeploymentInitializer => ({
  resource_id: uuidv4(),
  platform_id: uuidv4(),
  tenant_id: null,
  user_id: null,
  organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
  target_product: TelemetryTargetProduct.OPEN_CTI,
  deployed_at: new Date('2026-04-16T09:53:20.440Z'),
  ...overrides,
});

describe('oneClickDeploymentDomain', () => {
  beforeEach(async () => {
    await TestHelper.oneClickDeployment.deleteAll();
  });

  it('inserts a deployment row', async () => {
    const row = buildRow();

    await OneClickDeploymentDomain.insert(row);

    const [stored] = await TestHelper.oneClickDeployment.loadAll({
      resource_id: row.resource_id,
    });
    expect(stored).toBeDefined();
    expect(stored.platform_id).toBe(row.platform_id);
    expect(stored.organization_id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
    expect(stored.target_product).toBe(TelemetryTargetProduct.OPEN_CTI);
  });

  describe('loadLastDeployed', () => {
    it('returns deployments scoped to the organization', async () => {
      const row = buildRow({ organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID });
      await OneClickDeploymentDomain.insert(row);
      await OneClickDeploymentDomain.insert(
        buildRow({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        })
      );

      const rows = await OneClickDeploymentDomain.loadLastDeployed(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        50
      );
      expect(rows.map((r) => r.resource_id)).toEqual([row.resource_id]);
    });

    it('filters by product (platform identifier)', async () => {
      const openctiRow = buildRow({
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
      const openaevRow = buildRow({
        target_product: TelemetryTargetProduct.OPEN_AEV,
      });
      await OneClickDeploymentDomain.insert(openctiRow);
      await OneClickDeploymentDomain.insert(openaevRow);

      const openctiRows = await OneClickDeploymentDomain.loadLastDeployed(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        50,
        [PlatformIdentifier.Opencti]
      );
      expect(openctiRows.map((r) => r.resource_id)).toEqual([
        openctiRow.resource_id,
      ]);

      const openaevRows = await OneClickDeploymentDomain.loadLastDeployed(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        50,
        [PlatformIdentifier.Openaev]
      );
      expect(openaevRows.map((r) => r.resource_id)).toEqual([
        openaevRow.resource_id,
      ]);
    });

    it('orders by deployed_at desc and respects the limit', async () => {
      const olderRow = buildRow({
        deployed_at: new Date('2026-01-01T00:00:00.000Z'),
      });
      const newerRow = buildRow({
        deployed_at: new Date('2026-06-01T00:00:00.000Z'),
      });
      await OneClickDeploymentDomain.insert(olderRow);
      await OneClickDeploymentDomain.insert(newerRow);

      const rows = await OneClickDeploymentDomain.loadLastDeployed(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        1
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].resource_id).toBe(newerRow.resource_id);
    });
  });
});
