import '@/components/signup/SignUp.css';
import '@filigran/ui/theme.css';
import '@styles/globals.css';

import SignUp from '@/components/signup/SignUp';
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
    title: 'Sign up XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  try {
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
  } catch (_error) {
    // If user is not authenticated or API is unreachable, show signup form
  }

  return <SignUp />;
};

export default Page;
