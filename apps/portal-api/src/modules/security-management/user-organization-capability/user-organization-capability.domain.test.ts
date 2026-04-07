import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { loadUserOrganizationCapabilities } from './user-organization-capability.domain';

describe('UserOrganizationCapabilityDomain', () => {
  describe('loadUserOrganizationCapabilities', () => {
    it('should return the user capabilities when organization exists', async () => {
      const capabilities = await loadUserOrganizationCapabilities(
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );

      expect(capabilities.length).toBe(1);
      expect(capabilities?.[0]?.name).toBe(
        OrganizationCapability.AdministrateOrganization
      );
    });

    it('should return an empty array when organization does not exist', async () => {
      const organizationId = uuidv4();
      const capabilities =
        await loadUserOrganizationCapabilities(organizationId);

      expect(capabilities.length).toBe(0);
    });
  });
});
