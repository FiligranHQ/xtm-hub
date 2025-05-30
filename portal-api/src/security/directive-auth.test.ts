import { describe, expect, it } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { CAPABILITY_BYPASS } from '../portal.const';
import { hasCapability } from './directive-auth';

describe('Auth directives', () => {
  describe('hasCapability', () => {
    it('should allow bypass user', () => {
      const user: UserLoadUserBy = {
        capabilities: [CAPABILITY_BYPASS],
      } as UserLoadUserBy;

      const result = hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeTruthy();
    });

    it('should allow user when there is no required capability and he is not disabled', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        disabled: true,
        selected_org_capabilities: [OrganizationCapabilityName.MANAGE_ACCESS],
      } as UserLoadUserBy;

      const result = hasCapability(user, []);

      expect(result).toBeFalsy();
    });

    it('should allow user when he has the right capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [OrganizationCapabilityName.MANAGE_ACCESS],
      } as UserLoadUserBy;

      const result = hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeTruthy();
    });

    it('should not allow user when he does not have right capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [],
      } as UserLoadUserBy;

      const result = hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeFalsy();
    });

    it('should allow user when he is the organization admin', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [
          OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION,
        ],
      } as UserLoadUserBy;

      const result = hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeTruthy();
    });
  });
});
