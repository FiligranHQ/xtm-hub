'use client';

import I18nSelect from '@/components/i18n-select';
import Logout from '@/components/logout';
import { PortalContext } from '@/components/me/app-portal-context';
import { NavigationApp } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { DisplayLogo } from '@/components/ui/display-logo';
import { IconActions } from '@/components/ui/icon-actions';
import { cn, isDevelopment } from '@/lib/utils';

import { ProfileMenuButton } from '@/components/profile/menu/button';
import { formatPersonNames } from '@/utils/format/name';
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
  const { me } = useContext(PortalContext);
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  const t = useTranslations();
  useEffect(() => setOpen(false), [currentPath]);

  const User = () =>
    me ? (
      <span>{formatPersonNames(me)}</span>
    ) : (
      <Skeleton className="h-6 w-56" />
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-[20] flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between',
        displayLogo ? '' : 'sm:justify-end'
      )}>
      <DisplayLogo
        className={cn(
          'text-primary mr-2 h-full py-l',
          displayLogo ? '' : 'sm:hidden'
        )}
      />

      <div className="mobile:hidden flex items-center gap-s">
        <IconActions
          className="rounded-full"
          label={<User />}
          icon={
            <>
              <div className="my-auto size-10">
                <Avatar src={me?.picture || undefined} />
              </div>
              <span className="sr-only">{t('MenuUser.ToggleUser')}</span>
            </>
          }>
          <ProfileMenuButton className="normal-case w-full justify-start" />
          <Logout className="normal-case w-full justify-start" />
        </IconActions>
        {isDevelopment() && (
          <>
            <ThemeToggle />
            <I18nSelect />
          </>
        )}
      </div>
      <div className="flex gap-xs items-center sm:hidden">
        {isDevelopment() && (
          <>
            <ThemeToggle />
            <I18nSelect />
          </>
        )}
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
              <div className="pb-xl flex flex-col text-center">
                <ProfileMenuButton className="w-full" />
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
