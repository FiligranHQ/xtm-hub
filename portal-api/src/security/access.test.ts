import { describe, expect, it } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { CAPABILITY_BYPASS } from '../portal.const';
import { isUserGranted } from './access';

describe('Access', () => {
  describe('isUserGranted', () => {
    it.each`
      isUserDefined | userCapabilities       | organizationCapabilities                                  | expected | reason
      ${false}      | ${[]}                  | ${[]}                                                     | ${false} | ${'user is not defined'}
      ${true}       | ${[CAPABILITY_BYPASS]} | ${[]}                                                     | ${true}  | ${'user has the bypass capability'}
      ${true}       | ${[]}                  | ${[OrganizationCapabilityName.MANAGE_ACCESS]}             | ${true}  | ${'user has the required capability'}
      ${true}       | ${[]}                  | ${[OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION]} | ${true}  | ${'user is an organization admin'}
      ${true}       | ${[]}                  | ${[]}                                                     | ${false} | ${'user does not have the required capabilities'}
    `(
      'should return $expected when $reason',
      ({
        isUserDefined,
        expected,
        userCapabilities,
        organizationCapabilities,
      }) => {
        const user = isUserDefined
          ? {
              capabilities: userCapabilities,
              selected_org_capabilities: organizationCapabilities,
            }
          : null;
        const result = isUserGranted(
          user as UserLoadUserBy,
          OrganizationCapabilityName.MANAGE_ACCESS
        );

        expect(result).toBe(expected);
      }
    );
  });
});
