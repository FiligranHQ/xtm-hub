import GuardCapacityComponent from '@/components/AdminGuard';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page = async () => {
  return (
    <GuardCapacityComponent
      displayError
      capacityRestriction={[
        OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
        OrganizationCapabilityEnum.MANAGE_ACCESS,
      ]}>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
