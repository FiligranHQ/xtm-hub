'use client';

import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { FeatureFlag } from '@graphql/generated';
import { ReactNode } from 'react';
interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlag.HomePageV2);
  return (
    <div className="flex-1 min-h-0">
      <main
        className={`h-full w-full overflow-y-auto bg-background ${
          isHomePageV2Enabled ? 'p-3 sm:p-6' : 'p-6'
        }`}>
        {children}
      </main>
    </div>
  );
};
