'use client';
import GuardCapacityComponent from '@/components/AdminGuard';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import PageLoader from './page-loader';

// Component
const Page = () => {
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
