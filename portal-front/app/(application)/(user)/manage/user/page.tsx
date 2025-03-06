import GuardCapacityComponent from '@/components/admin-guard';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import * as React from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page: React.FunctionComponent = async () => {
  return (
    <GuardCapacityComponent
      displayError
      capacityRestriction={[ORGANIZATION_CAPACITY.MANAGE_ACCESS]}>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
