import { defaultLocale, type PublicLocale, publicLocales } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const LOCALE_TAG_MAP: Record<PublicLocale, string> = {
  en: 'en_US',
  ja: 'ja_JP',
};

const localizedPath = (locale: PublicLocale, pathname: string) => {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/${locale}${path === '/' ? '' : path}`;
};

export const buildAlternates = (
  pathname: string,
  currentLocale: PublicLocale
): NonNullable<Metadata['alternates']> => {
  const languages: Record<string, string> = {};
  for (const loc of publicLocales) {
    languages[loc] = localizedPath(loc, pathname);
  }
  languages['x-default'] = localizedPath(defaultLocale, pathname);
  return {
    canonical: localizedPath(currentLocale, pathname),
    languages,
  };
};

export const getLocaleTag = (locale: PublicLocale): string =>
  LOCALE_TAG_MAP[locale];

export const getAlternateLocaleTags = (currentLocale: PublicLocale): string[] =>
  publicLocales.filter((l) => l !== currentLocale).map((l) => getLocaleTag(l));

export const getDefaultMetadata = async (
  locale: PublicLocale = defaultLocale,
  pathname: string = '/'
): Promise<Metadata> => {
  const [settingsResponse, t] = await Promise.all([
    serverFetchGraphQL<settingsQuery>(
      SettingsQuery,
      {},
      { cache: 'force-cache' }
    ),
    getTranslations({ locale, namespace: 'Metadata' }),
  ]);
  const baseUrl = settingsResponse.data.settings.base_url_front;
  return {
    title: t('Title'),
    description: t('Description'),
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: t('ShortTitle'),
      description: t('Description'),
      url: `${baseUrl}${localizedPath(locale, pathname)}`,
      siteName: t('SiteName'),
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: t('SiteName'),
        },
      ],
      locale: getLocaleTag(locale),
      alternateLocale: getAlternateLocaleTags(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ShortTitle'),
      description: t('ShortDescription'),
      images: [`${baseUrl}/opengraph-image.png`],
      creator: '@FiligranHQ',
      site: '@FiligranHQ',
    },
    alternates: buildAlternates(pathname, locale),
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
  };
};
