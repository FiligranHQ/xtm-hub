'use client';

import {
  SettingsContext_fragment,
  SettingsContextQuery,
} from '@/components/login/settings.graphql';
import { SettingsPortalContext } from '@/components/settings/env-portal-context';
import { settingsContext_fragment$key } from '@generated/settingsContext_fragment.graphql';
import { settingsContextQuery } from '@generated/settingsContextQuery.graphql';
import * as React from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';

// Component interface
interface ContextProps {
  queryRefSettings: PreloadedQuery<settingsContextQuery>;
  children: React.ReactNode;
}

// Component
const SettingsContext: React.FunctionComponent<ContextProps> = ({
  queryRefSettings,
  children,
}) => {
  const dataSettings = usePreloadedQuery<settingsContextQuery>(
    SettingsContextQuery,
    queryRefSettings
  );
  const settings = useFragment<settingsContext_fragment$key>(
    SettingsContext_fragment,
    dataSettings.settings
  );

  return (
    <SettingsPortalContext settings={settings}>
      {children}
    </SettingsPortalContext>
  );
};

// Component export
export default SettingsContext;
