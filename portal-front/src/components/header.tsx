'use client';

import * as React from 'react';
import { useContext } from 'react';
import Logo from '../../public/logo.svg';
import { Portal, portalContext } from '@/components/portal-context';
import { IndividualIcon } from 'filigran-icon';
import { IconActions } from '@/components/ui/icon-actions';
import Logout from '@/components/logout';
import { Skeleton } from 'filigran-ui';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Component interface
interface HeaderComponentProps {}
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full flex-shrink-0 items-center justify-between border-b bg-background bg-page-background px-4 shadow-md">
      <Logo className="mr-2 h-8 w-8" />

      <div className="flex items-center">
        <span className="gap-s text-xl">
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
          <Logout />
        </IconActions>
        <ThemeToggle />
      </div>
    </header>
  );
};

// Component export
export default HeaderComponent;
