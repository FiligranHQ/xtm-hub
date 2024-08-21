import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import Menu from '@/components/menu/menu';

interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex flex-1">
      <Menu />
      <main className={`flex-1 overflow-auto bg-background p-6`}>
        {children}
      </main>
    </div>
  );
};
