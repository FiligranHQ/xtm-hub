import { LinkMenu } from '@/components/menu/menu';
import MenuAdmin from '@/components/menu/menu-admin';
import { OrganizationSwitcher } from '@/components/menu/organization-switcher';
import { HomeIcon } from 'filigran-icon';
import { Separator } from 'filigran-ui/clients';
import { FunctionComponent } from 'react';

interface NavigationAppProps {
  open: boolean;
}
export const NavigationApp: FunctionComponent<NavigationAppProps> = ({
  open,
}) => {
  return (
    <nav className="flex-1 flex-shrink-0 pt-s">
      <OrganizationSwitcher open={open} />
      <ul>
        <li>
          <LinkMenu
            open={open}
            href={'/'}
            icon={HomeIcon}
            text={'Home'}
          />
        </li>
        <Separator className="my-2" />
        <MenuAdmin open={open} />
      </ul>
    </nav>
  );
};
