'use client';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { MenuLogo } from '@/components/menu/MenuLogo';
import PublicNavigation from '@/components/menu/navigation/public/PublicNavigation';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const PublicMenu = () => {
  const locale = useLocale();
  const [open, setOpen] = useLocalStorage<boolean>('is-public-menu-open', true);
  const handleOpenMenu = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  return (
    <aside
      className={cn(
        'max-md:hidden z-20 flex h-full flex-col overflow-x-hidden bg-page-background text-muted-foreground duration-300',
        open ? 'w-45' : 'w-14'
      )}>
      <MenuLogo
        href={`/${locale}`}
        withDarkBackground={false}
      />
      <div className="flex flex-col flex-1 justify-between min-h-0">
        <PublicNavigation open={open} />
        <MenuFooter
          open={open}
          handleOpenMenu={handleOpenMenu}
        />
      </div>
    </aside>
  );
};

export default PublicMenu;
