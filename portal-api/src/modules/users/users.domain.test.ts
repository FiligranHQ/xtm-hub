import { describe, expect, it } from 'vitest';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { loadUserBy } from './users.domain';

describe('Users domain', () => {
  it('should load user Admin', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response.email).toEqual('admin@filigran.io');
    expect(response.selected_organization_id).toEqual(
      PLATFORM_ORGANIZATION_UUID
    );
    expect(response.organizations).toHaveLength(2);
  });
});
