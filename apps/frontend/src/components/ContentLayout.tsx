'use client';

import { ReactNode } from 'react';
interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <div className="flex-1 min-h-0">
      <main className="h-full w-full overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
};
