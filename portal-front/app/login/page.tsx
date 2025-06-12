import * as React from 'react';

import 'filigran-ui/theme.css';
import '../../styles/globals.css';

import Login from '@/components/login/login';
import { RelayProvider } from '@/relay/RelayProvider';
import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import meLoaderQueryNode, {
  meLoaderQuery,
  meLoaderQuery$data,
} from '@generated/meLoaderQuery.graphql';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return {
    title: 'Sign in XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: new URL(`https://${h.get('host')}`),
  };
}

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
    redirect('/');
  }

  return (
    <RelayProvider>
      <Login />
    </RelayProvider>
  );
};

export default Page;
