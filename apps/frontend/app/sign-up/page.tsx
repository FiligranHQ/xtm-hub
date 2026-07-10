import '@/components/signup/SignUp.css';
import '@filigran/ui/theme.css';
import '@styles/globals.css';

import SignUp from '@/components/signup/SignUp';
import {
  getAuthenticatedGraphqlClient,
  UnauthenticatedError,
} from '@/lib/graphql-client';
import { getMetadataBase } from '@/utils/metadata';
import { APP_PATH } from '@/utils/path/constant';
import { hasLocalProvider, isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag, useMeCheckQuery } from '@graphql/generated';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Sign up XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const isHomePageV2Enabled = await isFeatureEnabled(FeatureFlag.HomePageV2);

  if (!isHomePageV2Enabled) {
    notFound();
  }
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
