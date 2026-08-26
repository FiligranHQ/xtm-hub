import { FeatureVotingPageLoader } from '@/components/feature-voting/FeatureVotingPageLoader';

export const dynamic = 'force-dynamic';

const Page = async () => {
  return <FeatureVotingPageLoader />;
};

export default Page;
