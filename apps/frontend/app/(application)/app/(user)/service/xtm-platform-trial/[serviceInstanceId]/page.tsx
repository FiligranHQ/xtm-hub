import { APP_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag } from '@graphql/generated';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

interface XtmPlatformTrialPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = async ({ params }: XtmPlatformTrialPageProps) => {
  const enabled = await isFeatureEnabled(FeatureFlag.XtmPlatformTrial);
  if (!enabled) {
    redirect(`/${APP_PATH}`);
  }
  const { serviceInstanceId } = await params;
  return (
    <PageLoader serviceInstanceId={decodeURIComponent(serviceInstanceId)} />
  );
};

export default Page;
