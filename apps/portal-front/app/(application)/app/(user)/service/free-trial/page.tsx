import GuardCapacityComponent from '@/components/admin-guard';
import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import {
  StartTrialButton,
  StartTrialButtonVariant,
} from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import React from 'react';

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
      label: 'OpenCTI Trial platform',
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />

      <TrialsHeader
        actions={
          <>
            <ContactUsButton variant="outline-primary" />
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
      <RegistrationLearnMore />
    </>
  );
};

export default Page;
