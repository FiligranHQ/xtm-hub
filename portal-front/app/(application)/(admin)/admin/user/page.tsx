import * as React from 'react';
import PageLoader from './page-loader';
import GuardCapacityComponent from '@/components/admin-guard';

export const dynamic = 'force-dynamic';

// Component interface

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <GuardCapacityComponent capacityRestriction={'ADMIN'}>
      <PageLoader />{' '}
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
