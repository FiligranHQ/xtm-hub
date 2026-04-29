import * as React from 'react';

import '@filigran/ui/theme.css';
import '@styles/globals.css';

import Login from '@/components/login/Login';
import { RelayProvider } from '@/relay/relay-provider';
import serverPortalApiFetch from '@/relay/server-portal-api-fetch';
import { getMetadataBase } from '@/utils/metadata';
import { APP_PATH } from '@/utils/path/constant';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Sign in XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export const dynamic = 'force-dynamic';

const Page: React.FunctionComponent = async () => {
  // @ts-expect-error
  const { data: meData }: { data: meLoaderQuery$data } =
    await serverPortalApiFetch<typeof meLoaderQueryNode, meLoaderQuery>(
      meLoaderQueryNode,
      {}
    );

  const me = meData.me as unknown as meContext_fragment$data;
  if (me) {
    redirect(`/${APP_PATH}`);
  }

  return (
    <RelayProvider>
      <Login />
    </RelayProvider>
  );
};

export default Page;
