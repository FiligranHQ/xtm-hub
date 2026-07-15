import GuardCapacityComponent from '@/components/AdminGuard';
import { PortalContext } from '@/components/me/AppPortalContext';
import { LinkMenu } from '@/components/menu/Menu';
import MenuAdmin from '@/components/menu/admin/MenuAdmin';
import { OrganizationSwitcher } from '@/components/menu/organization-switcher/OrganizationSwitcher';
import { APP_PATH } from '@/utils/path/constant';
import { HomeIcon, IndividualIcon } from '@filigran/icon';
import { OrganizationCapability, PortalCapability } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

interface NavigationAppProps {
  open: boolean;
}
export const NavigationApp = ({ open }: NavigationAppProps) => {
  const t = useTranslations();
  const { hasOrganizationCapability, me } = useContext(PortalContext);

  const currentOrganization = me?.organizations.find(
    (orga) => orga.id === me?.selected_organization_id
  );
  const canManageUser =
    hasOrganizationCapability &&
    (hasOrganizationCapability(
      OrganizationCapability.AdministrateOrganization
    ) ||
      hasOrganizationCapability(OrganizationCapability.ManageAccess));

  return (
    <nav className="flex-1 shrink-0">
      <OrganizationSwitcher open={open} />

      <ul className="space-y-s">
        <li>
          <LinkMenu
            open={open}
            href={`/${APP_PATH}`}
            icon={HomeIcon}
            text={t('MenuLinks.Home')}
          />
        </li>
        {canManageUser && !currentOrganization?.personal_space && (
          <li>
            <LinkMenu
              open={open}
              href={`/${APP_PATH}/manage/user`}
              icon={IndividualIcon}
              text={t('MenuLinks.Users')}
            />
          </li>
        )}

        <GuardCapacityComponent
          portalCapabilityRestriction={[PortalCapability.ReadTrials]}>
          <MenuAdmin open={open} />
        </GuardCapacityComponent>
      </ul>
    </nav>
  );
};
