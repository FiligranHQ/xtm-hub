import { describe, expect, it } from 'vitest';
import { loadUserBy } from './users.domain';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID } from '../../portal.const';

describe('Users domain', () => {
  it('should be logged user', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response).toBeTruthy();
  });
});
