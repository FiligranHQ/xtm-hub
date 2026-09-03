import TrialGuidePage from '@/components/service/trial-guide/TrialGuidePage';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag } from '@graphql/generated';
import { notFound } from 'next/navigation';

const Page = async () => {
  const xtmPlatformTrialEnabled = await isFeatureEnabled(
    FeatureFlag.XtmPlatformTrial
  );
  if (!xtmPlatformTrialEnabled) {
    notFound();
  }

  return <TrialGuidePage />;
};

export default Page;
