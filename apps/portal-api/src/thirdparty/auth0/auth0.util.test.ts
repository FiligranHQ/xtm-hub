import { describe, expect, it } from 'vitest';
import { removeEmptyGroups } from './auth0.util';
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
});
