'use client';

import * as React from 'react';
import {useContext} from 'react';
import Logo from '../../public/logo.svg';
import {Portal, portalContext} from '@/components/portal-context';
import {IndividualIcon} from 'filigran-icon';
import {IconActions} from '@/components/ui/icon-actions';
import Logout from '@/components/logout';
import {Skeleton} from 'filigran-ui';

// Component interface
interface HeaderComponentProps {}
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full flex-shrink-0 items-center justify-between bg-background bg-white px-4 shadow-md">
      <Logo className="mr-2 h-8 w-8" />

      <div className="flex">
        <p className="mr-m text-xl">
          {me?.email ? (
            <span> {me.email}</span>
          ) : (
            <Skeleton className="h-6 w-56" />
          )}
        </p>
        <IconActions
          icon={
            <>
              <IndividualIcon className="h-6 w-6" />
              <span className="sr-only">Open user menu</span>
            </>
          }>
          <Logout />
        </IconActions>
      </div>
    </header>
  );
};

// Component export
export default HeaderComponent;
