import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import {
  buildFiligranOrganizationJsonLd,
  buildSeoPageMetadata,
  getBaseUrl,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { GradientButton } from '@filigran/ui/servers';
import { PlatformIdentifier, ServiceInstanceTag } from '@graphql/generated';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const PATHNAME = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/openaev-free-trial`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const t = await getTranslations({ locale, namespace: 'Service.Trials' });

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname: PATHNAME,
    title: `${t('Display_openaev_Title')} | XTM Hub`,
    description: t('Display_openaev_FreeTrialDescription'),
    imageAlt: t('XTMPlatform_IllustrationAlt'),
    imageUrl: `${baseUrl}/openaev_ecosystem.png`,
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const breadcrumbs = [
    {
      label: 'MenuLinks_Home',
      href: `/${locale}`,
    },
    {
      label: 'Service_Trials_OpenAEVPlatformBreadcrumb',
    },
  ];
  const t = await getTranslations();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${t('Service_Trials_Display_openaev_Title')} | XTM Hub`,
    description: t('Service_Trials_Display_openaev_FreeTrialDescription'),
    url: `${baseUrl}${PATHNAME}`,
    image: `${baseUrl}/openaev_ecosystem.png`,
    publisher: buildFiligranOrganizationJsonLd(baseUrl),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <TrialsHeader
          platformIdentifier={PlatformIdentifier.Openaev}
          actions={
            <GradientButton className="bg-background dark:bg-none">
              <Link
                href="/redirect/create-openaev-free-trial"
                prefetch={false}>
                {t('Service_Trials_StartTrial')}
              </Link>
            </GradientButton>
          }
        />
        <TrialsLearnMore platformIdentifier={PlatformIdentifier.Openaev} />
        <RegistrationLearnMore
          serviceInstanceTag={ServiceInstanceTag.OpenAev}
        />
      </RelayProvider>
    </>
  );
};

export default Page;
