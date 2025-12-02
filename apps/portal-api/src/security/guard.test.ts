import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  FILIGRAN_ORGA_ID,
  THALES_ORGA_ID,
} from '../../tests/tests.const';
import { OrganizationCapability } from '../__generated__/resolvers-types';
import { ServiceInstanceId } from '../model/kanel/public/ServiceInstance';
import { organizationDomain } from '../modules/organizations/organizations.domain';
import { ErrorCode } from '../utils/error/error.code';
import * as authHelper from './auth.helper';
import { securityGuard } from './guard';

describe('Security Guard', () => {
  let isUserAllowedOnOrganizationSpy: MockInstance;
  let loadOrganizationSubscribedToServiceInstanceSpy: MockInstance;
  beforeEach(() => {
    isUserAllowedOnOrganizationSpy = vi.spyOn(
      authHelper,
      'isUserAllowedOnOrganization'
    );

    loadOrganizationSubscribedToServiceInstanceSpy = vi.spyOn(
      organizationDomain,
      'loadOrganizationSubscribedToServiceInstance'
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('assertUserIsAllowedOnServiceInstance', () => {
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    it('should throw an organization not found error when organization is not subscribed to service instance', async () => {
      loadOrganizationSubscribedToServiceInstanceSpy.mockResolvedValue(null);
      const call = securityGuard.assertUserIsAllowedOnServiceInstance(
        contextAdminUser.user,
        {
          serviceInstanceId,
          requiredCapability: OrganizationCapability.ManagePlatformRegistration,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.OrganizationNotFound);
    });

    it('should throw a missing capability error when user is not authorized on the organization', async () => {
      loadOrganizationSubscribedToServiceInstanceSpy.mockResolvedValue({
        id: FILIGRAN_ORGA_ID,
        name: 'Filigran',
        domains: [],
        personal_space: false,
      });
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
      });

      const call = securityGuard.assertUserIsAllowedOnServiceInstance(
        contextAdminUser.user,
        {
          serviceInstanceId,
          requiredCapability: OrganizationCapability.ManagePlatformRegistration,
        }
      );

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should pass when user has required capability on organization', async () => {
      loadOrganizationSubscribedToServiceInstanceSpy.mockResolvedValue({
        id: FILIGRAN_ORGA_ID,
        name: 'Filigran',
        domains: [],
        personal_space: false,
      });
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: true,
      });

      await securityGuard.assertUserIsAllowedOnServiceInstance(
        contextAdminUser.user,
        {
          serviceInstanceId,
          requiredCapability: OrganizationCapability.ManagePlatformRegistration,
        }
      );
    });
  });
  describe('assertUserIsAllowedOnOrganization', () => {
    it('should throw a user not in organization error when user is not in organization', async () => {
      isUserAllowedOnOrganizationSpy.mockResolvedValue({
        isAllowed: false,
        isInOrganization: false,
      });

      const call = securityGuard.assertUserIsAllowedOnOrganization(
        contextAdminUser.user,
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
        contextAdminUser.user,
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

      await securityGuard.assertUserIsAllowedOnOrganization(
        contextAdminUser.user,
        {
          organizationId: THALES_ORGA_ID,
          requiredCapability: OrganizationCapability.AdministrateOrganization,
        }
      );
    });
  });
});
