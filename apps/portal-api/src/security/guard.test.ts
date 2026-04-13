import { MockInstance } from '@vitest/spy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CAPABILITY_MODIFY_TRIALS,
  // eslint-disable-next-line no-restricted-imports
  contextBypassUser,
  requestContextAdminSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../tests/tests.const';
import {
  OrganizationCapability,
  PortalCapability,
} from '../__generated__/resolvers-types';
import { requestContext } from '../context/request.context';
import * as authHelper from '../modules/security-management/capability/auth.helper';
import { ErrorCode } from '../utils/error/error.code';
import { securityGuard } from './guard';

describe('security Guard', () => {
  let isUserAllowedOnOrganizationSpy: MockInstance;
  beforeEach(() => {
    isUserAllowedOnOrganizationSpy = vi.spyOn(
      authHelper,
      'isUserAllowedOnOrganization'
    );
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

    it('should not throw when user has bypass capability for portal capability checks', async () => {
      requestContext.set({
        user: contextBypassUser.user,
        portalContext: contextBypassUser,
      });

      await expect(
        securityGuard.assertUserPortalCapabilities([
          PortalCapability.ManageDeployment,
        ])
      ).resolves.not.toThrow();
    });

    it('should throw when user does not have required portal capability', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const call = securityGuard.assertUserPortalCapabilities([
        PortalCapability.ManageDeployment,
      ]);

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should not throw when user has one required portal capability', async () => {
      requestContext.set({
        ...requestContextAdminSecondOrga,
        user: {
          ...requestContextAdminSecondOrga.user,
          capabilities: [CAPABILITY_MODIFY_TRIALS],
        },
      });

      await expect(
        securityGuard.assertUserPortalCapabilities([
          PortalCapability.ModifyTrials,
          PortalCapability.ManageDeployment,
        ])
      ).resolves.not.toThrow();
    });
  });
});
