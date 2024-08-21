import { describe } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { createNewUserFromInvitation } from './users.helper';
import { OrganizationId } from '../../model/kanel/public/Organization';

describe('User helpers - createNewUserFromInvitation', async () => {
  it.skip('should be add new RolePortal', async () => {
    await createNewUserFromInvitation(
      `${uuidv4()}@test.fr`,
      'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId
    );
  });
});
