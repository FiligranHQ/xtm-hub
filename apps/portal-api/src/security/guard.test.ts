import { MockInstance } from '@vitest/spy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  contextBypassUser,
  requestContextAdminSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../tests/tests.const';
import { OrganizationCapability } from '../__generated__/resolvers-types';
import { requestContext } from '../context/request.context';
import { ErrorCode } from '../utils/error/error.code';
import * as authHelper from './auth.helper';
import { securityGuard } from './guard';

describe('Security Guard', () => {
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

  describe('assertUserIsAllowedOnOrganization', () => {
    it('should throw a user not in organization error when user is not in organization', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
        isInOrganization: false,
      });

      const call = securityGuard.assertUserIsAllowedOnOrganization(
        contextBypassUser.user,
        {
          organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
          requiredCapability: OrganizationCapability.AdministrateOrganization,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw a missing capability error when user is not in organization', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
        isInOrganization: true,
      });

      const call = securityGuard.assertUserIsAllowedOnOrganization(
        contextBypassUser.user,
        {
          organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
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

      await securityGuard.assertUserIsAllowedOnOrganization(
        contextBypassUser.user,
        {
          organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
          requiredCapability: OrganizationCapability.AdministrateOrganization,
        }
      );
    });

    it('should verify user secondOrga capability based on selected_organization_id', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      await expect(
        securityGuard.assertUserCapabilities([
          OrganizationCapability.AdministrateOrganization,
        ])
      ).resolves.not.toThrow();

      const call = securityGuard.assertUserCapabilities([
        OrganizationCapability.ManagePlatformRegistration,
      ]);
      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should verify user secondOrga capability with specific organization_id', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      await expect(
        securityGuard.assertUserCapabilities(
          [OrganizationCapability.AdministrateOrganization],
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        )
      ).resolves.not.toThrow();
    });
  });
});
