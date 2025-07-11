'use client';
import AdminServiceTab from '@/components/service/admin-service-tab';
import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';
import { useTranslations } from 'next-intl';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Services',
  },
];

const Page = () => {
  const t = useTranslations();

  const queryData = useLazyLoadQuery<serviceQuery>(ServiceListQuery, {
    count: 50,
    orderBy: 'name',
    orderMode: 'asc',
  });
  const [data] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryData);
  const serviceData = data?.serviceInstances?.edges.map(
    (service) => service.node as serviceList_fragment$data
  );
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.Services')}</h1>
      <AdminServiceTab serviceData={serviceData} />
    </>
  );
};

export default Page;
