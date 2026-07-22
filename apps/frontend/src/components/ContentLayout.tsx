'use client';

import { AppFooter } from '@/components/AppFooter';
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
    <div className="relative flex-1 min-h-0">
      <main
        className={cn(
          'h-full w-full overflow-y-auto',
          isHomePageV2Enabled
            ? 'bg-gradient-background px-3 pt-3 sm:px-6 sm:pt-6'
            : 'bg-background p-6'
        )}>
        {children}
        {isHomePageV2Enabled && <AppFooter />}
      </main>
    </div>
  );
};
