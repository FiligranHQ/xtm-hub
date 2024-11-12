'use client';

import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

import { portalContext } from '@/components/portal-context';
import OwnedServices from '@/components/service/home/owned-services';
import ServiceList from '@/components/service/service-list';
import { ServiceListQuery } from '@/components/service/service.graphql';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useContext } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery,
} from '../../__generated__/serviceQuery.graphql';
import { userServiceOwnedQuery } from '../../__generated__/userServiceOwnedQuery.graphql';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const { isPersonalSpace } = useContext(portalContext);
  if (isPersonalSpace) {
    return <h2>Bienvenue sur XTM Hub !</h2>;
  }
  const [count, setCount] = useLocalStorage('countServiceOwned', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeServiceOwned',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByServiceOwned',
    'service_name'
  );
  const [queryRef, loadQuery] = useQueryLoader<userServiceOwnedQuery>(
    UserServiceOwnedQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });

  const handleUpdate = useCallback(() => {
    loadQuery(
      {
        count,
        orderBy: 'service_name',
        orderMode: 'asc',
      },
      { fetchPolicy: 'network-only' }
    );
  }, []);

  const [countServiceList, setCountServiceList] = useLocalStorage(
    'countServiceList',
    50
  );
  const [orderModeServiceList, setOrderModeServiceList] =
    useLocalStorage<OrderingMode>('orderModeServiceList', 'asc');
  const [orderByServiceList, setOrderByServiceList] =
    useLocalStorage<ServiceOrdering>('orderByServiceList', 'name');

  const [queryRefServiceList, loadQueryServiceList] =
    useQueryLoader<serviceQuery>(ServiceListQuery);

  useMountingLoader(loadQueryServiceList, {
    count: countServiceList,
    orderBy: orderByServiceList,
    orderMode: orderModeServiceList,
  });

  const t = useTranslations();

  return (
    <>
      <h1 className="mb-l">{t('HomePage.Homepage')}</h1>{' '}
      {queryRef ? <OwnedServices queryRef={queryRef} /> : <Loader />}
      {queryRefServiceList ? (
        <ServiceList
          queryRef={queryRefServiceList}
          onUpdate={handleUpdate}
        />
      ) : (
        <>{t('Utils.Loading')}</>
      )}
    </>
  );
};

// Component export
export default Page;
