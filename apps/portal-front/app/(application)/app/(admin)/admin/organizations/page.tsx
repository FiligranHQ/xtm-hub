'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import * as React from 'react';
import PageLoader from './page-loader';

// Component
const Page: React.FunctionComponent = () => {
  return (
    <GuardCapacityComponent displayError>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
