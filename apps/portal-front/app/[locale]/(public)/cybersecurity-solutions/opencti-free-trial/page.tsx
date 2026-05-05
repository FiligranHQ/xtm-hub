import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { RelayProvider } from '@/relay/relay-provider';
import { GradientButton } from '@filigran/ui/servers';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const Page = async () => {
  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'Service.Trials.OpenCTIPlatformBreadcrumb',
    },
  ];
  const t = await getTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <TrialsHeader
          platformIdentifier={PlatformIdentifierEnum.OPENCTI}
          actions={
            <GradientButton className="bg-white dark:bg-none">
              <Link href="/redirect/create-free-trial">
                {t('Service.Trials.StartTrial')}
              </Link>
            </GradientButton>
          }
        />
        <TrialsLearnMore platformIdentifier={PlatformIdentifierEnum.OPENCTI} />
        <RegistrationLearnMore
          serviceInstanceTag={ServiceInstanceTagEnum.OPENCTI}
        />
      </RelayProvider>
    </>
  );
};

export default Page;
