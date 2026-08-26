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
    title: `${t('Display.openaev.Title')} | XTM Hub`,
    description: t('Display.openaev.FreeTrialDescription'),
    imageAlt: t('XTMPlatform.IllustrationAlt'),
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
  const t = await getTranslations();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${t('Service.Trials.Display.openaev.Title')} | XTM Hub`,
    description: t('Service.Trials.Display.openaev.FreeTrialDescription'),
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
      <PublicFreeTrialContent
        locale={locale}
        platformIdentifier={PlatformIdentifier.Openaev}
        serviceInstanceTag={ServiceInstanceTag.OpenAev}
        breadcrumbLabelKey="Service.Trials.OpenAEVPlatformBreadcrumb"
        redirectHref="/redirect/create-openaev-free-trial"
      />
    </>
  );
};

export default Page;
