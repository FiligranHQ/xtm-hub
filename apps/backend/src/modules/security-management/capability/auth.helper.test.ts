import { describe, expect, it } from 'vitest';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { CAPABILITY_BYPASS } from '../../../portal.const';
import { isUserAllowed } from './auth.helper';

describe('authHelper', () => {
  describe('isUserAllowed', () => {
    it('should allow user if he has bypass capability', async () => {
      const result = isUserAllowed({
        userCapabilities: [CAPABILITY_BYPASS],
        organizationCapabilities: [],
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      expect(result).toBeTruthy();
    });

    it('should allow user if he has the required capability', async () => {
      const result = isUserAllowed({
        userCapabilities: [],
        organizationCapabilities: [
          OrganizationCapability.ManagePlatformRegistration,
        ],
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      expect(result).toBeTruthy();
    });

    it('should allow user if he has the administrate organization capability', async () => {
      const result = isUserAllowed({
        userCapabilities: [],
        organizationCapabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      expect(result).toBeTruthy();
    });

    it('should not allow user if he does not have the required capabilities', async () => {
      const result = isUserAllowed({
        userCapabilities: [],
        organizationCapabilities: [],
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      expect(result).toBeFalsy();
    });
  });
});
