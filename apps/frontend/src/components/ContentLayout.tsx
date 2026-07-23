'use client';

import { SharedContent } from '@/components/layout/SharedContent';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { FeatureFlag } from '@graphql/generated';
import { ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

// TODO: once FeatureFlag.HomePageV2 is removed, this component becomes a
// pure passthrough (always the SharedContent branch) and can be deleted.
// Its only remaining caller (app/(embed)/layout.tsx) should import
// SharedContent directly instead, the same way AppShell already does.
export const ContentLayout = ({ children }: ContentLayoutProps) => {
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlag.HomePageV2);

  if (isHomePageV2Enabled) {
    return (
      <SharedContent className="flex flex-col bg-gradient-background px-3 pt-3 sm:px-6 sm:p-6">
        {children}
      </SharedContent>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <main className="h-full w-full overflow-y-auto flex flex-col bg-elevation-background-layer-1 p-6">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
};
