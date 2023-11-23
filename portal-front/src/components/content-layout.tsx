'use client';
import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import TwMenu from '@/components/tw-menu';

interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex h-screen">
      <TwMenu />
      <main className={`mt-6 flex-1 overflow-auto bg-background p-6 pt-16`}>
        {children}
      </main>
    </div>
  );
};
