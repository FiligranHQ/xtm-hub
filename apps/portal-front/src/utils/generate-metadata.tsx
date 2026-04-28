import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Metadata } from 'next';
import { serverFetchGraphQL } from '../relay/server-portal-api-fetch';

export const getDefaultMetadata = async (): Promise<Metadata> => {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );
  const baseUrl = settingsResponse.data.settings.base_url_front;
  return {
    title:
      'Your Gateway to Cyber Threat Intelligence & Breach & Attack Simulation | XTM Hub by Filigran',
    description:
      "XTM Hub is your gateway to Filigran's cybersecurity solutions: Cyber Threat Intelligence & Breach & Attack Simulation. Uncover Threats. Take Action.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'XTM Hub by Filigran - Cyber Threat Intelligence Platform',
      description:
        "XTM Hub is your gateway to Filigran's cybersecurity solutions: Cyber Threat Intelligence & Breach & Attack Simulation. Uncover Threats. Take Action.",
      url: baseUrl,
      siteName: 'XTM Hub by Filigran',
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: 'XTM Hub by Filigran',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'XTM Hub by Filigran - Cyber Threat Intelligence Platform',
      description:
        "XTM Hub is your gateway to Filigran's cybersecurity solutions.",
      images: [`${baseUrl}/opengraph-image.png`],
      creator: '@FiligranHQ',
      site: '@FiligranHQ',
    },
    alternates: {
      canonical: baseUrl,
    },
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
