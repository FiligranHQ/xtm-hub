import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { OneClickDeploymentInitializer } from '../../model/kanel/public/OneClickDeployment';
import { OneClickDeploymentDomain } from './one-click-deployment.domain';

const buildRow = (
  overrides: Partial<OneClickDeploymentInitializer> = {}
): OneClickDeploymentInitializer => ({
  resource_id: uuidv4(),
  platform_id: uuidv4(),
  tenant_id: null,
  user_id: null,
  deployed_at: new Date('2026-04-16T09:53:20.440Z'),
  ...overrides,
});

describe('oneClickDeploymentDomain', () => {
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

  it('persists tenant_id and user_id when provided', async () => {
    const tenantId = uuidv4();
    const userId = uuidv4();
    const row = buildRow({ tenant_id: tenantId, user_id: userId });

    await OneClickDeploymentDomain.insert(row);

    const [stored] = await TestHelper.oneClickDeployment.loadAll({
      resource_id: row.resource_id,
    });
    expect(stored.tenant_id).toBe(tenantId);
    expect(stored.user_id).toBe(userId);
  });
});
