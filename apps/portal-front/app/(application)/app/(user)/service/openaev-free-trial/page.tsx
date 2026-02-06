'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/reach-sales-button';
import { SlackSupportButton } from '@/components/service/trial-instances/slack-support';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { APP_PATH } from '@/utils/path/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { notFound, useSearchParams } from 'next/navigation';
import React from 'react';
import PersonalSpaceInfo from '../opencti-free-trial/personal-space-info';

const Page: React.FC = () => {
  const isOpenAEVTrialsEnabled = useIsFeatureEnabled(FeatureFlag.OPENAEVTRIALS);

  if (!isOpenAEVTrialsEnabled) {
    notFound();
  }

  const searchParams = useSearchParams();
  const openTrialFormSearchParams = searchParams.get('openForm');
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
        platformIdentifier={PlatformIdentifierEnum.OPENAEV}
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
