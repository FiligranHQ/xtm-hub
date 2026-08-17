import {
  BottomLink,
  NavigationConfig,
  SectionConfig,
} from '@/components/menu/navigation/shared/navigation.type';
import {
  HomeIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
  PapermapIcon,
  PostIcon,
  SchoolIcon,
  SlackIcon,
} from '@filigran/icon';

import { useTolgee, useTranslate } from '@tolgee/react';

export const usePublicNavigation = (): NavigationConfig => {
  const { t } = useTranslate();
  const { language: locale } = useTolgee(['language']);

  const sections: SectionConfig[] = [
    {
      key: 'xtm-platform',
      label: t('Menu_XTMPlatform'),
      icon: HomeIcon,
      pathPrefix: `/${locale}`,
      href: `/${locale}`,
      links: [],
    },
    {
      key: 'opencti',
      label: 'OpenCTI',
      icon: OpenCtiIconIcon,
      pathPrefix: `/${locale}/cybersecurity-solutions/opencti`,
      links: [
        {
          href: `/${locale}/cybersecurity-solutions/opencti-free-trial`,
          label: t('Menu_StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-dashboards`,
          label: t('Menu_CustomDashboards'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-views`,
          label: t('Menu_CustomViews'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-integrations`,
          label: t('Menu_Integrations'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-playbooks`,
          label: t('Menu_Playbooks'),
        },
        {
          href: 'https://demo.opencti.io',
          label: t('Menu_LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.opencti.io/latest/',
          label: t('Menu_Documentation'),
          external: true,
        },
      ],
    },
    {
      key: 'openaev',
      label: 'OpenAEV',
      icon: OpenAevIconIcon,
      pathPrefix: `/${locale}/cybersecurity-solutions/openaev`,
      links: [
        {
          href: `/${locale}/cybersecurity-solutions/openaev-free-trial`,
          label: t('Menu_StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/openaev-scenarios`,
          label: t('Menu_Scenarios'),
        },
        {
          href: 'https://demo.openaev.io',
          label: t('Menu_LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.openaev.io/latest',
          label: t('Menu_Documentation'),
          external: true,
        },
      ],
    },
    {
      key: 'xtm-one',
      label: 'XTM One',
      icon: LogoXtmOneIcon,
      pathPrefix: `/${locale}/cybersecurity-solutions/xtm-one`,
      links: [
        {
          href: 'https://filigran.io/platform/xtm-one/',
          label: t('Menu_About'),
          external: true,
        },
        { label: t('Menu_AICatalog'), badge: t('Menu_ComingSoon') },
      ],
    },
  ];

  const bottomLinks: BottomLink[] = [
    {
      key: 'xtm-platform-roadmap',
      href: `/${locale}/cybersecurity-solutions/xtm-platform-roadmap`,
      icon: PapermapIcon,
      label: t('Menu_XTMRoadmap'),
    },
    {
      key: 'filigran-academy',
      href: 'https://academy.filigran.io/',
      icon: SchoolIcon,
      label: t('Menu_FiligranAcademy'),
      external: true,
    },
    {
      key: 'filigran-blog',
      href: 'https://filigran.io/our-blog/',
      icon: PostIcon,
      label: t('Menu_Blog'),
      external: true,
    },
    {
      key: 'slack',
      href: 'https://filigran-community.slack.com',
      icon: SlackIcon,
      label: t('Menu_Slack'),
      external: true,
    },
  ];

  return { sections, bottomLinks };
};
