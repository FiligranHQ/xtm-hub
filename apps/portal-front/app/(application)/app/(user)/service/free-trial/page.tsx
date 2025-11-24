'use client';

import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { useSearchParams } from 'next/navigation';

const Page = ({}) => {
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
            <ContactUsButton />
            <StartTrialButton openForm={openTrialForm} />
          </>
        }
      />
      <TrialsLearnMore />
    </>
  );
};

export default Page;
