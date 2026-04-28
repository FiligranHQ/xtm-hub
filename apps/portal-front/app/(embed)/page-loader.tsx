'use client';

import { SettingsContextQuery } from '@/components/login/settings.graphql';
import { MeQuery } from '@/components/me/me.graphql';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { settingsContextQuery } from '@generated/settingsContextQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import Context from '../../src/components/me/MeContext';
import SettingsContext from '../../src/components/settings/SettingsContext';
import useMountingLoader from '../../src/hooks/use-mounting-loader';

interface LayoutPreloaderProps {
  children: React.ReactNode;
}

const PageLoader: React.FunctionComponent<LayoutPreloaderProps> = ({
  children,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<meLoaderQuery>(MeQuery);
  useMountingLoader(loadQuery, {});
  const [queryRefSettings, loadQuerySettings] =
    useQueryLoader<settingsContextQuery>(SettingsContextQuery);
  useMountingLoader(loadQuerySettings, { fetchPolicy: 'store-only' });
  return (
    queryRefSettings && (
      <SettingsContext queryRefSettings={queryRefSettings}>
        {queryRef && <Context queryRef={queryRef}>{children}</Context>}
      </SettingsContext>
    )
  );
};

// Component export
export default PageLoader;
