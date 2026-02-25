import * as React from 'react';
import { FunctionComponent } from 'react';

import '@filigran/ui/theme.css';
import '../../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import { AdminBanner } from '@/components/admin/admin-banner';
import { TestEnvBanner } from '@/components/admin/test-env-banner';
import { ContentLayout } from '@/components/content-layout';
import HeaderComponent from '@/components/header';
import Menu from '@/components/menu/menu';
import { TryFiligranProductsBanner } from '@/components/service/trial-instances/banner/try-filigran-products-banner';
import { RelayProvider } from '@/relay/RelayProvider';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

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
const RootLayout: FunctionComponent<RootLayoutProps> = async ({ children }) => {
  // @ts-expect-error
  const { data: meData }: { data: meLoaderQuery$data } =
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );

  const me = meData.me as unknown as meContext_fragment$data;
  if (!me) {
    redirect(`/`);
  }

  return (
    <RelayProvider>
      <div className="flex min-h-screen">
        <PageLoader>
          <div className="flex flex-col w-full h-screen">
            <TestEnvBanner />
            <AdminBanner />
            <TryFiligranProductsBanner />
            <div className="flex flex-row flex-grow">
              <Menu />
              <div className="flex flex-col w-full h-full overflow-auto">
                <HeaderComponent />
                <ContentLayout>{children}</ContentLayout>
              </div>
            </div>
          </div>
        </PageLoader>
      </div>
    </RelayProvider>
  );
};

// Component export
export default RootLayout;
