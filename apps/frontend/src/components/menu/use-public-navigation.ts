import {
  BottomLink,
  SectionConfig,
} from '@/components/menu/use-navigation-type';
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
import { useLocale, useTranslations } from 'next-intl';

export interface PublicNavigationConfig {
  sections: SectionConfig[];
  bottomLinks: BottomLink[];
}

export const usePublicNavigation = (): PublicNavigationConfig => {
  const t = useTranslations();
  const locale = useLocale();

  const sections: SectionConfig[] = [
    {
      key: 'xtm-platform',
      label: t('PublicMenu.XTMPlatform'),
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
          label: t('PublicMenu.StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-dashboards`,
          label: t('PublicMenu.CustomDashboards'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-views`,
          label: t('PublicMenu.CustomViews'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-integrations`,
          label: t('PublicMenu.Integrations'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-playbooks`,
          label: t('PublicMenu.Playbooks'),
        },
        {
          href: 'https://demo.opencti.io',
          label: t('PublicMenu.LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.opencti.io/latest/',
          label: t('PublicMenu.Documentation'),
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
          label: t('PublicMenu.StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/openaev-scenarios`,
          label: t('PublicMenu.Scenarios'),
        },
        {
          href: 'https://demo.openaev.io',
          label: t('PublicMenu.LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.openaev.io/latest',
          label: t('PublicMenu.Documentation'),
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
          label: t('PublicMenu.About'),
          external: true,
        },
        { label: t('PublicMenu.AICatalog'), badge: t('PublicMenu.ComingSoon') },
      ],
    },
  ];

  const bottomLinks: BottomLink[] = [
    {
      key: 'xtm-platform-roadmap',
      href: `/${locale}/cybersecurity-solutions/xtm-platform-roadmap`,
      icon: PapermapIcon,
      label: t('PublicMenu.XTMRoadmap'),
    },
    {
      key: 'filigran-academy',
      href: 'https://academy.filigran.io/',
      icon: SchoolIcon,
      label: t('PublicMenu.FiligranAcademy'),
      external: true,
    },
    {
      key: 'filigran-blog',
      href: 'https://filigran.io/our-blog/',
      icon: PostIcon,
      label: t('PublicMenu.Blog'),
      external: true,
    },
    {
      key: 'slack',
      href: 'https://filigran-community.slack.com',
      icon: SlackIcon,
      label: t('PublicMenu.Slack'),
      external: true,
    },
  ];

  return { sections, bottomLinks };
};
