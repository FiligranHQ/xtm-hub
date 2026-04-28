'use client';
import { FunctionComponent } from 'react';

import { SettingsContextQuery } from '@/components/login/settings.graphql';
import { settingsContextQuery } from '@generated/settingsContextQuery.graphql';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '../../hooks/use-mounting-loader';
import SettingsContext from '../settings/SettingsContext';
import { LoginLayout } from './LoginLayout';

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
