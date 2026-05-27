'use client';
import GuardCapacityComponent from '@/components/AdminGuard';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import PageLoader from './page-loader';

const Page = () => {
  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[PortalCapabilityEnum.BYPASS]}
      displayError>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

export default Page;
