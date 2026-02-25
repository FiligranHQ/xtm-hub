'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import * as React from 'react';
import PageLoader from './page-loader';

// Component
const Page: React.FunctionComponent = () => {
  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[PortalCapabilityEnum.MODIFY_COMPETITORS]}
      displayError>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
