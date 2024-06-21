'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import SubscriptionList from '@/components/subcription/subcription-list';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return (
    <GuardCapacityComponent capacityRestriction={'ADMIN'}>
      <SubscriptionList />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
