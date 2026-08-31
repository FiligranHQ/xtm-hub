import { PublicFreeTrialContent } from '@/components/service/trial-instances/page/PublicFreeTrialContent';
import type { PublicLocale } from '@/i18n/config';
import {
  buildFiligranOrganizationJsonLd,
  buildSeoPageMetadata,
  getBaseUrl,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { PlatformIdentifier, ServiceInstanceTag } from '@graphql/generated';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const PATHNAME = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/opencti-free-trial`;

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
    title: `${t('Display.opencti.Title')} | XTM Hub`,
    description: t('Display.opencti.FreeTrialDescription'),
    imageAlt: t('XTMPlatform.IllustrationAlt'),
    imageUrl: `${baseUrl}/opencti_ecosystem.png`,
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const t = await getTranslations();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${t('Service.Trials.Display.opencti.Title')} | XTM Hub`,
    description: t('Service.Trials.Display.opencti.FreeTrialDescription'),
    url: `${baseUrl}${PATHNAME}`,
    image: `${baseUrl}/opencti_ecosystem.png`,
    publisher: buildFiligranOrganizationJsonLd(baseUrl),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <PublicFreeTrialContent
        locale={locale}
        platformIdentifier={PlatformIdentifier.Opencti}
        serviceInstanceTag={ServiceInstanceTag.OpenCti}
        breadcrumbLabelKey="Service.Trials.OpenCTIPlatformBreadcrumb"
        redirectHref="/redirect/create-free-trial"
      />
    </>
  );
};

export default Page;
