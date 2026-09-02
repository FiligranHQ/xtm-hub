import GuardCapacityComponent from '@/components/AdminGuard';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag, OrganizationCapability } from '@graphql/generated';
import { notFound } from 'next/navigation';
import ClientSection from './client-section';

export interface ServiceXtmPlatformBundleManageUsersPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = async ({
  params,
}: ServiceXtmPlatformBundleManageUsersPageProps) => {
  const xtmPlatformTrialEnabled = await isFeatureEnabled(
    FeatureFlag.XtmPlatformTrial
  );
  if (!xtmPlatformTrialEnabled) {
    notFound();
  }

  return (
    <GuardCapacityComponent
      displayError
      shouldNotBePersonalSpace
      capacityRestriction={[
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManagePlatformRegistration,
      ]}>
      <ClientSection params={params} />
    </GuardCapacityComponent>
  );
};

export default Page;
