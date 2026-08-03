import '@/components/signup/SignUp.css';
import '@filigran/ui/theme.css';
import '@styles/globals.css';

import SignUp from '@/components/signup/SignUp';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { UnauthenticatedError } from '@/lib/graphql-fetch.utils';
import { getMetadataBase } from '@/utils/metadata';
import { APP_PATH } from '@/utils/path/constant';
import { hasLocalProvider } from '@/utils/settings.service';
import { useMeCheckQuery } from '@graphql/generated';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Sign up XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  try {
    const client = await getAuthenticatedGraphqlClient();
    const data = await useMeCheckQuery.fetcher(client)();

    if (data.me) {
      redirect(`/${APP_PATH}`);
    }
  } catch (_error) {
    if (_error instanceof UnauthenticatedError) {
      // User is not authenticated — show signup form
    } else {
      throw _error;
    }
  }

  const showLocalLogin = await hasLocalProvider();

  return <SignUp showLocalLogin={showLocalLogin} />;
};

export default Page;
