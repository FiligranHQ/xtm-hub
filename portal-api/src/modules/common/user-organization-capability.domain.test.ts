import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { loadUserOrganizationCapabilities } from './user-organization-capability.domain';

describe('UserOrganizationCapabilityDomain', () => {
  describe('loadUserOrganizationCapabilities', () => {
    it('should return the user capabilities when organization exists', async () => {
      const capabilities = await loadUserOrganizationCapabilities(
        contextAdminUser,
        PLATFORM_ORGANIZATION_UUID
      );

      expect(capabilities.length).toBe(3);
      const expectedCapabilities = [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
        OrganizationCapability.ManageSubscription,
      ];

      for (const capability of expectedCapabilities) {
        expect(capabilities.some(({ name }) => name === capability));
      }
    });

    it('should return an empty array when organization does not exist', async () => {
      const organizationId = uuidv4();
      const capabilities = await loadUserOrganizationCapabilities(
        contextAdminUser,
        organizationId
      );

      expect(capabilities.length).toBe(0);
    });
  });
});
