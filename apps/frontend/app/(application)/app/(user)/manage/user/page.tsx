import GuardCapacityComponent from '@/components/AdminGuard';
import { OrganizationCapability } from '@graphql/generated';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page = async () => {
  return (
    <GuardCapacityComponent
      displayError
      shouldNotBePersonalSpace
      capacityRestriction={[
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ]}>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
