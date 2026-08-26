import { FeatureVotingPageLoader } from '@/components/feature-voting/FeatureVotingPageLoader';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import { buildSeoPageMetadata, getBaseUrl } from '@/utils/generate-metadata';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FeatureVoting' });
  const baseUrl = await getBaseUrl();

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname: '/feature-voting',
    title: `${t('Title')} | XTM Hub`,
    description: t('MetaDescription'),
    imageAlt: t('Title'),
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/`,
    },
    {
      label: 'Menu.FeatureVoting',
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <FeatureVotingPageLoader />
      </RelayProvider>
    </>
  );
};

export default Page;
