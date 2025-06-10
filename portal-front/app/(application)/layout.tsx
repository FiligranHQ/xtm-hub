import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import serverPortalApiFetch from '@/relay/serverPortalApiFetch';

import { AdminCallout } from '@/components/admin/admin-callout';
import { TestEnvCallout } from '@/components/admin/test-env-callout';
import { ContentLayout } from '@/components/content-layout';
import HeaderComponent from '@/components/header';
import Menu from '@/components/menu/menu';
import { ErrorPage } from '@/components/ui/error-page';
import { RelayProvider } from '@/relay/RelayProvider';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FunctionComponent } from 'react';
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

const should_redirect_error = 'should_redirect_error';

// Component
const RootLayout: FunctionComponent<RootLayoutProps> = async ({ children }) => {
  try {
    // @ts-expect-error
    const { data: meData }: { data: meLoaderQuery$data } =
      await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
        meLoaderQueryNode,
        {}
      );

    const me = meData.me as unknown as meContext_fragment$data;
    if (!me) {
      throw new Error(should_redirect_error);
    }

    return (
      <RelayProvider>
        <div className="flex min-h-screen">
          <PageLoader>
            <div className="flex flex-col w-full h-screen">
              <TestEnvCallout />
              <AdminCallout />
              <div className="flex flex-row flex-grow overflow-hidden">
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
  } catch (error) {
    if ((error as Error).message === should_redirect_error) {
      redirect(PUBLIC_CYBERSECURITY_SOLUTIONS_PATH);
    }

    console.error('RootLayout Error:', error);
    return (
      <div className="flex flex-col w-full h-screen">
        <ErrorPage>
          <p className="text-center">
            We&#39;re sorry, something went wrong
            <br />
            We&#39;re currently troubleshooting the issue. Please try again in a
            few minutes.
          </p>
        </ErrorPage>
      </div>
    );
  }
};

// Component export
export default RootLayout;
