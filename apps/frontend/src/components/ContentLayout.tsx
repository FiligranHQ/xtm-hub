'use client';

import { ReactNode } from 'react';
interface ContentLayoutProps {
  children: ReactNode;
  mobileResponsive?: boolean;
}

export const ContentLayout = ({
  children,
  mobileResponsive = false,
}: ContentLayoutProps) => {
  return (
    <div className="flex-1 min-h-0">
      <main
        className={`h-full w-full overflow-y-auto bg-background ${
          mobileResponsive ? 'p-3 sm:p-6' : 'p-6'
        }`}>
        {children}
      </main>
    </div>
  );
};
