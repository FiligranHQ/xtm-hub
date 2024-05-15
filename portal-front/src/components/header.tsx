'use client';

import * as React from 'react';
import { useContext } from 'react';
import { Skeleton } from 'filigran-ui/servers';
import Logo from '../../public/logo.svg';
import { Portal, portalContext } from '@/components/portal-context';

// Component interface
interface HeaderComponentProps {}

// Component
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  return (
    <header className="fixed top-0 z-10 flex h-16 w-full items-center bg-background px-4 shadow-md">
      <Logo className="mr-2 h-8 w-8" />
      <h1 className="text-xl">
        {me?.email ? (
          <span> Portal {me.email}</span>
        ) : (
          <Skeleton className="h-6 w-56" />
        )}
      </h1>
    </header>
  );
};

// Component export
export default HeaderComponent;
