import {
  computeMixedRoleDefaults,
  formatEmailList,
  UserPlatformGroups,
} from '@/components/service/bundle/manage-trial/manage-trial.utils';
import { PlatformIdentifier, ServiceGroupName } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('formatEmailList', () => {
  it.each([
    { emails: [], maxVisible: 3, expected: { visible: '', hiddenCount: 0 } },
    {
      emails: ['a@filigran.io'],
      maxVisible: 3,
      expected: { visible: 'a@filigran.io', hiddenCount: 0 },
    },
    {
      emails: ['a@filigran.io', 'b@filigran.io', 'c@filigran.io'],
      maxVisible: 3,
      expected: {
        visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
        hiddenCount: 0,
      },
    },
    {
      emails: [
        'a@filigran.io',
        'b@filigran.io',
        'c@filigran.io',
        'd@filigran.io',
        'e@filigran.io',
      ],
      maxVisible: 3,
      expected: {
        visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
        hiddenCount: 2,
      },
    },
    {
      emails: ['a@filigran.io', 'b@filigran.io'],
      maxVisible: 1,
      expected: { visible: 'a@filigran.io', hiddenCount: 1 },
    },
  ])(
    'returns $expected for $emails.length emails with maxVisible=$maxVisible',
    ({ emails, maxVisible, expected }) => {
      expect(formatEmailList(emails, maxVisible)).toEqual(expected);
    }
  );

  it('defaults maxVisible to 3 when not provided', () => {
    const emails = [
      'a@filigran.io',
      'b@filigran.io',
      'c@filigran.io',
      'd@filigran.io',
    ];

    expect(formatEmailList(emails)).toEqual({
      visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
      hiddenCount: 1,
    });
  });
});

describe('computeMixedRoleDefaults', () => {
  const rolePanels = [
    {
      platform: PlatformIdentifier.Opencti,
      roles: [
        ServiceGroupName.Admin,
        ServiceGroupName.Analyst,
        ServiceGroupName.Reader,
      ],
    },
    {
      platform: PlatformIdentifier.Xtmone,
      roles: [ServiceGroupName.Admin, ServiceGroupName.User],
      defaultRole: ServiceGroupName.User,
    },
  ];

  const userA: UserPlatformGroups = {
    id: 'user-a',
    groups: [
      {
        platformIdentifier: PlatformIdentifier.Opencti,
        name: ServiceGroupName.Admin,
      },
      {
        platformIdentifier: PlatformIdentifier.Xtmone,
        name: ServiceGroupName.User,
      },
    ],
  };
  const userB: UserPlatformGroups = {
    id: 'user-b',
    groups: [
      {
        platformIdentifier: PlatformIdentifier.Opencti,
        name: ServiceGroupName.Reader,
      },
      {
        platformIdentifier: PlatformIdentifier.Xtmone,
        name: ServiceGroupName.User,
      },
    ],
  };
  const userWithAdminXtmOne: UserPlatformGroups = {
    id: 'user-c',
    groups: [
      {
        platformIdentifier: PlatformIdentifier.Opencti,
        name: ServiceGroupName.Admin,
      },
      {
        platformIdentifier: PlatformIdentifier.Xtmone,
        name: ServiceGroupName.Admin,
      },
    ],
  };

  it.each([
    {
      description: 'single user keeps their current role, not mixed',
      userIds: ['user-a'],
      users: [userA],
      expected: {
        [PlatformIdentifier.Opencti]: {
          role: ServiceGroupName.Admin,
          isMixed: false,
        },
        [PlatformIdentifier.Xtmone]: {
          role: ServiceGroupName.User,
          isMixed: false,
        },
      },
    },
    {
      description: 'several users sharing the same role, not mixed',
      userIds: ['user-a', 'user-a'],
      users: [userA],
      expected: {
        [PlatformIdentifier.Opencti]: {
          role: ServiceGroupName.Admin,
          isMixed: false,
        },
        [PlatformIdentifier.Xtmone]: {
          role: ServiceGroupName.User,
          isMixed: false,
        },
      },
    },
    {
      description:
        'mixed roles on an optional platform default to "No access" (undefined), mandatory platform sharing a role stays not mixed',
      userIds: ['user-a', 'user-b'],
      users: [userA, userB],
      expected: {
        [PlatformIdentifier.Opencti]: { role: undefined, isMixed: true },
        [PlatformIdentifier.Xtmone]: {
          role: ServiceGroupName.User,
          isMixed: false,
        },
      },
    },
    {
      description:
        'mixed roles on the mandatory platform default to the panel defaultRole',
      userIds: ['user-a', 'user-c'],
      users: [userA, userWithAdminXtmOne],
      expected: {
        [PlatformIdentifier.Opencti]: {
          role: ServiceGroupName.Admin,
          isMixed: false,
        },
        [PlatformIdentifier.Xtmone]: {
          role: ServiceGroupName.User,
          isMixed: true,
        },
      },
    },
    {
      description: 'no user selected on an optional platform is not mixed',
      userIds: [],
      users: [],
      expected: {
        [PlatformIdentifier.Opencti]: { role: undefined, isMixed: false },
        [PlatformIdentifier.Xtmone]: { role: undefined, isMixed: false },
      },
    },
  ])('$description', ({ userIds, users, expected }) => {
    expect(computeMixedRoleDefaults(userIds, users, rolePanels)).toEqual(
      expected
    );
  });
});
