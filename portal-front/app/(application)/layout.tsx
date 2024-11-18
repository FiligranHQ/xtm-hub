import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import AppContext from '@/components/app-context';
import { ContentLayout } from '@/components/content-layout';
import HeaderComponent from '@/components/header';
import Login from '@/components/login/login';
import Menu from '@/components/menu/menu';
import I18nContext from '@/i18n/i18n-context';
import meLoaderQueryNode, {
  meLoaderQuery,
} from '../../__generated__/meLoaderQuery.graphql';
import PageLoader from './page-loader';

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
      <I18nContext>
        <AppContext>
          <PageLoader>
            <Menu />
            <div className="flex flex-col flex-1">
              <HeaderComponent />
              <ContentLayout>{children}</ContentLayout>
            </div>
          </PageLoader>
        </AppContext>
      </I18nContext>
    );
  } catch (e) {
    return (
      <I18nContext>
        <AppContext>
          <Login />
        </AppContext>
      </I18nContext>
    );
  }
};

// Component export
export default RootLayout;
