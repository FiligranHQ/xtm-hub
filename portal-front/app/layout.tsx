import * as React from 'react';

import '../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import pageLoaderMeQueryNode, { pageLoaderMeQuery } from '../__generated__/pageLoaderMeQuery.graphql';
import Login from '@/components/login';
import AppContext from '@/components/app-context';
import HeaderComponent from '@/components/header';
import PageLoader from './page-loader';
import { ContentLayout } from '@/components/content-layout';

// Configuration or Preloader Query

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout: React.FunctionComponent<RootLayoutProps> = async ({ children }) => {
  try {
    await serverPortalApiFetch<typeof pageLoaderMeQueryNode, pageLoaderMeQuery>(pageLoaderMeQueryNode, {});
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
