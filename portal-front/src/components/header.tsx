'use client';

import * as React from 'react';
import { useContext } from 'react';
import { Portal, portalContext } from './context';
import { LayoutDashboard } from 'lucide-react';

// Component interface
interface HeaderComponentProps {}

// Component
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  return (
    <header className="fixed top-0 z-10 flex h-16 w-full items-center bg-background px-4 shadow-md">
      <LayoutDashboard className="mr-2 h-8 w-8" />
      <h1 className="text-xl">
        Portal <span>({me?.email ?? '-loading-'})</span>
      </h1>
    </header>
  );
};

// Component export
export default HeaderComponent;
