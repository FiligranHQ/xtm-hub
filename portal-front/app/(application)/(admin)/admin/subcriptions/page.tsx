'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import SubscriptionPage from '@/components/subcription/subscription-page';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return (
    <GuardCapacityComponent
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      <SubscriptionPage />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
