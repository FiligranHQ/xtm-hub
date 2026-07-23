'use client';

import { AppFooter } from '@/components/AppFooter';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
import { FeatureFlag } from '@graphql/generated';
import { ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const ContentLayout = ({
  children,
  showFooter = true,
}: ContentLayoutProps) => {
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlag.HomePageV2);
  return (
    <div className="relative flex-1 min-h-0">
      <main
        className={cn(
          'h-full w-full overflow-y-auto flex flex-col',
          isHomePageV2Enabled
            ? 'bg-gradient-background px-3 pt-3 sm:px-6 sm:pt-6'
            : 'bg-elevation-background-layer-1 p-6'
        )}>
        <div className="flex-1">{children}</div>
        {isHomePageV2Enabled && showFooter && <AppFooter />}
      </main>
    </div>
  );
};
