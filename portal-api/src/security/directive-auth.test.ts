import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { CAPABILITY_BYPASS } from '../portal.const';
import * as AuthHelper from './auth.helper';
import { authDirectives } from './directive-auth';

describe('Auth directives', () => {
  describe('hasCapability', () => {
    it.each`
      description                                                                   | expected | isUserAdmin | userHasManageAccess | areCapabilitiesRequired | isUserBypass
      ${'allow bypass user'}                                                        | ${true}  | ${false}    | ${false}            | ${true}                 | ${true}
      ${'allow user when there is no required capability and he is not disabled'}   | ${true}  | ${false}    | ${false}            | ${false}                | ${false}
      ${'allow user when he has the right capability'}                              | ${true}  | ${false}    | ${true}             | ${true}                 | ${false}
      ${'not allow user when he does not have right capability'}                    | ${false} | ${false}    | ${false}            | ${true}                 | ${false}
      ${'not allow user is the organization admin but capability is not mentioned'} | ${false} | ${true}     | ${false}            | ${true}                 | ${false}
    `(
      'should $description',
      ({
        isUserBypass,
        expected,
        isUserAdmin,
        userHasManageAccess,
        areCapabilitiesRequired,
      }) => {
        const capabilities = isUserBypass ? [CAPABILITY_BYPASS] : [];
        const organizationCapabilities = [];
        if (isUserAdmin) {
          organizationCapabilities.push(
            OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION
          );
        }
        if (userHasManageAccess) {
          organizationCapabilities.push(
            OrganizationCapabilityName.MANAGE_ACCESS
          );
        }

        const user = {
          capabilities,
          selected_org_capabilities: organizationCapabilities,
          disabled: false,
        } as UserLoadUserBy;

        const requiredCapabilities = areCapabilitiesRequired
          ? [OrganizationCapabilityName.MANAGE_ACCESS]
          : [];

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
      description                                             | expected | expectedError                                                                                                                   | isUserBypass | isUserOrganizationAdmin | areIdsMissing | hasRequiredCapabilities
      ${'allow bypass user'}                                  | ${true}  | ${null}                                                                                                                         | ${true}      | ${false}                | ${false}      | ${false}
      ${'not allow user when he is the organization admin'}   | ${false} | ${null}                                                                                                                         | ${false}     | ${true}                 | ${false}      | ${false}
      ${'throw an error when ids are missing'}                | ${false} | ${'serviceInstanceId or service_instance_id or subscription_id is undefined, please provide one of them to use this directive'} | ${false}     | ${false}                | ${true}       | ${false}
      ${'allow user with the required service capability'}    | ${true}  | ${null}                                                                                                                         | ${false}     | ${false}                | ${false}      | ${true}
      ${'not allow user without required service capability'} | ${false} | ${null}                                                                                                                         | ${false}     | ${false}                | ${false}      | ${false}
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
          ? [OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION]
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
