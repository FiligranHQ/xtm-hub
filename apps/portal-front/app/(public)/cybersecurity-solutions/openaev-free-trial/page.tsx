import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { RelayProvider } from '@/relay/RelayProvider';
import { FeatureFlag } from '@/utils/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { GradientButton } from '@filigran/ui/servers';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

const Page: React.FC = async () => {
  const isOpenAEVTrialsEnabled = await isFeatureEnabled(
    FeatureFlag.OPENAEVTRIALS
  );

  if (!isOpenAEVTrialsEnabled) {
    notFound();
  }
  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'OpenAEV Trial platform',
      original: true,
    },
  ];
  const t = await getTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <TrialsHeader
          platformIdentifier={PlatformIdentifierEnum.OPENAEV}
          actions={
            <GradientButton>
              <Link href="/redirect/create-openaev-free-trial">
                {' '}
                {t('Service.Trials.StartTrial')}
              </Link>
            </GradientButton>
          }
        />
        <RegistrationLearnMore
          serviceInstanceTag={ServiceInstanceTagEnum.OPENAEV}
        />
      </RelayProvider>
    </>
  );
};

export default Page;
