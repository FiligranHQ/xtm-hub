import { describe, expect } from 'vitest';
import {
  contextSimpleUserThales,
  DEFAULT_ADMIN_EMAIL,
  THALES_ADMIN_ORGA_EMAIL,
  THALES_ADMIN_ORGA_ID,
} from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { loadUserBy, updateUser } from './users.domain';

//Issue with test
describe('Users domain', () => {
  it.skip('should load user Admin', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response.email).toEqual(DEFAULT_ADMIN_EMAIL);
    expect(response.selected_organization_id).toEqual(
      PLATFORM_ORGANIZATION_UUID
    );
    expect(response.organization_capabilities).toHaveLength(2);
  });

  it('on Simple User using EditUSer should throw error FORBIDDEN_ACCESS', async () => {
    try {
      await updateUser(
        contextSimpleUserThales,
        THALES_ADMIN_ORGA_ID as UserId,
        {
          email: THALES_ADMIN_ORGA_EMAIL,
        }
      );
    } catch (error) {
      expect(error.name).toBe('FORBIDDEN_ACCESS');
    }
  });
});
