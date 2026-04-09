import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CAPABILITY_MODIFY_TRIALS,
  CAPABILITY_READ_TRIALS,
} from '../../../tests/tests.const';

import {
  OrganizationCapability,
  PortalCapability,
} from '../../__generated__/resolvers-types';
import { UserLoadUserBy } from '../../model/user';
import { CAPABILITY_BYPASS } from '../../portal.const';
import * as AuthHelper from '../../modules/security-management/capability/auth.helper';
import { authDirectives } from './directive-auth';
import { RoleType } from './directive.model';

describe('Auth directives', () => {
  describe('isAuthenticated', () => {
    it('should return false if user is disabled', () => {
      const user = {
        disabled: true,
      } as UserLoadUserBy;

      const result = authDirectives.isAuthenticated(user);

      expect(result).toBe(false);
    });
  });

  describe('hasCapability', () => {
    it.each`
      description                                                                   | expected | isUserAdmin | userHasManageAccess | userHasReadTrials | userHasModifyTrials | areOrgaCapaRequired | arePortalCapaRequired | isUserBypass
      ${'allow bypass user'}                                                        | ${true}  | ${false}    | ${false}            | ${false}          | ${false}            | ${true}             | ${false}              | ${true}
      ${'allow user when there is no required capability and he is not disabled'}   | ${true}  | ${false}    | ${false}            | ${false}          | ${false}            | ${false}            | ${false}              | ${false}
      ${'allow user when he has the right orga capability'}                         | ${true}  | ${false}    | ${true}             | ${false}          | ${false}            | ${true}             | ${false}              | ${false}
      ${'not allow user when he does not have right orga capability'}               | ${false} | ${false}    | ${false}            | ${false}          | ${false}            | ${true}             | ${false}              | ${false}
      ${'not allow user is the organization admin but capability is not mentioned'} | ${false} | ${true}     | ${false}            | ${false}          | ${false}            | ${true}             | ${false}              | ${false}
      ${'allow user when he has the right portal capability'}                       | ${true}  | ${false}    | ${false}            | ${true}           | ${false}            | ${false}            | ${true}               | ${false}
      ${'not allow user when he does not have the right portal capability'}         | ${false} | ${false}    | ${false}            | ${false}          | ${true}             | ${false}            | ${true}               | ${false}
    `(
      'should $description',
      ({
        isUserBypass,
        expected,
        isUserAdmin,
        userHasManageAccess,
        userHasReadTrials,
        userHasModifyTrials,
        areOrgaCapaRequired,
        arePortalCapaRequired,
      }) => {
        const capabilities = isUserBypass ? [CAPABILITY_BYPASS] : [];
        if (userHasReadTrials) capabilities.push(CAPABILITY_READ_TRIALS);
        if (userHasModifyTrials) capabilities.push(CAPABILITY_MODIFY_TRIALS);
        const organizationCapabilities = [];
        if (isUserAdmin) {
          organizationCapabilities.push(
            OrganizationCapability.AdministrateOrganization
          );
        }
        if (userHasManageAccess) {
          organizationCapabilities.push(OrganizationCapability.ManageAccess);
        }

        const user = {
          capabilities,
          selected_org_capabilities: organizationCapabilities,
          disabled: false,
        } as UserLoadUserBy;

        const requiredCapabilities = {
          [RoleType.ORGA]: areOrgaCapaRequired
            ? [OrganizationCapability.ManageAccess]
            : [],
          [RoleType.PORTAL]: arePortalCapaRequired
            ? [PortalCapability.ReadTrials]
            : [],
        };

        const result = authDirectives.hasCapability(user, requiredCapabilities);

        expect(result).toBe(expected);
      }
    );
  });

  describe('hasServiceCapability', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each`
      description                                             | expected | expectedError                                                                                                | isUserBypass | isUserOrganizationAdmin | areIdsMissing | hasRequiredCapabilities
      ${'allow bypass user'}                                  | ${true}  | ${null}                                                                                                      | ${true}      | ${false}                | ${false}      | ${false}
      ${'not allow user when he is the organization admin'}   | ${false} | ${null}                                                                                                      | ${false}     | ${true}                 | ${false}      | ${false}
      ${'throw an error when ids are missing'}                | ${false} | ${'serviceInstanceId, service_instance_id, or subscription_id is required for service capability directive'} | ${false}     | ${false}                | ${true}       | ${false}
      ${'allow user with the required service capability'}    | ${true}  | ${null}                                                                                                      | ${false}     | ${false}                | ${false}      | ${true}
      ${'not allow user without required service capability'} | ${false} | ${null}                                                                                                      | ${false}     | ${false}                | ${false}      | ${false}
    `(
      'should $description',
      async ({
        expected,
        isUserBypass,
        isUserOrganizationAdmin,
        areIdsMissing,
        hasRequiredCapabilities,
        expectedError,
      }) => {
        vi.spyOn(AuthHelper, 'getCapabilityUser').mockImplementation(
          (): Promise<{ capabilities: string[] }> => {
            if (hasRequiredCapabilities) {
              return Promise.resolve({ capabilities: ['UPLOAD'] });
            }

            return Promise.resolve({ capabilities: [] });
          }
        );

        const capabilities = isUserBypass ? [CAPABILITY_BYPASS] : [];
        const selected_org_capabilities = isUserOrganizationAdmin
          ? [OrganizationCapability.AdministrateOrganization]
          : [];
        const user: UserLoadUserBy = {
          capabilities,
          selected_org_capabilities,
        } as UserLoadUserBy;
        const input = areIdsMissing ? {} : { service_instance_id: 'fake' };
        const call = authDirectives.hasServiceCapability(user, input, [
          'UPLOAD',
        ]);

        if (expectedError) {
          await expect(call).rejects.toThrow(expectedError);
        } else {
          const result = await call;
          expect(result).toBe(expected);
        }
      }
    );
  });
});
