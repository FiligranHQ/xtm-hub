'use client';

import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
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
        className={cn(
          'h-full w-full overflow-y-auto ',
          isHomePageV2Enabled
            ? 'bg-gradient-background overflow-y-auto p-3 sm:p-6'
            : 'bg-background p-6'
        )}>
        {children}
      </main>
    </div>
  );
};
