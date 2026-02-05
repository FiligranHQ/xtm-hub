import GuardCapacityComponent from '@/components/admin-guard';
import { SettingsQuery } from '@/components/login/settings.graphql';
import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/reach-sales-button';
import { SlackSupportButton } from '@/components/service/trial-instances/slack-support';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { FeatureFlag } from '@/utils/constant';
import { APP_PATH } from '@/utils/path/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { settingsQuery } from '@generated/settingsQuery.graphql';
import { notFound } from 'next/navigation';
import React from 'react';
import PersonalSpaceInfo from '../opencti-free-trial/personal-space-info';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: React.FC<Props> = async ({ searchParams }) => {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );

  const featureFlags =
    settingsResponse.data.settings.platform_feature_flags ?? [];
  const isFeatureEnabled = featureFlags.some((flag) =>
    ['*', FeatureFlag.OPENAEVTRIALS].includes(flag)
  );

  if (!isFeatureEnabled) {
    notFound();
  }

  const openTrialFormSearchParams = (await searchParams).openForm;
  const openTrialForm =
    !!openTrialFormSearchParams && !Array.isArray(openTrialFormSearchParams);

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'OpenAEV Trial platform',
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />

      <TrialsHeader
        platformName="OpenAEV"
        actions={
          <>
            <SlackSupportButton />
            <ReachSalesButton variant="outline-primary" />
            <GuardCapacityComponent
              shouldNotBePersonalSpace
              capacityRestriction={[
                OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
                OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
              ]}>
              <StartTrialButton
                variant="gradient"
                openForm={openTrialForm}
                platformIdentifier={PlatformIdentifierEnum.OPENAEV}
              />
            </GuardCapacityComponent>
          </>
        }
      />
      <PersonalSpaceInfo />
      <RegistrationLearnMore
        serviceInstanceTag={ServiceInstanceTagEnum.OPENAEV}
      />
    </>
  );
};

export default Page;
