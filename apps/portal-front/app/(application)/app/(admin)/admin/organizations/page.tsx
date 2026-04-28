'use client';
import * as React from 'react';
import GuardCapacityComponent from '../../../../../../src/components/AdminGuard';
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
