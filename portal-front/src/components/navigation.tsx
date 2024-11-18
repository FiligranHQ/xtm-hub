import { LinkMenu } from '@/components/menu/menu';
import MenuAdmin from '@/components/menu/menu-admin';
import { OrganizationSwitcher } from '@/components/menu/organization-switcher';
import { Portal, portalContext } from '@/components/portal-context';
import { RESTRICTION } from '@/utils/constant';
import { HomeIcon } from 'filigran-icon';
import { Separator } from 'filigran-ui/clients';
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
  const { hasCapability } = useContext<Portal>(portalContext);
  const canManageUser =
    hasCapability && hasCapability(RESTRICTION.CAPABILITY_FRT_MANAGE_USER);
  return (
    <nav className="flex-1 flex-shrink-0 pt-s">
      <OrganizationSwitcher open={open} />
      <ul>
        <li>
          <LinkMenu
            open={open}
            href={'/'}
            icon={HomeIcon}
            text={t('MenuLinks.Home')}
          />
        </li>
        {canManageUser && (
          <li>
            <LinkMenu
              open={open}
              href={'/manage/user'}
              icon={UsersIcon}
              text={t('MenuLinks.Users')}
            />
          </li>
        )}

        <Separator className="my-2" />
        <MenuAdmin open={open} />
      </ul>
    </nav>
  );
};
