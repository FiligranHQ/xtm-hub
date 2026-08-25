import { PlatformIdentifier, ServiceGroupName } from '@graphql/generated';
import { RolePanelConfig } from './manage-trial.const';

export const formatEmailList = (
  emails: string[],
  maxVisible: number = 3
): { visible: string; hiddenCount: number } => {
  const visible = emails.slice(0, maxVisible).join(', ');
  const hiddenCount = Math.max(emails.length - maxVisible, 0);

  return { visible, hiddenCount };
};

export interface UserPlatformGroups {
  id: string;
  groups: Array<{
    platformIdentifier: PlatformIdentifier;
    name: ServiceGroupName;
  }>;
}

export interface MixedRoleDefault {
  role?: ServiceGroupName;
  isMixed: boolean;
}

export const computeMixedRoleDefaults = (
  userIds: string[],
  users: UserPlatformGroups[],
  rolePanels: RolePanelConfig[]
): Partial<Record<PlatformIdentifier, MixedRoleDefault>> => {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return rolePanels.reduce<
    Partial<Record<PlatformIdentifier, MixedRoleDefault>>
  >((accumulator, { platform, defaultRole }) => {
    const rolesForPlatform = userIds.map(
      (userId) =>
        usersById
          .get(userId)
          ?.groups.find((group) => group.platformIdentifier === platform)?.name
    );

    const isMixed = new Set(rolesForPlatform).size > 1;

    return {
      ...accumulator,
      [platform]: {
        role: isMixed ? defaultRole : rolesForPlatform[0],
        isMixed,
      },
    };
  }, {});
};
