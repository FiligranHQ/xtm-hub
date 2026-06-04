import { describe, expect, it } from 'vitest';
import { buildContext, getUserKey, type CopilotUser } from './copilot.utils';

const baseUser: CopilotUser = {
  id: 'user-1',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@filigran.io',
  organizations: [
    { id: 'org-1', name: 'Filigran', personal_space: false },
    { id: 'org-2', name: 'Personal', personal_space: true },
  ],
  selected_organization_id: 'org-1',
};

describe('getUserKey', () => {
  it.each`
    user                                                  | expected             | description
    ${null}                                               | ${'anonymous'}       | ${'null user'}
    ${undefined}                                          | ${'anonymous'}       | ${'undefined user'}
    ${{ ...baseUser }}                                    | ${'user-1-Jane-Doe'} | ${'full user'}
    ${{ ...baseUser, id: null }}                          | ${'no-id-Jane-Doe'}  | ${'missing id'}
    ${{ ...baseUser, first_name: null, last_name: null }} | ${'user-1--'}        | ${'missing names'}
  `('returns "$expected" for $description', ({ user, expected }) => {
    expect(getUserKey(user)).toBe(expected);
  });
});

describe('buildContext', () => {
  describe('anonymous (no user)', () => {
    it.each`
      user         | description
      ${null}      | ${'null'}
      ${undefined} | ${'undefined'}
    `('sets anonymous defaults when user is $description', ({ user }) => {
      const result = JSON.parse(buildContext(user, '/app/services'));
      expect(result).toEqual({
        product: 'XTM Hub',
        page: '/app/services',
        username: 'Anonymous User',
        organization: 'Unknown',
      });
    });

    it('falls back to "/" when pathname is empty', () => {
      const result = JSON.parse(buildContext(null, ''));
      expect(result.page).toBe('/');
    });
  });

  describe('authenticated user', () => {
    it('includes user identity fields', () => {
      const result = JSON.parse(buildContext(baseUser, '/app/dashboard'));
      expect(result).toEqual({
        product: 'XTM Hub',
        page: '/app/dashboard',
        username: 'Jane Doe',
        email: 'jane.doe@filigran.io',
        organization: 'Filigran',
        isPersonalSpace: 'false',
      });
    });

    it('detects personal space', () => {
      const result = JSON.parse(
        buildContext({ ...baseUser, selected_organization_id: 'org-2' }, '/')
      );
      expect(result.isPersonalSpace).toBe('true');
      expect(result.organization).toBe('Personal');
    });

    it('falls back to "Unknown" when selected org is not found', () => {
      const result = JSON.parse(
        buildContext({ ...baseUser, selected_organization_id: 'org-999' }, '/')
      );
      expect(result.organization).toBe('Unknown');
      expect(result.isPersonalSpace).toBe('false');
    });

    it.each`
      first_name | last_name | expected      | description
      ${'Jane'}  | ${'Doe'}  | ${'Jane Doe'} | ${'both names'}
      ${'Jane'}  | ${null}   | ${'Jane'}     | ${'last name null'}
      ${null}    | ${'Doe'}  | ${'Doe'}      | ${'first name null'}
      ${null}    | ${null}   | ${'Unknown'}  | ${'both null'}
      ${''}      | ${''}     | ${'Unknown'}  | ${'both empty'}
    `(
      'formats username as "$expected" when $description',
      ({ first_name, last_name, expected }) => {
        const result = JSON.parse(
          buildContext({ ...baseUser, first_name, last_name }, '/')
        );
        expect(result.username).toBe(expected);
      }
    );
  });
});
