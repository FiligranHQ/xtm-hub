'use client';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { epicsList_epics$data } from '@generated/epicsList_epics.graphql';
import { useTranslations } from 'next-intl';

interface PageLoaderProps {
  epics: epicsList_epics$data;
}
const PageLoader = ({ epics }: PageLoaderProps) => {
  const t = useTranslations();

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'MenuLinks.XTMRoadmap',
      original: true,
    },
  ];
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.XTMRoadmap')}</h1>
      {epics.epics.map((epic) => (
        <span key={epic.id}>{epic.short_description}</span>
      ))}
    </>
  );
};

export default PageLoader;
