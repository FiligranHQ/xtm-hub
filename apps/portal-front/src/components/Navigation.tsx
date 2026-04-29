import { APP_PATH } from '@/utils/path/constant';
import { HomeIcon, IndividualIcon } from '@filigran/icon';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import GuardCapacityComponent from '@/components/AdminGuard';
import { PortalContext } from '@/components/me/AppPortalContext';
import { LinkMenu } from '@/components/menu/Menu';
import MenuAdmin from '@/components/menu/MenuAdmin';
import { OrganizationSwitcher } from '@/components/menu/OrganizationSwitcher';

interface NavigationAppProps {
  open: boolean;
}
export const NavigationApp: FunctionComponent<NavigationAppProps> = ({
  open,
}) => {
  const t = useTranslations();
  const { hasOrganizationCapability, me } = useContext(PortalContext);

  const currentOrganization = me?.organizations.find(
    (orga) => orga.id === me?.selected_organization_id
  );
  const canManageUser =
    hasOrganizationCapability &&
    (hasOrganizationCapability(
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION
    ) ||
      hasOrganizationCapability(OrganizationCapabilityEnum.MANAGE_ACCESS));

  return (
    <nav className="flex-1 shrink-0 pt-s">
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
          portalCapabilityRestriction={[PortalCapabilityEnum.READ_TRIALS]}>
          <MenuAdmin open={open} />
        </GuardCapacityComponent>
      </ul>
    </nav>
  );
};
