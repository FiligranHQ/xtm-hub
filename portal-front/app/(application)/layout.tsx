import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import { AdminCallout } from '@/components/admin/admin-callout';
import AppContext from '@/components/app-context';
import { ContentLayout } from '@/components/content-layout';
import HeaderComponent from '@/components/header';
import Login from '@/components/login/login';
import Menu from '@/components/menu/menu';
import I18nContext from '@/i18n/i18n-context';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { meContext_fragment$data } from '../../__generated__/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '../../__generated__/meLoaderQuery.graphql';
import PageLoader from './page-loader';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: new URL(`https://${h.get('host')}`),
  };
}

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout: React.FunctionComponent<RootLayoutProps> = async ({
  children,
}) => {
  // @ts-expect-error
  const { data: meData }: { data: meLoaderQuery$data } =
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );

  const me = meData.me as unknown as meContext_fragment$data;

  if (me) {
    return (
      <I18nContext>
        <AppContext>
          <PageLoader>
            <AdminCallout />
            <Menu />
            <div className="w-full overflow-auto h-screen">
              <HeaderComponent />
              <ContentLayout>{children}</ContentLayout>
            </div>
          </PageLoader>
        </AppContext>
      </I18nContext>
    );
  } else {
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
