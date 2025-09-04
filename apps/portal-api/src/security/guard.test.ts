import { MockInstance } from '@vitest/spy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextAdminUser, THALES_ORGA_ID } from '../../tests/tests.const';
import { OrganizationCapability } from '../__generated__/resolvers-types';
import { ErrorCode } from '../modules/common/error-code';
import * as authHelper from './auth.helper';
import { securityGuard } from './guard';

describe('Security Guard', () => {
  describe('assertUserIsAllowedOnOrganization', () => {
    let isUserAllowedOnOrganizationSpy: MockInstance;

    beforeEach(() => {
      isUserAllowedOnOrganizationSpy = vi.spyOn(
        authHelper,
        'isUserAllowedOnOrganization'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw a user not in organization error when user is not in organization', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
        isInOrganization: false,
      });

      const call = securityGuard.assertUserIsAllowedOnOrganization(
        contextAdminUser,
        {
          organizationId: THALES_ORGA_ID,
          requiredCapability: OrganizationCapability.AdministrateOrganization,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw a missing capaibility error when user is not in organization', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
        isInOrganization: true,
      });

      const call = securityGuard.assertUserIsAllowedOnOrganization(
        contextAdminUser,
        {
          organizationId: THALES_ORGA_ID,
          requiredCapability: OrganizationCapability.AdministrateOrganization,
        }
      );

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should not throw an error when user is allowed', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: true,
      });

      await securityGuard.assertUserIsAllowedOnOrganization(contextAdminUser, {
        organizationId: THALES_ORGA_ID,
        requiredCapability: OrganizationCapability.AdministrateOrganization,
      });
    });
  });
});
