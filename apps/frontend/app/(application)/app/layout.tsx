import * as React from 'react';

import '@styles/globals.css';

import serverPortalApiFetch from '@/relay/server-portal-api-fetch';

import { AdminBanner } from '@/components/admin/AdminBanner';
import { TestEnvBanner } from '@/components/admin/TestEnvBanner';
import { ContentLayout } from '@/components/ContentLayout';
import HeaderComponent from '@/components/Header';
import Menu from '@/components/menu/Menu';
import PrivateMenu from '@/components/menu/PrivateMenu';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { TryFiligranProductsBanner } from '@/components/service/trial-instances/banner/TryFiligranProductsBanner';
import { cn } from '@/lib/utils';
import { RelayProvider } from '@/relay/relay-provider';
import { getMetadataBase } from '@/utils/metadata';
import { APP_PATH } from '@/utils/path/constant';
import { buildLoginRedirect, buildSignupRedirect } from '@/utils/redirect';
import { isFeatureEnabled } from '@/utils/settings.service';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import { FeatureFlag } from '@graphql/generated';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout = async ({ children }: RootLayoutProps) => {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? `/${APP_PATH}`;

  // @ts-expect-error
  const { data: meData }: { data: meLoaderQuery$data } =
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );

  const isHomePageV2Enabled = await isFeatureEnabled(FeatureFlag.HomePageV2);

  const me = meData.me as unknown as meContext_fragment$data;
  if (!me) {
    redirect(
      isHomePageV2Enabled
        ? buildSignupRedirect(pathname)
        : buildLoginRedirect(pathname)
    );
  }

  return (
    <RelayProvider>
      <ReactQueryProvider>
        <div className="flex min-h-screen">
          <PageLoader>
            <div
              id="app-shell"
              className={cn(
                'flex flex-col w-full h-screen min-h-0',
                isHomePageV2Enabled && 'overflow-y-auto'
              )}>
              <TestEnvBanner />
              <AdminBanner />
              <TryFiligranProductsBanner />
              <div className="flex flex-row grow min-h-0">
                {isHomePageV2Enabled ? <PrivateMenu /> : <Menu />}
                <div
                  className={cn(
                    'flex flex-col w-full h-full min-h-0 min-w-0',
                    isHomePageV2Enabled && 'overflow-y-auto'
                  )}>
                  <HeaderComponent />
                  <ContentLayout>{children}</ContentLayout>
                </div>
              </div>
            </div>
          </PageLoader>
        </div>
      </ReactQueryProvider>
    </RelayProvider>
  );
};

// Component export
export default RootLayout;
