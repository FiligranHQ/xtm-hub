import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { OneClickDeploymentInitializer } from '../../model/kanel/public/OneClickDeployment';
import { OneClickDeploymentDomain } from './one-click-deployment.domain';

const PLATFORM_A = 'platform-a';
const PLATFORM_B = 'platform-b';

const buildRow = (
  overrides: Partial<OneClickDeploymentInitializer> = {}
): OneClickDeploymentInitializer => ({
  resource_id: uuidv4(),
  platform_id: PLATFORM_A,
  tenant_id: null,
  user_id: null,
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
    expect(stored.deployed_at).toEqual(row.deployed_at);
  });

  describe('loadOneClickDeployments', () => {
    it('filters by platform_id', async () => {
      const platformARow = await TestHelper.oneClickDeployment.insert(
        buildRow({ platform_id: PLATFORM_A })
      );
      await TestHelper.oneClickDeployment.insert(
        buildRow({ platform_id: PLATFORM_B })
      );

      const rows = await OneClickDeploymentDomain.loadOneClickDeployments({
        filter: { platform_id: PLATFORM_A },
      });

      expect(rows.map((r) => r.resource_id)).toEqual([
        platformARow.resource_id,
      ]);
    });

    it('orders by deployed_at desc and respects the limit', async () => {
      await TestHelper.oneClickDeployment.insert(
        buildRow({ deployed_at: new Date('2026-01-01T00:00:00.000Z') })
      );
      const newerRow = await TestHelper.oneClickDeployment.insert(
        buildRow({ deployed_at: new Date('2026-06-01T00:00:00.000Z') })
      );

      const rows = await OneClickDeploymentDomain.loadOneClickDeployments({
        filter: { platform_id: PLATFORM_A },
        limit: 1,
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].resource_id).toBe(newerRow.resource_id);
    });
  });
});
