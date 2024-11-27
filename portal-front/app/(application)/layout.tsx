import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import AppContext from '@/components/app-context';
import { ContentLayout } from '@/components/content-layout';
import HeaderComponent from '@/components/header';
import Login from '@/components/login/login';
import Menu from '@/components/menu/menu';
import { EmptyServicesRedirect } from '@/components/service/home/empty-services-redirect';
import I18nContext from '@/i18n/i18n-context';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import meLoaderQueryNode, {
  meLoaderQuery,
} from '../../__generated__/meLoaderQuery.graphql';
import meUserHasSomeSubscriptionNode, {
  meUserHasSomeSubscription,
  meUserHasSomeSubscription$data,
} from '../../__generated__/meUserHasSomeSubscription.graphql';
import PageLoader from './page-loader';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: new URL(`https://${headers().get('host')}`),
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
  try {
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );
    // @ts-ignore
    const { data }: { data: meUserHasSomeSubscription$data } =
      await serverPortalApiFetch<
        typeof meUserHasSomeSubscriptionNode,
        meUserHasSomeSubscription
      >(meUserHasSomeSubscriptionNode, {});

    return (
      <I18nContext>
        <AppContext>
          {data.userHasSomeSubscription ? (
            <PageLoader>
              <Menu />
              <div className="w-full overflow-auto h-screen">
                <HeaderComponent />
                <ContentLayout>{children}</ContentLayout>
              </div>
            </PageLoader>
          ) : (
            <PageLoader>
              <div className="w-full overflow-auto h-screen">
                <HeaderComponent displayLogo={true} />
                <EmptyServicesRedirect />
              </div>
            </PageLoader>
          )}
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
