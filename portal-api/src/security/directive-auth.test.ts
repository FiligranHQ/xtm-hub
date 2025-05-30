import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { CAPABILITY_BYPASS } from '../portal.const';
import * as AuthHelper from './auth.helper';
import { authDirectives } from './directive-auth';

describe('Auth directives', () => {
  describe('hasCapability', () => {
    it('should allow bypass user', () => {
      const user: UserLoadUserBy = {
        capabilities: [CAPABILITY_BYPASS],
      } as UserLoadUserBy;

      const result = authDirectives.hasCapability(user, [
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

      const result = authDirectives.hasCapability(user, []);

      expect(result).toBeFalsy();
    });

    it('should allow user when he has the right capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [OrganizationCapabilityName.MANAGE_ACCESS],
      } as UserLoadUserBy;

      const result = authDirectives.hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeTruthy();
    });

    it('should not allow user when he does not have right capability', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [],
      } as UserLoadUserBy;

      const result = authDirectives.hasCapability(user, [
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

      const result = authDirectives.hasCapability(user, [
        OrganizationCapabilityName.MANAGE_ACCESS,
      ]);

      expect(result).toBeTruthy();
    });
  });

  describe('hasServiceCapability', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should allow bypass user', async () => {
      const user: UserLoadUserBy = {
        capabilities: [CAPABILITY_BYPASS],
      } as UserLoadUserBy;
      const result = await authDirectives.hasServiceCapability(user, {}, []);

      expect(result).toBeTruthy();
    });

    it('should allow user when he is the organization admin', async () => {
      const user: UserLoadUserBy = {
        capabilities: [],
        selected_org_capabilities: [
          OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION,
        ],
      } as UserLoadUserBy;
      const result = await authDirectives.hasServiceCapability(user, {}, [
        'UPLOAD',
      ]);

      expect(result).toBeTruthy();
    });

    it('should throw an error when service instance id and subscription ids are missing', () => {
      const user: UserLoadUserBy = {
        capabilities: [],
      } as UserLoadUserBy;
      return authDirectives
        .hasServiceCapability(user, {}, ['UPLOAD'])
        .then(() => {
          throw Error('hasServiceCapability should throw an error');
        })
        .catch((error) => {
          expect(
            error.message.includes('Service_id or subscription_id is undefined')
          ).toBeTruthy();
        });
    });

    it('should allow user with the required service capability', async () => {
      vi.spyOn(AuthHelper, 'getCapabilityUser').mockImplementation(
        (): Promise<{ capabilities: string[] }> => {
          return Promise.resolve({ capabilities: ['UPLOAD'] });
        }
      );

      const user: UserLoadUserBy = {
        capabilities: [],
      } as UserLoadUserBy;
      const result = await authDirectives.hasServiceCapability(
        user,
        { service_instance_id: 'fake' },
        ['UPLOAD']
      );

      expect(result).toBeTruthy();
    });

    it('should not allow user when he does not have the required service capability', async () => {
      vi.spyOn(AuthHelper, 'getCapabilityUser').mockImplementation(
        (): Promise<{ capabilities: string[] }> => {
          return Promise.resolve({ capabilities: [] });
        }
      );

      const user: UserLoadUserBy = {
        capabilities: [],
      } as UserLoadUserBy;
      const result = await authDirectives.hasServiceCapability(
        user,
        { service_instance_id: 'fake' },
        ['UPLOAD']
      );

      expect(result).toBeFalsy();
    });
  });
});
