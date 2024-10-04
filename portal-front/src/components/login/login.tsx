'use client';
import { FunctionComponent } from 'react';

import LoginForm from '@/components/login/login-form';
import { SettingsQuery } from '@/components/login/settings.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { useQueryLoader } from 'react-relay';
import { settingsQuery } from '../../../__generated__/settingsQuery.graphql';

// Component
const Login: FunctionComponent = () => {
  const [queryRef, loadQuery] = useQueryLoader<settingsQuery>(SettingsQuery);
  useMountingLoader(loadQuery, {});
  return queryRef ? <LoginForm queryRef={queryRef} /> : <></>;
};

// Component export
export default Login;
