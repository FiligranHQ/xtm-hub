'use client';

import { LoginLayout } from '@/components/login/LoginLayout';
import { SettingsContextQuery } from '@/components/login/settings.graphql';
import SettingsContext from '@/components/settings/SettingsContext';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { settingsContextQuery } from '@generated/settingsContextQuery.graphql';
import { useQueryLoader } from 'react-relay';

// Component
const Login = () => {
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
