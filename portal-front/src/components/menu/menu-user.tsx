import * as React from 'react';
import { FunctionComponent } from 'react';
import { LinkMenu } from '@/components/menu/menu';
import useGranted from '@/hooks/useGranted';
import { ChecklistRtlIcon, ForumIcon, GradeIcon } from 'filigran-icon';
import { usePathname } from 'next/navigation';

export interface MenuUserProps {
  open: boolean;
}

const menuUserLink = [
  {
    href: '/service',
    icon: GradeIcon,
    text: 'Services',
  },
  {
    href: '/communities',
    icon: ForumIcon,
    text: 'Communities',
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
