import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import * as React from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page: React.FunctionComponent = async () => {
  return (
    <GuardCapacityComponent
      displayError
      capacityRestriction={[RESTRICTION.CAPABILITY_FRT_MANAGE_USER]}>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
