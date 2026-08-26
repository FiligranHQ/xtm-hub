import { APP_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag } from '@graphql/generated';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

const Page = async () => {
  const enabled = await isFeatureEnabled(FeatureFlag.XtmPlatformTrial);
  if (!enabled) {
    redirect(`/${APP_PATH}`);
  }
  return <PageLoader />;
};

export default Page;
