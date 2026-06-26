'use client';

import { MenuFooter } from '@/components/menu/MenuFooter';
import { MenuLogo } from '@/components/menu/MenuLogo';
import PrivateNavigation from '@/components/menu/PrivateNavigation';
import { cn } from '@/lib/utils';
import { APP_PATH } from '@/utils/path/constant';
import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const PrivateMenu = () => {
  const [open, setOpen] = useLocalStorage<boolean>(
    'is-private-menu-open',
    true
  );
  const handleOpenMenu = useCallback(
    () => setOpen((previousOpen) => !previousOpen),
    [setOpen]
  );

  return (
    <aside
      className={cn(
        'mobile:hidden z-20 sticky shrink-0 top-0 left-0 flex h-full flex-col overflow-y-auto overflow-x-hidden bg-background duration-300 ease-in-out',
        open ? 'w-48' : 'w-14'
      )}>
      <MenuLogo href={`/${APP_PATH}`} />
      <div className="border-r flex-1 flex-col flex justify-between">
        <PrivateNavigation open={open} />
        <MenuFooter
          open={open}
          handleOpenMenu={handleOpenMenu}
        />
      </div>
    </aside>
  );
};

export default PrivateMenu;
