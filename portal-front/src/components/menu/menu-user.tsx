import * as React from 'react';
import { FunctionComponent } from 'react';
import { LinkMenu } from '@/components/menu/menu';
import useGranted from '@/hooks/useGranted';
import { ConstructionIcon, GroupingIcon } from 'filigran-icon';

export interface MenuUserProps {
  open: boolean;
}

const menuUserLink = [
  {
    href: '/service',
    icon: GroupingIcon,
    text: 'Services',
  },
  {
    href: '/manage-services',
    icon: ConstructionIcon,
    text: 'Manage',
  },
];

const MenuUser: FunctionComponent<MenuUserProps> = ({ open }) => {
  if (!useGranted('FRT_ACCESS_SERVICES')) {
    return null;
  }
  return (
    <>
      {menuUserLink.map(({ href, icon, text }) => (
        <li key={href}>
          <LinkMenu
            open={open}
            href={href}
            icon={icon}
            text={text}
          />
        </li>
      ))}
    </>
  );
};

export default MenuUser;