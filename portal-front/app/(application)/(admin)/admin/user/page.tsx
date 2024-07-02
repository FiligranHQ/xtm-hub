import * as React from 'react';
import PageLoader from './page-loader';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';

export const dynamic = 'force-dynamic';

// Component interface

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <GuardCapacityComponent
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      <PageLoader />{' '}
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
