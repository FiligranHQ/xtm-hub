'use client';

import I18nSelect from '@/components/i18n-select';
import Logout from '@/components/logout';
import { Portal, portalContext } from '@/components/me/portal-context';
import { NavigationApp } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { DisplayLogo } from '@/components/ui/display-logo';
import { IconActions } from '@/components/ui/icon-actions';
import { cn, isDevelopment } from '@/lib/utils';

import { Avatar, Skeleton } from 'filigran-ui';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

// Component interface
interface HeaderComponentProps {
  displayLogo?: boolean;
}

const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({
  displayLogo,
}) => {
  const { me } = useContext<Portal>(portalContext);
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  const t = useTranslations();
  const { setTheme } = useTheme();
  setTheme('dark');
  useEffect(() => setOpen(false), [currentPath]);

  const User = () =>
    me ? (
      <span>
        {me.first_name} {me.last_name}
      </span>
    ) : (
      <Skeleton className="h-6 w-56" />
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between',
        displayLogo ? '' : 'sm:justify-end'
      )}>
      <DisplayLogo
        className={cn(
          'text-primary mr-2 h-full py-l',
          displayLogo ? '' : 'sm:hidden'
        )}
      />

      <div className="mobile:hidden flex items-center gap-s">
        <User />
        <IconActions
          icon={
            <>
              <div className="mt-s size-10">
                <Avatar src={me?.picture ?? ''} />
              </div>
              <span className="sr-only">{t('MenuUser.ToggleUser')}</span>
            </>
          }>
          <Logout className="normal-case w-full justify-start" />
        </IconActions>
        {isDevelopment && <ThemeToggle />}
        <I18nSelect />
      </div>
      <div className="flex gap-xs items-center sm:hidden">
        <ThemeToggle />
        <I18nSelect />
        <Sheet
          open={open}
          onOpenChange={setOpen}>
          <SheetTrigger>
            <MenuIcon
              aria-hidden={true}
              focusable={false}
              className="h-6 w-6"
            />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filigran</SheetTitle>
              <SheetDescription>
                <User />
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col h-full justify-between">
              <NavigationApp open={true} />
              <div className="pb-xl text-center">
                <Logout />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

// Component export
export default HeaderComponent;
