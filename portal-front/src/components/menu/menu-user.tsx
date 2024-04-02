import { ListChecks, Star } from 'lucide-react';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { LinkMenu } from '@/components/menu/menu';
import useGranted from '@/hooks/useGranted';

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
          icon={Star}
          text={'Services'}
        />
      </li>
      <li>
        <LinkMenu
          open={open}
          href={'/about'}
          icon={ListChecks}
          text={'About'}
        />
      </li>
    </>
  );
};

export default MenuUser;
