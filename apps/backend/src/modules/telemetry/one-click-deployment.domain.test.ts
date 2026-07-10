import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { OneClickDeploymentInitializer } from '../../model/kanel/public/OneClickDeployment';
import { OneClickDeploymentDomain } from './one-click-deployment.domain';
import { TelemetryTargetProduct } from './telemetry.const';

const PLATFORM_A = 'platform-a';
const PLATFORM_B = 'platform-b';

const buildRow = (
  overrides: Partial<OneClickDeploymentInitializer> = {}
): OneClickDeploymentInitializer => ({
  resource_id: uuidv4(),
  platform_id: PLATFORM_A,
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
    expect(stored.deployed_at).toEqual(row.deployed_at);
  });

  describe('loadLastDeployed', () => {
    it('filters by platform_id across organizations', async () => {
      const platformARow = buildRow({
        platform_id: PLATFORM_A,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      // Same platform, different triggering org: still belongs to the platform.
      const platformASecondOrgRow = buildRow({
        platform_id: PLATFORM_A,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      const platformBRow = buildRow({ platform_id: PLATFORM_B });
      await OneClickDeploymentDomain.insert(platformARow);
      await OneClickDeploymentDomain.insert(platformASecondOrgRow);
      await OneClickDeploymentDomain.insert(platformBRow);

      const platformARows = await OneClickDeploymentDomain.loadLastDeployed(
        50,
        PLATFORM_A
      );
      expect(platformARows.map((r) => r.resource_id).sort()).toEqual(
        [platformARow.resource_id, platformASecondOrgRow.resource_id].sort()
      );

      const platformBRows = await OneClickDeploymentDomain.loadLastDeployed(
        50,
        PLATFORM_B
      );
      expect(platformBRows.map((r) => r.resource_id)).toEqual([
        platformBRow.resource_id,
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
        1,
        PLATFORM_A
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].resource_id).toBe(newerRow.resource_id);
    });
  });
});
