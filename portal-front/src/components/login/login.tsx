'use client';
import React, { FunctionComponent } from 'react';

import LoginForm from '@/components/login/login-form';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import { SettingsQuery } from '@/components/login/settings.graphql';
import { settingsQuery } from '../../../__generated__/settingsQuery.graphql';

// Component
const Login: FunctionComponent = () => {
  const [queryRef, loadQuery] = useQueryLoader<settingsQuery>(SettingsQuery);
  useMountingLoader(loadQuery, {});
  return queryRef ? <LoginForm queryRef={queryRef} /> : <></>;
};

// Component export
export default Login;
