'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import * as React from 'react';
import PageLoader from './page-loader';

// Component
const Page: React.FunctionComponent = () => {
  return (
    <GuardCapacityComponent
      displayError
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
