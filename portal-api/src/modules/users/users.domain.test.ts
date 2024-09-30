import { describe, expect, it } from 'vitest';
import { loadUserBy } from './users.domain';
import { UserId } from '../../model/kanel/public/User';

describe('Users domain', () => {
  it('should be logged user', async () => {
    const response = await loadUserBy({
      'User.id': 'e389e507-f1cd-4f2f-bfb2-274140d87d28' as UserId,
    });
    expect(response).toBeTruthy();
  });
});
