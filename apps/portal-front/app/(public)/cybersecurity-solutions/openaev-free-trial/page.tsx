import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { RelayProvider } from '@/relay/RelayProvider';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { FeatureFlag } from '@/utils/constant';
import { GradientButton } from '@filigran/ui/servers';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

const Page: React.FC = async () => {
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
          platformName="OpenAEV"
          actions={
            <GradientButton>
              <Link href="/redirect/create-free-trial">
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
