import GuardCapacityComponent from '@/components/admin-guard';
import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/reach-sales-button';
import { SlackSupportButton } from '@/components/service/trial-instances/slack-support';
import {
  StartTrialButton,
  StartTrialButtonVariant,
} from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import React from 'react';
import PersonalSpaceInfo from '../opencti-free-trial/personal-space-info';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: React.FC<Props> = async ({ searchParams }) => {
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
                variant={StartTrialButtonVariant.Gradient}
                openForm={openTrialForm}
              />
            </GuardCapacityComponent>
          </>
        }
      />
      <PersonalSpaceInfo />
      <TrialsLearnMore />
      <RegistrationLearnMore
        serviceInstanceTag={ServiceInstanceTagEnum.OPENAEV}
      />
    </>
  );
};

export default Page;
