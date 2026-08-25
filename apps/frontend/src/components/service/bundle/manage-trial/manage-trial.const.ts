import { PlatformIdentifier, ServiceGroupName } from '@graphql/generated';
import { z } from 'zod';

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

export const NO_ROLE_VALUE = 'none';

export type RoleFormField = `${PlatformIdentifier}Role`;

export const trialUserRolesFormSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  openctiRole: z.enum(ServiceGroupName).optional(),
  openaevRole: z.enum(ServiceGroupName).optional(),
  xtmoneRole: z.enum(ServiceGroupName),
});

export type TrialUserRolesFormValues = z.infer<typeof trialUserRolesFormSchema>;
