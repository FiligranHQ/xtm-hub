import { PrivateHomepage } from '@/components/homepage/PrivateHomepage';
import { PrivateHomepageLegacy } from '@/components/homepage/PrivateHomepageLegacy';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag } from '@graphql/generated';

export const dynamic = 'force-dynamic';

const Page = async () => {
  const showHomepageV2 = await isFeatureEnabled(FeatureFlag.HomePageV2);

  if (showHomepageV2) {
    return <PrivateHomepage />;
  }

  return <PrivateHomepageLegacy />;
};

// Component export
export default Page;
