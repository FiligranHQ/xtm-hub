'use client';
import { EpicPage } from '@/components/epic/epic-page';
import {
  EpicListQuery,
  epicsListFragment,
} from '@/components/epic/epic.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { epicsList_epics$key } from '@generated/epicsList_epics.graphql';
import { epicsQuery } from '@generated/epicsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
interface PreloaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PreloaderProps) => {
  const t = useTranslations();
  const queryData = useLazyLoadQuery<epicsQuery>(
    EpicListQuery,
    { count: 500, orderBy: 'epic', orderMode: 'asc' },
    { fetchPolicy: 'network-only' }
  );
  const [data] = useRefetchableFragment<epicsQuery, epicsList_epics$key>(
    epicsListFragment,
    queryData
  );

  const epics =
    data.epics?.edges.map((epic) => epic?.node as epic_fragment$data) ?? [];

  const connectionID = data.epics!.__id;

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: t('Epic.XTMRoadmap'),
      original: true,
    },
  ];
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('Epic.XTMRoadmap')}</h1>
      <EpicPage
        connectionID={connectionID}
        serviceInstance={serviceInstance}
        epics={epics}
      />
    </>
  );
};

export default PageLoader;
