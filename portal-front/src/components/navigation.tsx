import GuardCapacityComponent from '@/components/admin-guard';
import { PortalContext } from '@/components/me/app-portal-context';
import { LinkMenu } from '@/components/menu/menu';
import MenuAdmin from '@/components/menu/menu-admin';
import { OrganizationSwitcher } from '@/components/menu/organization-switcher';
import { OrganizationCapabilityName } from '@/utils/constant';
import { APP_PATH } from '@/utils/path/constant';
import { HomeIcon } from 'filigran-icon';
import { UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';

interface NavigationAppProps {
  open: boolean;
}
export const NavigationApp: FunctionComponent<NavigationAppProps> = ({
  open,
}) => {
  const t = useTranslations();
  const { hasOrganizationCapability } = useContext(PortalContext);
  const canManageUser =
    hasOrganizationCapability &&
    (hasOrganizationCapability(
      OrganizationCapabilityName.ADMINISTRATE_ORGANIZATION
    ) ||
      hasOrganizationCapability(OrganizationCapabilityName.MANAGE_ACCESS));

  return (
    <nav className="flex-1 flex-shrink-0 pt-s">
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
        {canManageUser && (
          <li>
            <LinkMenu
              open={open}
              href={`/${APP_PATH}/manage/user`}
              icon={UsersIcon}
              text={t('MenuLinks.Users')}
            />
          </li>
        )}

        <GuardCapacityComponent>
          <MenuAdmin open={open} />
        </GuardCapacityComponent>
      </ul>
    </nav>
  );
};
