'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import * as React from 'react';
import PageLoader from './page-loader';

// Component
const Page: React.FunctionComponent = () => {
  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[RestrictionEnum.READ_TRIALS]}
      displayError>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
