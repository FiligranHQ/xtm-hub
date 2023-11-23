import * as React from 'react';

import 'styles/globals.css';

import loadSerializableQuery from '@/relay/loadSerializableQuery';
import preloaderLayoutQueryNode, {
  preloaderLayoutQuery,
} from '../__generated__/preloaderLayoutQuery.graphql';
import Login from '@/components/login';
import AppContext from '@/components/app-context';
import HeaderComponent from '@/components/header';
import Preloader from './preloader';
import { ContentLayout } from '@/components/content-layout';

// Configuration or Preloader Query

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout: React.FunctionComponent<RootLayoutProps> = async ({
  children,
}) => {
  try {
    const preloadedQuery = await loadSerializableQuery<
      typeof preloaderLayoutQueryNode,
      preloaderLayoutQuery
    >(preloaderLayoutQueryNode, {});
    return (
      <AppContext>
        <Preloader preloadedQuery={preloadedQuery}>
          <HeaderComponent />
          <ContentLayout>{children}</ContentLayout>
        </Preloader>
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
