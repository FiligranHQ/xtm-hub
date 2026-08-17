import { defaultLocale, type PublicLocale, publicLocales } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { TolgeeBase } from '@/tolgee/shared';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { cache } from 'react';

const LOCALE_TAG_MAP: Record<PublicLocale, string> = {
  en: 'en_US',
  ja: 'ja_JP',
};

export const buildFiligranOrganizationJsonLd = (baseUrl: string) =>
  ({
    '@type': 'Organization',
    name: 'Filigran',
    url: 'https://filigran.io',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/filigran-logo.png`,
    },
  }) as const;

// Escapes `<` so `</script>` inside free-text JSON-LD fields can't close the tag early.
export const stringifyJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export const getBaseUrl = cache(async (): Promise<string> => {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );
  return settingsResponse.data.settings.base_url_front;
});

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

export interface BuildSeoPageMetadataParams {
  baseUrl: string;
  locale: PublicLocale;
  pathname: string;
  title: string;
  description: string;
  imageAlt: string;
  /** Falls back to the static `seo_default.png` when omitted. */
  imageUrl?: string | null;
  type?: 'website' | 'article';
}

export function buildSeoPageMetadata({
  baseUrl,
  locale,
  pathname,
  title,
  description,
  imageAlt,
  imageUrl,
  type = 'website',
}: BuildSeoPageMetadataParams): Metadata {
  const ogImageUrl = imageUrl || `${baseUrl}/seo_default.png`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localizedPath(locale, pathname)}`,
      type,
      siteName: 'XTM Hub by Filigran',
      locale: getLocaleTag(locale),
      alternateLocale: getAlternateLocaleTags(locale),
      images: [
        {
          url: ogImageUrl,
          alt: imageAlt,
          width: 1200,
          height: 630,
          type: 'image/png',
        },
      ],
    },
    alternates: buildAlternates(pathname, locale),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export const getTolgeeForLocale = cache(async (locale: PublicLocale) => {
  const tolgee = TolgeeBase().init({ language: locale });
  await tolgee.loadRequired();
  return tolgee;
});

export const getDefaultMetadata = async (
  locale: PublicLocale = defaultLocale,
  pathname: string = '/'
): Promise<Metadata> => {
  const [settingsResponse, tolgee] = await Promise.all([
    serverFetchGraphQL<settingsQuery>(
      SettingsQuery,
      {},
      { cache: 'force-cache' }
    ),
    getTolgeeForLocale(locale),
  ]);
  const t = (key: string) => tolgee.t({ key });

  const baseUrl = settingsResponse.data.settings.base_url_front;
  return {
    title: t('Metadata_Title'),
    description: t('Metadata_Description'),
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: t('Metadata_ShortTitle'),
      description: t('Metadata_Description'),
      url: `${baseUrl}${localizedPath(locale, pathname)}`,
      siteName: t('Metadata_SiteName'),
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: t('Metadata_SiteName'),
        },
      ],
      locale: getLocaleTag(locale),
      alternateLocale: getAlternateLocaleTags(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('Metadata_ShortTitle'),
      description: t('Metadata_ShortDescription'),
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
