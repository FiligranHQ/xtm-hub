'use client';
import { FunctionComponent } from 'react';

import { LoginLayout } from '@/components/login/login-layout';
import { SettingsContextQuery } from '@/components/login/settings.graphql';
import SettingsContext from '@/components/settings/settings-context';
import useMountingLoader from '@/hooks/useMountingLoader';
import { settingsContextQuery } from '@generated/settingsContextQuery.graphql';
import { useQueryLoader } from 'react-relay';

// Component
const Login: FunctionComponent = () => {
  const [queryRefSettings, loadQuerySettings] =
    useQueryLoader<settingsContextQuery>(SettingsContextQuery);
  useMountingLoader(loadQuerySettings, { fetchPolicy: 'store-only' });
  return (
    queryRefSettings && (
      <SettingsContext queryRefSettings={queryRefSettings}>
        <LoginLayout />
      </SettingsContext>
    )
  );
};

// Component export
export default Login;
