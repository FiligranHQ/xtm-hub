import GuardCapacityComponent from '@/components/admin-guard';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import * as React from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page: React.FunctionComponent = async () => {
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
