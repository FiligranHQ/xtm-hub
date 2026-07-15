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
import { useLocale, useTranslations } from 'next-intl';

export const usePublicNavigation = (): NavigationConfig => {
  const t = useTranslations();
  const locale = useLocale();

  const sections: SectionConfig[] = [
    {
      key: 'xtm-platform',
      label: t('Menu.XTMPlatform'),
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
          label: t('Menu.StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-dashboards`,
          label: t('Menu.CustomDashboards'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-custom-views`,
          label: t('Menu.CustomViews'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-integrations`,
          label: t('Menu.Integrations'),
        },
        {
          href: `/${locale}/cybersecurity-solutions/opencti-playbooks`,
          label: t('Menu.Playbooks'),
        },
        {
          href: 'https://demo.opencti.io',
          label: t('Menu.LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.opencti.io/latest/',
          label: t('Menu.Documentation'),
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
          label: t('Menu.StartFreeTrial'),
          highlight: true,
        },
        {
          href: `/${locale}/cybersecurity-solutions/openaev-scenarios`,
          label: t('Menu.Scenarios'),
        },
        {
          href: 'https://demo.openaev.io',
          label: t('Menu.LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.openaev.io/latest',
          label: t('Menu.Documentation'),
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
          label: t('Menu.About'),
          external: true,
        },
        { label: t('Menu.AICatalog'), badge: t('Menu.ComingSoon') },
      ],
    },
  ];

  const bottomLinks: BottomLink[] = [
    {
      key: 'xtm-platform-roadmap',
      href: `/${locale}/cybersecurity-solutions/xtm-platform-roadmap`,
      icon: PapermapIcon,
      label: t('Menu.XTMRoadmap'),
    },
    {
      key: 'filigran-academy',
      href: 'https://academy.filigran.io/',
      icon: SchoolIcon,
      label: t('Menu.FiligranAcademy'),
      external: true,
    },
    {
      key: 'filigran-blog',
      href: 'https://filigran.io/our-blog/',
      icon: PostIcon,
      label: t('Menu.Blog'),
      external: true,
    },
    {
      key: 'slack',
      href: 'https://filigran-community.slack.com',
      icon: SlackIcon,
      label: t('Menu.Slack'),
      external: true,
    },
  ];

  return { sections, bottomLinks };
};
