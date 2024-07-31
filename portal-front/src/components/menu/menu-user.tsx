import * as React from 'react';
import { FunctionComponent } from 'react';
import { LinkMenu } from '@/components/menu/menu';
import useGranted from '@/hooks/useGranted';
import { ChecklistRtlIcon, ForumIcon, GradeIcon } from 'filigran-icon';

export interface MenuUserProps {
  open: boolean;
}

const MenuUser: FunctionComponent<MenuUserProps> = ({ open }) => {
  if (!useGranted('FRT_ACCESS_SERVICES')) {
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
          href={'/communities'}
          icon={ForumIcon}
          text={'Communities'}
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
