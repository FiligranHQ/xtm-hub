import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../knexfile';
import { loadRolePortalsBySSOGroups } from './role-portal.domain';

describe('loadRolePortalsBySSOGroups', () => {
  beforeEach(async () => {
    await db('SSOGroup_RolePortal').del();
    await db('RolePortal').del();
    await db('RolePortal').insert([
      { id: uuidv4(), name: 'POTATO_PEELER' },
      { id: uuidv4(), name: 'UNICORN_RIDER' },
      { id: uuidv4(), name: 'BANANA_INSPECTOR' },
    ]);

    await db('SSOGroup_RolePortal').insert([
      { SSOGroup: 'purple-elephants-club', RolePortal: 'POTATO_PEELER' },
      { SSOGroup: 'flying-pizza-society', RolePortal: 'POTATO_PEELER' },
      { SSOGroup: 'moonlight-dancers', RolePortal: 'UNICORN_RIDER' },
      { SSOGroup: 'coffee-addicts-anonymous', RolePortal: 'BANANA_INSPECTOR' },
    ]);
  });

  it('should return null when user has no SSO group', async () => {
    const result = await loadRolePortalsBySSOGroups([]);

    expect(result?.roles).toBeNull();
  });

  it('should return role when user has a single SSO group', async () => {
    const result = await loadRolePortalsBySSOGroups(['moonlight-dancers']);

    expect(result?.roles).toEqual(['UNICORN_RIDER']);
  });

  it('should avoid duplication when user has multiple SSO groups with same role', async () => {
    const result = await loadRolePortalsBySSOGroups([
      'purple-elephants-club',
      'flying-pizza-society',
    ]);

    expect(result?.roles).toEqual(['POTATO_PEELER']);
    expect(result?.roles).toHaveLength(1);
  });
});
