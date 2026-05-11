import { Management } from 'auth0';
import { describe, expect, it } from 'vitest';
import { buildUserMetadataUpdate, removeEmptyGroups } from './auth0.util';
import { Auth0UpdateUserRBACInstance } from './client';

describe('removeEmptyGroups', () => {
  it('should remove entries with empty groups arrays', () => {
    const input: Auth0UpdateUserRBACInstance = {
      user1: { groups: ['admin', 'user'] },
      user2: { groups: [] },
      user3: { groups: ['viewer'] },
      user4: { groups: [] },
    };

    const expected: Auth0UpdateUserRBACInstance = {
      user1: { groups: ['admin', 'user'] },
      user3: { groups: ['viewer'] },
    };

    const result = removeEmptyGroups(input);
    expect(result).toEqual(expected);
  });

  it('should return empty object when all groups are empty', () => {
    const input: Auth0UpdateUserRBACInstance = {
      user1: { groups: [] },
      user2: { groups: [] },
      user3: { groups: [] },
    };

    const result = removeEmptyGroups(input);
    expect(result).toEqual({});
  });

  it('should keep all entries when no groups are empty', () => {
    const input: Auth0UpdateUserRBACInstance = {
      user1: { groups: ['admin'] },
      user2: { groups: ['user', 'viewer'] },
      user3: { groups: ['moderator'] },
    };

    const result = removeEmptyGroups(input);
    expect(result).toEqual(input);
  });

  it('should handle empty input object', () => {
    const input: Auth0UpdateUserRBACInstance = {};

    const result = removeEmptyGroups(input);
    expect(result).toEqual({});
  });

  it('should handle single entry with empty groups', () => {
    const input: Auth0UpdateUserRBACInstance = {
      user1: { groups: [] },
    };

    const result = removeEmptyGroups(input);
    expect(result).toEqual({});
  });
  it('should not crash for any value and still filter correctly', () => {
    const input = {
      user1: { groups: ['admin'] },
      user2: { groups: 'not-an-array' },
      user3: { groups: true },
      user4: { groups: { someObject: true } },
      user5: { groups: 123 },
      user6: { groups: ['viewer'] },
    } as unknown as Auth0UpdateUserRBACInstance;

    const expected: Auth0UpdateUserRBACInstance = {
      user1: { groups: ['admin'] },
      user6: { groups: ['viewer'] },
    };

    // Should not throw an error
    expect(() => removeEmptyGroups(input)).not.toThrow();

    // Should filter out non-array groups
    const result = removeEmptyGroups(input);
    expect(result).toEqual(expected);
  });
});

describe('buildUserMetadataUpdate', () => {
  it('should merge rbac_instance correctly', () => {
    const auth0_user = {
      user_id: 'auth0|123',
      user_metadata: {
        company_name: 'Filigran',
        country: 'France',
        rbac_instance: {
          platform_1: { groups: ['User'] },
        },
      },
    } as unknown as Management.UserResponseSchema;

    const userRBACInstance = {
      platform_2: { groups: ['Admin'] },
    };

    const result = buildUserMetadataUpdate(auth0_user, userRBACInstance);

    expect(result).toEqual({
      user_metadata: {
        company_name: 'Filigran',
        country: 'France',
        rbac_instance: {
          platform_1: { groups: ['User'] },
          platform_2: { groups: ['Admin'] },
        },
      },
    });
  });
  it('should init rbac_instance correctly', () => {
    const auth0_user = {
      user_id: 'auth0|123',
      user_metadata: {},
    } as Management.UserResponseSchema;

    const userRBACInstance = {
      platform_2: { groups: ['Admin'] },
    };

    const result = buildUserMetadataUpdate(auth0_user, userRBACInstance);

    expect(result).toEqual({
      user_metadata: {
        rbac_instance: {
          platform_2: { groups: ['Admin'] },
        },
      },
    });
  });
});
