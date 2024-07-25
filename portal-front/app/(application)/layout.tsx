import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import Login from '@/components/login/login';
import AppContext from '@/components/app-context';
import HeaderComponent from '@/components/header';
import PageLoader from './page-loader';
import {ContentLayout} from '@/components/content-layout';
import meLoaderQueryNode, {meLoaderQuery,} from '../../__generated__/meLoaderQuery.graphql';

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout: React.FunctionComponent<RootLayoutProps> = async ({
  children,
}) => {
  try {
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );
    return (
      <AppContext>
        <PageLoader>
          <HeaderComponent />
          <ContentLayout>{children}</ContentLayout>
        </PageLoader>
      </AppContext>
    );
  } catch (e) {
    return (
      <AppContext>
        <Login />
      </AppContext>
    );
  }
};

// Component export
export default RootLayout;
