import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { RelayProvider } from '@/relay/RelayProvider';
import { GradientButton } from '@filigran/ui/servers';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import React from 'react';

const Page: React.FC = async () => {
  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'OpenCTI Trial platform',
      original: true,
    },
  ];
  const t = await getTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <TrialsHeader
          platformName="OpenCTI"
          actions={
            <GradientButton>
              <Link href="/redirect/create-free-trial">
                {t('Service.Trials.StartTrial')}
              </Link>
            </GradientButton>
          }
        />
        <TrialsLearnMore />
        <RegistrationLearnMore
          serviceInstanceTag={ServiceInstanceTagEnum.OPENCTI}
        />
      </RelayProvider>
    </>
  );
};

export default Page;
