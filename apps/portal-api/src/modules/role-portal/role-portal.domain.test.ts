import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../knexfile';
import { TestUserHelper } from '../../../tests/helper/test.user.helper';
import { loadRolePortalsBySSOGroups } from './role-portal.domain';

describe('loadRolePortalsBySSOGroups', () => {
  beforeEach(async () => {
    // eslint-disable-next-line no-restricted-syntax
    await db('SSOGroup_RolePortal').del();
    await TestUserHelper.rolePortal.delete({});
    await TestUserHelper.rolePortal.create({
      name: 'POTATO_PEELER',
    });
    await TestUserHelper.rolePortal.create({
      name: 'UNICORN_RIDER',
    });
    await TestUserHelper.rolePortal.create({
      name: 'BANANA_INSPECTOR',
    });

    // eslint-disable-next-line no-restricted-syntax
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
