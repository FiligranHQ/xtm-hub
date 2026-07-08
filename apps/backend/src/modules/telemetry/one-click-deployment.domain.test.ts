import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { OneClickDeploymentInitializer } from '../../model/kanel/public/OneClickDeployment';
import { OneClickDeploymentDomain } from './one-click-deployment.domain';

const buildRow = (
  overrides: Partial<OneClickDeploymentInitializer> = {}
): OneClickDeploymentInitializer => ({
  source_event_id: uuidv4(),
  resource_id: uuidv4(),
  platform_id: uuidv4(),
  target_product: 'open-cti',
  service: 'integrations_library',
  ...overrides,
});

const rowsFor = (sourceEventId: string) =>
  TestHelper.oneClickDeployment.loadAll({ source_event_id: sourceEventId });

describe('oneClickDeploymentDomain', () => {
  it('inserts a deployment row', async () => {
    const row = buildRow();

    await OneClickDeploymentDomain.insert(row);

    const [stored] = await rowsFor(row.source_event_id as string);
    expect(stored).toBeDefined();
    expect(stored.resource_id).toBe(row.resource_id);
    expect(stored.target_product).toBe('open-cti');
  });

  it('is idempotent on source_event_id (onConflict ignore)', async () => {
    const sourceEventId = uuidv4();

    await OneClickDeploymentDomain.insert(
      buildRow({ source_event_id: sourceEventId, resource_id: 'first' })
    );
    await OneClickDeploymentDomain.insert(
      buildRow({ source_event_id: sourceEventId, resource_id: 'second' })
    );

    const rows = await rowsFor(sourceEventId);
    expect(rows).toHaveLength(1);
    expect(rows[0].resource_id).toBe('first');
  });

  it('insertMany persists a batch and dedupes on conflict when replayed', async () => {
    const sharedId = uuidv4();

    await OneClickDeploymentDomain.insertMany([
      buildRow({ source_event_id: sharedId }),
      buildRow(),
    ]);
    await OneClickDeploymentDomain.insertMany([
      buildRow({ source_event_id: sharedId }),
    ]);

    const rows = await rowsFor(sharedId);
    expect(rows).toHaveLength(1);
  });

  it('insertMany with an empty array is a no-op', async () => {
    await expect(
      OneClickDeploymentDomain.insertMany([])
    ).resolves.toBeUndefined();
  });
});
