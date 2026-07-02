import { PrivateHomepage } from '@/components/homepage/PrivateHomepage';
import { PrivateHomepageLegacy } from '@/components/homepage/PrivateHomepageLegacy';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';

export const dynamic = 'force-dynamic';

const Page = async () => {
  const showHomepageV2 = await isFeatureEnabled(FeatureFlagEnum.HOME_PAGE_V2);

  if (showHomepageV2) {
    return <PrivateHomepage />;
  }

  return <PrivateHomepageLegacy />;
};

// Component export
export default Page;
