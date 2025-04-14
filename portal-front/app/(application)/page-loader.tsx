'use client';

import { SettingsQuery } from '@/components/login/settings.graphql';
import Context from '@/components/me/me-context';
import { MeQuery } from '@/components/me/me.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { settingsQuery } from '@generated/settingsQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

// Component interface
interface LayoutPreloaderProps {
  children: React.ReactNode;
}

// Component
const PageLoader: React.FunctionComponent<LayoutPreloaderProps> = ({
  children,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<meLoaderQuery>(MeQuery);
  useMountingLoader(loadQuery, {});
  const [queryRefSettings, loadQuerySettings] =
    useQueryLoader<settingsQuery>(SettingsQuery);
  useMountingLoader(loadQuerySettings, {});
  if (queryRef && queryRefSettings) {
    return (
      <Context
        queryRef={queryRef}
        queryRefSettings={queryRefSettings}>
        {children}
      </Context>
    );
  }
  return <>{children}</>;
};

// Component export
export default PageLoader;
