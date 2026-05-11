import * as React from 'react';

import '@filigran/ui/theme.css';
import '@styles/embed.css';
import '@styles/globals.css';

import serverPortalApiFetch, {
  serverMutateGraphQL,
} from '@/relay/server-portal-api-fetch';

import { ContentLayout } from '@/components/ContentLayout';
import { ErrorPage } from '@/components/ui/ErrorPage';
import { RelayProvider } from '@/relay/relay-provider';
import { getMetadataBase } from '@/utils/metadata';
import { Card } from '@filigran/ui/servers';
import errorFrontendLogMutationNode, {
  errorFrontendLogMutation,
} from '@generated/errorFrontendLogMutation.graphql';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

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
  let shouldRedirect = false;
  let hasError = false;

  try {
    // @ts-expect-error
    const { data: meData }: { data: meLoaderQuery$data } =
      await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
        meLoaderQueryNode,
        {}
      );

    const me = meData.me as unknown as meContext_fragment$data;
    if (!me) {
      shouldRedirect = true;
    }
  } catch (error) {
    await serverMutateGraphQL<errorFrontendLogMutation>(
      errorFrontendLogMutationNode,
      {
        message: `EmbedLayout: unexpected ${(error as Error).name} error ${(error as Error).message}`,
        componentStack: 'app/(embed)/Layout.tsx',
      }
    );
    hasError = true;
  }

  if (shouldRedirect) {
    redirect(`/`);
  }

  if (hasError) {
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

  return (
    <RelayProvider>
      <PageLoader>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-1/3">
            <ContentLayout>
              <LogoXTMDark className="pb-6" />

              <Card className="p-xl bg-page-background">{children}</Card>
            </ContentLayout>
          </div>
        </div>
      </PageLoader>
    </RelayProvider>
  );
};

// Component export
export default RootLayout;
