import * as React from 'react';
import { FunctionComponent } from 'react';
import { LinkMenu } from '@/components/menu/menu';
import useGranted from '@/hooks/useGranted';
import { ChecklistRtlIcon, GradeIcon } from 'filigran-icon';

export interface MenuUserProps {
  open: boolean;
}

const MenuUser: FunctionComponent<MenuUserProps> = ({ open }) => {
  if (!useGranted('USER')) {
    return null;
  }
  return (
    <>
      <li>
        <LinkMenu
          open={open}
          href={'/service'}
          icon={GradeIcon}
          text={'Services'}
        />
      </li>
      <li>
        <LinkMenu
          open={open}
          href={'/about'}
          icon={ChecklistRtlIcon}
          text={'About'}
        />
      </li>
    </>
  );
};

export default MenuUser;
