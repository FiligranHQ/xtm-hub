import { describe, expect, it } from 'vitest';
import { calculateShouldEditCapabilities } from './service_capability.helper';

describe('willManageAccessBeConserved', () => {
  it.each`
    isCurrentUserManageAccess | capabilities         | manageAccessCount | expected
    ${true}                   | ${[]}                | ${2}              | ${true}
    ${false}                  | ${[]}                | ${2}              | ${true}
    ${true}                   | ${['MANAGE_ACCESS']} | ${2}              | ${true}
    ${false}                  | ${['MANAGE_ACCESS']} | ${2}              | ${true}
    ${true}                   | ${['MANAGE_ACCESS']} | ${1}              | ${true}
    ${false}                  | ${['MANAGE_ACCESS']} | ${1}              | ${true}
    ${true}                   | ${[]}                | ${1}              | ${false}
  `(
    'Should return $expected if isCurrentUserManageAccess $isCurrentUserManageAccess, capabilities, $capabilities and manageAccessCount is $manageAccessCount',
    async ({
      isCurrentUserManageAccess,
      capabilities,
      manageAccessCount,
      expected,
    }) => {
      const result = calculateShouldEditCapabilities(
        isCurrentUserManageAccess,
        capabilities,
        manageAccessCount
      );
      expect(result).toEqual(expected);
    }
  );
});
