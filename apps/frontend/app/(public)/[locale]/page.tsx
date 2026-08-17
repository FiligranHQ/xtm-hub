import Homepage from '@/components/homepage/Homepage';
import type { PublicLocale } from '@/i18n/config';
import {
  buildFiligranOrganizationJsonLd,
  buildSeoPageMetadata,
  getBaseUrl,
  getTolgeeForLocale,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const tolgee = await getTolgeeForLocale(locale);
  const t = (key: string) => tolgee.t({ key: `Metadata_${key}` });

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
  const tolgee = await getTolgeeForLocale(locale);
  const t = (key: string) => tolgee.t({ key: `Metadata_${key}` });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('SiteName'),
    description: t('ShortDescription'),
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
