'use client';

import I18nSelect from '@/components/i18n-select';
import Logout from '@/components/logout';
import { NavigationApp } from '@/components/navigation';
import { Portal, portalContext } from '@/components/portal-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { IconActions } from '@/components/ui/icon-actions';
import { IndividualIcon } from 'filigran-icon';
import { Skeleton } from 'filigran-ui';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { MenuIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import Logo from '../../public/logo.svg';

// Component interface
interface HeaderComponentProps {}
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full flex-shrink-0 items-center justify-between border-b bg-page-background dark:bg-background px-4">
      <Logo className="mr-2 h-8 w-8" />
      <div className="mobile:hidden flex items-center gap-s">
        <span>
          {me?.email ? (
            <span> {me.email}</span>
          ) : (
            <Skeleton className="h-6 w-56" />
          )}
        </span>
        <IconActions
          icon={
            <>
              <IndividualIcon className="h-6 w-6" />
              <span className="sr-only">Open user menu</span>
            </>
          }>
          <Logout className="normal-case w-full justify-start" />
        </IconActions>
        <ThemeToggle />
        <I18nSelect />
      </div>
      <div className="flex gap-xs items-center sm:hidden">
        <ThemeToggle />
        <I18nSelect />
        <Sheet
          open={open}
          onOpenChange={setOpen}>
          <SheetTrigger>
            <MenuIcon className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filigran</SheetTitle>
              <SheetDescription>
                {me?.email ? (
                  <span> {me.email}</span>
                ) : (
                  <Skeleton className="h-6 w-56" />
                )}
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
