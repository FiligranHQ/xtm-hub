import { describe, expect } from 'vitest';
import { DEFAULT_ADMIN_EMAIL } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { loadUserBy } from './users.domain';

//Issue with test
describe.skip('Users domain', () => {
  it('should load user Admin', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response.email).toEqual(DEFAULT_ADMIN_EMAIL);
    expect(response.selected_organization_id).toEqual(
      PLATFORM_ORGANIZATION_UUID
    );
    expect(response.organization_capabilities).toHaveLength(2);
  });
});
