import { describe, expect, it } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { CAPABILITY_BYPASS } from '../portal.const';
import { isUserGranted } from './access';

describe('Access', () => {
  describe('isUserGranted', () => {
    it('should return false when user is not defined', () => {
      const result = isUserGranted();

      expect(result).toBeFalsy();
    });

    it('should return true when user has the bypass capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [CAPABILITY_BYPASS],
      } as UserLoadUserBy;
      const result = isUserGranted(
        user,
        OrganizationCapabilityName.MANAGE_ACCESS
      );

      expect(result).toBeTruthy();
    });

    it('should return true when user has the required capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [OrganizationCapabilityName.MANAGE_ACCESS],
      } as UserLoadUserBy;
      const result = isUserGranted(
        user,
        OrganizationCapabilityName.MANAGE_ACCESS
      );

      expect(result).toBeTruthy();
    });

    it('should return true when user is an organization admin', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [
          OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION,
        ],
      } as UserLoadUserBy;
      const result = isUserGranted(
        user,
        OrganizationCapabilityName.MANAGE_ACCESS
      );

      expect(result).toBeTruthy();
    });

    it('should return false when user does not have the required capabilities', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [],
      } as UserLoadUserBy;
      const result = isUserGranted(
        user,
        OrganizationCapabilityName.MANAGE_ACCESS
      );

      expect(result).toBeFalsy();
    });
  });
});
