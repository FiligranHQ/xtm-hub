import Homepage from '@/components/homepage/Homepage';
import type { PublicLocale } from '@/i18n/config';
import {
  buildFiligranOrganizationJsonLd,
  buildSeoPageMetadata,
  getBaseUrl,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname: '/',
    title: t('Title'),
    description: t('ShortDescription'),
    imageAlt: t('SiteName'),
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;

  const baseUrl = await getBaseUrl();
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: tMeta('SiteName'),
    description: tMeta('ShortDescription'),
    url: baseUrl,
    image: `${baseUrl}/seo_default.png`,
    publisher: buildFiligranOrganizationJsonLd(baseUrl),
  };

  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
    />
  );

  return (
    <>
      {jsonLdScript}
      <Homepage paramsLocale={locale} />
    </>
  );
};

export default Page;
