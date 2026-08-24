import { PlatformIdentifier, ServiceGroupName } from '@graphql/generated';

export interface RolePanelConfig {
  platform: PlatformIdentifier;
  roles: ServiceGroupName[];
  defaultRole?: ServiceGroupName;
}

export const ROLE_PANELS: RolePanelConfig[] = [
  {
    platform: PlatformIdentifier.Opencti,
    roles: [
      ServiceGroupName.Admin,
      ServiceGroupName.Analyst,
      ServiceGroupName.Reader,
    ],
  },
  {
    platform: PlatformIdentifier.Openaev,
    roles: [
      ServiceGroupName.Admin,
      ServiceGroupName.Manager,
      ServiceGroupName.Observer,
    ],
  },
  {
    platform: PlatformIdentifier.Xtmone,
    roles: [ServiceGroupName.Admin, ServiceGroupName.User],
    defaultRole: ServiceGroupName.User,
  },
];

export const getBundleRolePanels = (
  products?: PlatformIdentifier[]
): RolePanelConfig[] =>
  ROLE_PANELS.filter(
    ({ platform }) => !products || products.includes(platform)
  );
