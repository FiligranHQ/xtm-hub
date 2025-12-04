'use client';

import GuardCapacityComponent from '@/components/admin-guard';
import {
  StartTrialButton,
  StartTrialButtonVariant,
} from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

const Page = ({}) => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const openTrialForm = searchParams.has('openForm');

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
            <Button
              onClick={() => console.warn('Contact Us')}
              variant="outline-primary">
              {t('Service.Trials.ContactUs')}
            </Button>
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
      <TrialsLearnMore />
    </>
  );
};

export default Page;
