'use client';
import { CollapseMenuButton } from '@/components/menu/CollapseMenuButton';
import { MenuLogo } from '@/components/menu/MenuLogo';
import PublicNavigation from '@/components/menu/PublicNavigation';
import { cn } from '@/lib/utils';
import { LogoFiligranIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const PublicMenu = () => {
  const [open, setOpen] = useLocalStorage<boolean>('public-menu-open', true);
  const handleOpenMenu = useCallback(() => setOpen((prev) => !prev), [setOpen]);
  const t = useTranslations();

  return (
    <aside
      className={cn(
        'max-md:hidden z-20 flex h-full flex-col overflow-x-hidden bg-page-background dark:bg-background text-muted-foreground duration-300',
        open ? 'w-45' : 'w-14'
      )}>
      <MenuLogo />
      <div className="flex flex-col flex-1 justify-between min-h-0">
        <PublicNavigation open={open} />
        <div>
          <CollapseMenuButton
            open={open}
            handleOpenMenu={handleOpenMenu}
          />
          <div
            className={cn(
              'flex items-center px-m pb-s gap-1 text-muted-foreground/50 text-[10px]',
              !open && 'sr-only'
            )}>
            <span className="shrink-0" />
            {t('App.MadeBy')}
            <LogoFiligranIcon className="size-3 shrink-0" />
            {/* eslint-disable-next-line xtm-hub-i18n-rules/no-literal-string-in-jsx */}
            {'Filigran'}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PublicMenu;
