import { describe, expect, it } from 'vitest';
import { DEFAULT_ADMIN_EMAIL } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { loadUserBy } from './users.domain';

describe('Users domain', () => {
  it('should load user Admin', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response.email).toEqual(DEFAULT_ADMIN_EMAIL);
    expect(response.selected_organization_id).toEqual(
      PLATFORM_ORGANIZATION_UUID
    );
    expect(response.organizations).toHaveLength(2);
  });
});
